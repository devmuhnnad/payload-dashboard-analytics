import { GoogleProvider } from '../../types/providers.js'
import { Metrics, Properties } from '../../types/widgets.js'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { MetricMap, PropertyMap } from './utilities.js'

type ClientOptions = {}

function client(provider: GoogleProvider, options?: ClientOptions) {
  const analyticsDataClient = new BetaAnalyticsDataClient({
    ...(provider.credentials ? { keyFilename: provider.credentials } : {}),
  })

  return {
    run: analyticsDataClient,
  }
}

export default client
