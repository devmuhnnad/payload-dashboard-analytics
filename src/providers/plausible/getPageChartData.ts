import { PlausibleProvider } from '../../types/providers.js'
import { PageChartOptions } from '../index.js'
import { ChartData } from '../../types/data.js'
import { MetricMap } from './utilities.js'
import payload from 'payload'
import client from './client.js'

async function getPageChartData(provider: PlausibleProvider, options: PageChartOptions) {
  const plausibleClient = client(provider, {
    endpoint: '/stats/timeseries',
    timeframe: options?.timeframe,
    metrics: options.metrics,
  })

  const url = plausibleClient.url

  const pageFilter = `event:page==${options.pageId}`

  url.searchParams.append('filters', pageFilter)

  const { results } = await plausibleClient
    .fetch(url.toString())
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      payload.logger.error(error)
    })

  // @todo: fix types later
  // @ts-ignore
  const dataSeries: ChartData = options.metrics.map((metric) => {
    const mappedMetric = Object.entries(MetricMap).find(([key, value]) => {
      return metric === key
    })

    if (mappedMetric) {
      const data = results.map((item: any) => {
        return {
          timestamp: item.date,
          value: item[mappedMetric[1].value],
        }
      })

      return {
        label: mappedMetric[1].label,
        data: data,
      }
    }
  })

  return dataSeries
}

export default getPageChartData
