import { PlausibleProvider } from '../../types/providers.js'
import { PageAggregateOptions } from '../index.js'
import { AggregateData } from '../../types/data.js'
import { MetricMap } from './utilities.js'
import client from './client.js'

async function getPageAggregateData(provider: PlausibleProvider, options: PageAggregateOptions) {
  const plausibleClient = client(provider, {
    endpoint: '/stats/aggregate',
    timeframe: options?.timeframe,
    metrics: options.metrics,
  })

  const url = plausibleClient.url

  const pageFilter = `event:page==${options.pageId}`

  url.searchParams.append('filters', pageFilter)

  const data = await plausibleClient.fetch(url.toString()).then((response) => response.json())

  const processedData: AggregateData = Object.entries(data.results).map(([label, value]: any) => {
    const labelAsMetric = Object.values(MetricMap).find((item) => {
      return label === item.value
    })

    return {
      label: labelAsMetric?.label ?? label,
      value: value.value,
    }
  })
  return processedData
}

export default getPageAggregateData
