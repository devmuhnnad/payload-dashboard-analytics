import { DashboardAnalyticsConfig } from './index.js'

export interface PlausibleProvider {
  source: 'plausible'
  apiSecret: string
  siteId: string
  host?: string
  labels?: DashboardAnalyticsConfig['labels']
}

export interface GoogleProvider {
  source: 'google'
  propertyId: string
  credentials?: string
  labels?: DashboardAnalyticsConfig['labels']
}
