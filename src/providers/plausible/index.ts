import { PlausibleProvider } from '../../types/providers.js'
import getGlobalAggregateData from './getGlobalAggregateData.js'
import getGlobalChartData from './getGlobalChartData.js'
import getPageAggregateData from './getPageAggregateData.js'
import getPageChartData from './getPageChartData.js'
import getLiveData from './getLiveData.js'
import getReportData from './getReportData.js'
import {
  ApiProvider,
  GlobalAggregateOptions,
  GlobalChartOptions,
  PageChartOptions,
  PageAggregateOptions,
  LiveDataOptions,
  ReportDataOptions,
} from '../index.js'

import { MetricMap } from './utilities.js'

const plausible = (provider: PlausibleProvider): ApiProvider => {
  Object.keys(MetricMap).forEach((key) => {
    if (provider.labels && provider.labels[key as keyof typeof MetricMap]) {
      MetricMap[key as keyof typeof MetricMap].label =
        provider.labels[key as keyof typeof MetricMap] || ''
    }
  })
  return {
    getGlobalAggregateData: async (options: GlobalAggregateOptions) =>
      await getGlobalAggregateData(provider, options),
    getGlobalChartData: async (options: GlobalChartOptions) =>
      await getGlobalChartData(provider, options),
    getPageChartData: async (options: PageChartOptions) =>
      await getPageChartData(provider, options),
    getPageAggregateData: async (options: PageAggregateOptions) =>
      await getPageAggregateData(provider, options),
    getLiveData: async (options: LiveDataOptions) => await getLiveData(provider, options),
    getReportData: async (options: ReportDataOptions) => await getReportData(provider, options),
    metricsMap: MetricMap,
  }
}

export default plausible
