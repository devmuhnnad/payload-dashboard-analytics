import type { Metrics, Properties } from "./widgets";

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
}

export interface ChartDataSeries {
  label: string;
  data: ChartDataPoint[];
}

export type ChartData = ChartDataSeries[];

export type AggregateData = Array<{
  label: Metrics;
  value: string | number;
}>;

export type LiveData = {
  visitors: number;
};

export type ReportData = {}[];

export type MetricsMap = Record<Metrics, { label: string; value: string }>;

export type PropertyMap = Record<Properties, { label: string; value: string }>;
