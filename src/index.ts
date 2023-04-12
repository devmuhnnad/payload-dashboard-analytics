import type { Config as PayloadConfig } from "payload/config";
import type { DashboardAnalyticsConfig } from "./types";

import { extendWebpackConfig } from "./extendWebpackConfig";
import getProvider from "./providers";

import getGlobalAggregate from "./routes/getGlobalAggregate";
import getGlobalChart from "./routes/getGlobalChart";
import getPageChart from "./routes/getPageChart";
import getPageAggregate from "./routes/getPageAggregate";
import getLive from "./routes/getLive";
import getReport from "./routes/getReport";

import type { CollectionConfig } from "payload/dist/collections/config/types";
import type { GlobalConfig } from "payload/dist/globals/config/types";

import {
  PageWidgetMap,
  NavigationWidgetMap,
  DashboardWidgetMap,
} from "./utilities/widgetMaps";

const payloadDashboardAnalytics =
  (incomingConfig: DashboardAnalyticsConfig) =>
  (config: PayloadConfig): PayloadConfig => {
    const { admin, collections, globals } = config;
    const { provider, navigation, dashboard } = incomingConfig;
    const endpoints = config.endpoints ?? [];
    const apiProvider = getProvider(provider);

    const processedConfig: PayloadConfig = {
      ...config,
      admin: {
        ...admin,
        components: {
          ...admin?.components,
          ...(navigation?.beforeNavLinks && {
            beforeNavLinks: [
              ...(admin?.components?.beforeNavLinks ?? []),
              ...navigation.beforeNavLinks.map(
                (widget) => NavigationWidgetMap[widget.type]
              ),
            ],
          }),
          ...(navigation?.afterNavLinks && {
            afterNavLinks: [
              ...(admin?.components?.afterNavLinks ?? []),
              ...navigation.afterNavLinks.map(
                (widget) => NavigationWidgetMap[widget.type]
              ),
            ],
          }),
          ...(dashboard?.beforeDashboard && {
            beforeDashboard: [
              ...(admin?.components?.beforeDashboard ?? []),
              ...dashboard.beforeDashboard.map(
                (widget) => DashboardWidgetMap[widget]
              ),
            ],
          }),
          ...(dashboard?.afterDashboard && {
            afterDashboard: [
              ...(admin?.components?.afterDashboard ?? []),
              ...dashboard.afterDashboard.map(
                (widget) => DashboardWidgetMap[widget]
              ),
            ],
          }),
        },
        webpack: extendWebpackConfig(config),
      },
      endpoints: [
        ...endpoints,
        getGlobalAggregate(apiProvider),
        getGlobalChart(apiProvider),
        getPageChart(apiProvider),
        getPageAggregate(apiProvider),
        getLive(apiProvider),
        getReport(apiProvider),
      ],
      ...(collections && {
        collections: collections.map((collection) => {
          const targetCollection = incomingConfig.collections?.find(
            (pluginCollection) => {
              if (pluginCollection.slug === collection.slug) return true;
              return false;
            }
          );

          if (targetCollection) {
            const collectionConfigWithHooks: CollectionConfig = {
              ...collection,
              fields: [
                ...collection.fields,
                ...targetCollection.widgets.map((widget, index) => {
                  const field = PageWidgetMap[widget.type];

                  return field(widget, index, apiProvider.metricsMap);
                }),
              ],
            };

            return collectionConfigWithHooks;
          }

          return collection;
        }),
      }),
      ...(globals && {
        globals: globals.map((global) => {
          const targetGlobal = incomingConfig.globals?.find((pluginGlobal) => {
            if (pluginGlobal.slug === global.slug) return true;
            return false;
          });

          if (targetGlobal) {
            const globalConfigWithHooks: GlobalConfig = {
              ...global,
              fields: [
                ...global.fields,
                ...targetGlobal.widgets.map((widget, index) => {
                  const field = PageWidgetMap[widget.type];

                  return field(widget, index, apiProvider.metricsMap);
                }),
              ],
            };

            return globalConfigWithHooks;
          }

          return global;
        }),
      }),
    };

    return processedConfig;
  };

export default payloadDashboardAnalytics;
