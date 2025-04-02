import { Endpoint } from 'payload'
import handler from './handler.js'
import { ApiProvider } from '../../providers/index.js'
import { RouteOptions } from '../../types/index.js'

const getReport = (provider: ApiProvider, options: RouteOptions): Endpoint => {
  return {
    path: '/analytics/report',
    method: 'post',
    handler: handler(provider, options),
  }
}

export default getReport
