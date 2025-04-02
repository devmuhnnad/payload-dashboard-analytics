import {
  PageInfoWidget,
  PageChartWidget,
  PageWidgets,
  NavigationWidgets,
  DashboardWidgets,
} from '../types/widgets.js'
import { MetricsMap } from '../types/data.js'
import { CustomComponent, Field } from 'payload'

export const PageWidgetMap: Record<
  PageWidgets['type'],
  (config: any, index: number, metricsMap: MetricsMap) => Field
> = {
  chart: (config: PageChartWidget, index: number, metricsMap: MetricsMap) => ({
    type: 'ui',
    name: `chart_${index}_${config.timeframe ?? '30d'}`,
    admin: {
      position: 'sidebar',
      components: {
        Field: {
          path: 'payload-dashboard-analytics/ui',
          exportName: 'PageViewsChart',
          clientProps: {
            options: config,
            metricsMap,
          },
        },
      },
    },
  }),
  info: (config: PageInfoWidget, index: number, metricsMap: MetricsMap) => ({
    type: 'ui',
    name: `info_${index}_${config.timeframe ?? '30d'}`,
    admin: {
      position: 'sidebar',
      components: {
        Field: {
          path: 'payload-dashboard-analytics/ui',
          exportName: 'AggregateDataWidget',
          clientProps: {
            options: config,
            metricsMap,
          },
        },
      },
    },
  }),
}

export const NavigationWidgetMap: Record<NavigationWidgets['type'], CustomComponent> = {
  live: 'payload-dashboard-analytics/ui#LiveDataWidget',
}

export const DashboardWidgetMap: Record<DashboardWidgets, CustomComponent> = {
  topPages: 'payload-dashboard-analytics/ui#TopPages',
  viewsChart: 'payload-dashboard-analytics/ui#GlobalViewsChart',
}
