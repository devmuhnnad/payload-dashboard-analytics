import { Endpoint } from 'payload'
import { ApiProvider } from '../../providers/index.js'
import { RouteOptions } from '../../types/index.js'
import { Payload } from 'payload'
import { differenceInMinutes } from 'date-fns'

const handler = (provider: ApiProvider, options: RouteOptions) => {
  const handler: Endpoint['handler'] = async (req) => {
    const { user } = req
    const payload: Payload = req.payload
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

    try {
      if (cache) {
        const timeNow = new Date()
        const cacheKey = 'liveData'
        const cacheLifetime = options.cache?.routes?.live ?? 5

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
          const data = await provider.getLiveData({})

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
            const data = await provider.getLiveData({})

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
      const data = await provider.getLiveData({})

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
