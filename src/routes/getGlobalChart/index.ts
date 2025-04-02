import { Endpoint } from 'payload'
import { ApiProvider } from '../../providers/index.js'
import { RouteOptions } from '../../types/index.js'
import handler from './handler.js'

const getGlobalChart = (provider: ApiProvider, options: RouteOptions): Endpoint => {
  return {
    path: '/analytics/globalChart',
    method: 'post',
    handler: handler(provider, options),
  }
}

export default getGlobalChart
