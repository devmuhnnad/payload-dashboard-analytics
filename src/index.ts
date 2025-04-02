import { Config as PayloadConfig, CollectionConfig, GlobalConfig } from 'payload'
import { DashboardAnalyticsConfig } from './types/index.js'

import getProvider from './providers/index.js'

import getGlobalAggregate from './routes/getGlobalAggregate/index.js'
import getGlobalChart from './routes/getGlobalChart/index.js'
import getPageChart from './routes/getPageChart/index.js'
import getPageAggregate from './routes/getPageAggregate/index.js'
import getLive from './routes/getLive/index.js'
import getReport from './routes/getReport/index.js'

import { PageWidgetMap, NavigationWidgetMap, DashboardWidgetMap } from './utilities/widgetMaps.js'

export const dashboardAnalytics =
  (incomingConfig: DashboardAnalyticsConfig) =>
  (config: PayloadConfig): PayloadConfig => {
    const { admin, collections, globals } = config
    const { provider, navigation, dashboard, access, cache, labels } = incomingConfig
    const endpoints = config.endpoints ?? []
    const apiProvider = getProvider({ ...provider, labels })

    const cacheSlug = typeof cache === 'object' ? (cache?.slug ?? 'analyticsData') : 'analyticsData'

    const cacheCollection: CollectionConfig = {
      slug: cacheSlug,
      admin: {
        defaultColumns: ['id', 'cacheTimestamp', 'cacheKey'],
      },
      access: {
        read: () => false,
        update: () => false,
        create: () => false,
        delete: () => false,
      },
      fields: [
        {
          type: 'text',
          name: 'cacheKey',
        },
        {
          type: 'text',
          name: 'cacheTimestamp',
        },
        {
          type: 'json',
          name: 'data',
        },
      ],
    }

    const routeOptions = {
      access: access,
      cache: {
        ...(typeof cache === 'object' ? cache : {}),
        slug: cacheSlug,
      },
    }

    const processedConfig: PayloadConfig = {
      ...config,
      admin: {
        ...admin,
        components: {
          ...admin?.components,
          ...(navigation?.beforeNavLinks && {
            beforeNavLinks: [
              ...(admin?.components?.beforeNavLinks ?? []),
              ...navigation.beforeNavLinks.map((widget) => NavigationWidgetMap[widget.type]),
            ],
          }),
          ...(navigation?.afterNavLinks && {
            afterNavLinks: [
              ...(admin?.components?.afterNavLinks ?? []),
              ...navigation.afterNavLinks.map((widget) => NavigationWidgetMap[widget.type]),
            ],
          }),
          ...(dashboard?.beforeDashboard && {
            beforeDashboard: [
              ...(admin?.components?.beforeDashboard ?? []),
              ...dashboard.beforeDashboard.map((widget) => DashboardWidgetMap[widget]),
            ],
          }),
          ...(dashboard?.afterDashboard && {
            afterDashboard: [
              ...(admin?.components?.afterDashboard ?? []),
              ...dashboard.afterDashboard.map((widget) => DashboardWidgetMap[widget]),
            ],
          }),
        },
      },
      endpoints: [
        ...endpoints,
        getGlobalAggregate(apiProvider, routeOptions),
        getGlobalChart(apiProvider, routeOptions),
        getPageChart(apiProvider, routeOptions),
        getPageAggregate(apiProvider, routeOptions),
        getLive(apiProvider, routeOptions),
        getReport(apiProvider, routeOptions),
      ],

      collections: [
        ...(collections
          ? collections.map((collection) => {
              const targetCollection = incomingConfig.collections?.find((pluginCollection) => {
                if (pluginCollection.slug === collection.slug) return true
                return false
              })

              if (targetCollection) {
                const collectionConfigWithHooks: CollectionConfig = {
                  ...collection,
                  fields: [
                    ...collection.fields,
                    ...targetCollection.widgets.map((widget, index) => {
                      const idMatcherSerialized = widget.idMatcher.toString()

                      const field = PageWidgetMap[widget.type]

                      return field(
                        { ...widget, idMatcher: idMatcherSerialized },
                        index,
                        apiProvider.metricsMap,
                      )
                    }),
                  ],
                }

                return collectionConfigWithHooks
              }

              return collection
            })
          : []),
        ...(cache ? [cacheCollection] : []),
      ],
      ...(globals && {
        globals: globals.map((global) => {
          const targetGlobal = incomingConfig.globals?.find((pluginGlobal) => {
            if (pluginGlobal.slug === global.slug) return true
            return false
          })

          if (targetGlobal) {
            const globalConfigWithHooks: GlobalConfig = {
              ...global,
              fields: [
                ...global.fields,
                ...targetGlobal.widgets.map((widget, index) => {
                  const field = PageWidgetMap[widget.type]
                  const idMatcherSerialized = widget.idMatcher.toString()

                  return field(
                    { ...widget, idMatcher: idMatcherSerialized },
                    index,
                    apiProvider.metricsMap,
                  )
                }),
              ],
            }

            return globalConfigWithHooks
          }

          return global
        }),
      }),
    }

    return processedConfig
  }

dashboardAnalytics
