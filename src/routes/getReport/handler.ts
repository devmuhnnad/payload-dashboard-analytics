import { Endpoint } from 'payload'
import { ApiProvider } from '../../providers/index.js'
import { RouteOptions } from '../../types/index.js'
import { Payload } from 'payload'
import { dayInMinutes } from '../../utilities/timings.js'
import { differenceInMinutes } from 'date-fns'

const handler = (provider: ApiProvider, options: RouteOptions) => {
  const handler: Endpoint['handler'] = async (req) => {
    const { user } = req
    const payload: Payload = req.payload
    const { property, metrics, timeframe } = req.json ? await req.json() : {}
    const { access, cache } = options

    if (access) {
      const accessControl = access(user)

      payload.logger.error('📊 Analytics API: Request fails access control.')
      if (!accessControl) {
        return Response.json(
          {
            message: '📊 Analytics API: Request fails access control.',
          },
          {
            status: 500,
          },
        )
      }
    }

    if (!metrics) {
      payload.logger.error('📊 Analytics API: Missing metrics argument.')
      return Response.json(
        {
          error: true,
          message: 'Missing metrics argument.',
        },
        {
          status: 500,
        },
      )
    }

    if (!property) {
      payload.logger.error('📊 Analytics API: Missing property argument.')
      return Response.json(
        {
          error: true,
          message: 'Missing property argument.',
        },
        {
          status: 500,
        },
      )
    }

    try {
      if (cache) {
        const timeNow = new Date()
        const cacheKey = `report|${metrics.join('-')}|${timeframe ?? '30d'}|${property}`
        const cacheLifetime = options.cache?.routes?.report ?? dayInMinutes

        const {
          docs: [cachedData],
        } = await payload.find({
          collection: cache.slug,
          where: {
            and: [
              {
                cacheKey: {
                  equals: cacheKey,
                },
              },
            ],
          },
        })

        if (!cachedData) {
          const data = await provider
            .getReportData({
              property,
              metrics,
              timeframe,
            })
            .catch((error) => payload.logger.error(error))

          await payload.create({
            collection: cache.slug,
            data: {
              cacheKey: cacheKey,
              cacheTimestamp: timeNow.toISOString(),
              data: data,
            },
          })

          return Response.json(data)
        }

        if (cachedData) {
          if (differenceInMinutes(timeNow, Date.parse(cachedData.cacheTimestamp)) > cacheLifetime) {
            const data = await provider
              .getReportData({
                property,
                metrics,
                timeframe,
              })
              .catch((error) => payload.logger.error(error))

            await payload.update({
              id: cachedData.id,
              collection: cache.slug,
              data: {
                cacheKey: cacheKey,
                cacheTimestamp: timeNow.toISOString(),
                data: data,
              },
            })

            return Response.json(data)
          } else {
            return Response.json(cachedData.data)
          }
        }
      }

      const data = await provider
        .getReportData({
          property,
          metrics,
          timeframe,
        })
        .catch((error) => payload.logger.error(error))

      return Response.json(data)
    } catch (error) {
      payload.logger.error(error)
      return Response.json(
        {
          error: true,
          message: `📊 Analytics API: ${error}`,
        },
        {
          status: 500,
        },
      )
    }
  }

  return handler
}

export default handler
