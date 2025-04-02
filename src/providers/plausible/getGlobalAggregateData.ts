import { PlausibleProvider } from '../../types/providers.js'
import { GlobalAggregateOptions } from '../index.js'
import client from './client.js'

async function getGlobalAggregateData(
  provider: PlausibleProvider,
  options: GlobalAggregateOptions,
) {
  const plausibleClient = client(provider, {
    endpoint: '/stats/aggregate',
    timeframe: options.timeframe,
    metrics: options.metrics,
  })

  const data = await plausibleClient.fetch().then((response) => {
    return response.json()
  })

  return data
}

export default getGlobalAggregateData
