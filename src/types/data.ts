import { Metrics, Properties } from './widgets.js'

export interface ChartDataPoint {
  timestamp: string
  value: number
}

export interface ChartDataSeries {
  label: string
  data: ChartDataPoint[]
}

export type ChartData = ChartDataSeries[]

export type AggregateData = Array<{
  label: Metrics
  value: string | number
}>

export type LiveData = {
  visitors: number
}

type ReportDataIndex = {
  [label: string]: string
}

type ReportDataValues = {
  values: { [value: string]: string | number }[]
}

export type ReportData = (ReportDataIndex & ReportDataValues)[]

export type MetricsMap = Record<Metrics, { label: string; value: string }>

export type PropertiesMap = Record<Properties, { label: string; value: string }>
