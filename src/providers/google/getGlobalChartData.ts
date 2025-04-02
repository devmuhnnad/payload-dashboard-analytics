import { GoogleProvider } from '../../types/providers.js'
import { GlobalChartOptions } from '../index.js'
import { ChartData } from '../../types/data.js'
import { getMetrics, getDateRange, DateFormat, GoogleDateFormat } from './utilities.js'
import client from './client.js'
import { protos } from '@google-analytics/data'
import { Timeframes } from '../../types/widgets.js'
import { eachDayOfInterval, parse, isEqual, format } from 'date-fns'

async function getGlobalChartData(provider: GoogleProvider, options: GlobalChartOptions) {
  const googleClient = client(provider)

  const { metrics } = options
  const timeframe: Timeframes = (options.timeframe as Timeframes) ?? '30d'

  const usedMetrics = getMetrics(metrics)

  const dateRange = getDateRange(timeframe)

  const dates = eachDayOfInterval({
    start: dateRange.dates.startDate,
    end: dateRange.dates.endDate,
  })

  const request: protos.google.analytics.data.v1beta.IRunReportRequest = {
    property: `properties/${provider.propertyId}`,
    dateRanges: [dateRange.formatted],
    dimensions: [{ name: 'date' }],
    metrics: usedMetrics.map((metric) => {
      return {
        name: metric,
      }
    }),
    keepEmptyRows: false,
    metricAggregations: [],
  }

  const data = await googleClient.run.runReport(request).then((data) => data)

  const processedData: ChartData = usedMetrics.map((metric, index) => {
    return {
      label: metrics[index],
      data: dates.map((date: Date) => {
        const matchingRow = data[0].rows?.find((row) => {
          if (row.dimensionValues?.[0].value) {
            const parsedDate = parse(row.dimensionValues[0].value, GoogleDateFormat, new Date())

            return isEqual(date, parsedDate)
          }

          return false
        })

        if (matchingRow) {
          const value = matchingRow.metricValues?.[index]?.value

          return {
            timestamp: format(date, DateFormat),
            value: value ? parseInt(value) : 0,
          }
        } else {
          return {
            timestamp: format(date, DateFormat),
            value: 0,
          }
        }
      }),
    }
  })

  return processedData
}

export default getGlobalChartData
