import { GoogleProvider } from '../../types/providers.js'
import { PageAggregateOptions } from '../index.js'
import { AggregateData } from '../../types/data.js'
import { getMetrics, getDateRange } from './utilities.js'
import client from './client.js'
import { protos } from '@google-analytics/data'
import { Timeframes } from '../../types/widgets.js'

async function getPageAggregateData(provider: GoogleProvider, options: PageAggregateOptions) {
  const googleClient = client(provider)

  const { metrics, pageId } = options
  const timeframe: Timeframes = (options.timeframe as Timeframes) ?? '30d'

  const usedMetrics = getMetrics(metrics)

  const dateRange = getDateRange(timeframe)

  const request: protos.google.analytics.data.v1beta.IRunReportRequest = {
    property: `properties/${provider.propertyId}`,
    dateRanges: [dateRange.formatted],
    dimensions: [{ name: 'pagePath' }],
    metrics: usedMetrics.map((metric) => {
      return {
        name: metric,
      }
    }),
    keepEmptyRows: false,
    metricAggregations: [1],
    dimensionFilter: {
      andGroup: {
        expressions: [
          {
            filter: {
              fieldName: 'pagePath',
              stringFilter: {
                matchType: 'EXACT',
                value: pageId,
                caseSensitive: true,
              },
            },
          },
        ],
      },
    },
  }

  const data = await googleClient.run.runReport(request).then((data) => data)

  const processedData: AggregateData = usedMetrics.map((metric, index) => {
    return {
      label: metrics[index],
      value: data[0].totals?.[0].metricValues?.[index].value ?? 0,
    }
  })

  return processedData
}

export default getPageAggregateData
