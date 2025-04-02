import plausible from './plausible/index.js'
import google from './google/index.js'
import { Provider } from '../types/index.js'
import { ChartWidget, InfoWidget, ReportWidget } from '../types/widgets.js'
import { ChartData, AggregateData, LiveData, ReportData, MetricsMap } from '../types/data.js'

type BaseOptions = {
  timeframe?: string
}

export interface LiveDataOptions {}

export interface ReportDataOptions extends BaseOptions {
  metrics: ReportWidget['metrics']
  property: ReportWidget['property']
}

export interface GlobalAggregateOptions extends BaseOptions {
  metrics: InfoWidget['metrics']
}
export interface GlobalChartOptions extends BaseOptions {
  metrics: ChartWidget['metrics']
}

export interface PageAggregateOptions extends BaseOptions {
  metrics: InfoWidget['metrics']
  pageId: string
}
export interface PageChartOptions extends BaseOptions {
  metrics: ChartWidget['metrics']
  pageId: string
}

export type ApiProvider = {
  getGlobalAggregateData: (options: GlobalAggregateOptions) => Promise<AggregateData>
  getGlobalChartData: (options: GlobalChartOptions) => Promise<ChartData>
  getPageAggregateData: (options: PageAggregateOptions) => Promise<AggregateData>
  getPageChartData: (options: PageChartOptions) => Promise<ChartData>
  getLiveData: (options: LiveDataOptions) => Promise<LiveData>
  getReportData: (options: ReportDataOptions) => Promise<ReportData>
  metricsMap: MetricsMap
}

const getProvider = (provider: Provider) => {
  switch (provider.source) {
    case 'plausible':
      return plausible(provider)
    case 'google':
      return google(provider)
  }
}

export default getProvider
