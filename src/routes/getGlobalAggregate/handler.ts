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

    const { timeframe, metrics } = req.json ? await req.json() : {}
    const { access, cache } = options

    if (access) {
      const accessControl = access(user)

      if (!accessControl) {
        payload.logger.error('📊 Analytics API: Request fails access control.')
        return Response.json(
          {
            message: 'Request fails access control. Are you authenticated?',
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
          message: 'Missing metrics argument.',
        },
        {
          status: 500,
        },
      )
    }

    try {
      if (cache) {
        const timeNow = new Date()
        const cacheKey = `globalAggregate|${metrics.join('-')}|${timeframe ?? '30d'}`
        const cacheLifetime = options.cache?.routes?.pageAggregate ?? dayInMinutes

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
            .getGlobalAggregateData({
              timeframe,
              metrics,
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

          return Response.json(data, {
            status: 200,
          })
        }

        if (cachedData) {
          if (differenceInMinutes(timeNow, Date.parse(cachedData.cacheTimestamp)) > cacheLifetime) {
            const data = await provider
              .getGlobalAggregateData({
                timeframe,
                metrics,
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
        .getGlobalAggregateData({
          timeframe,
          metrics,
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
