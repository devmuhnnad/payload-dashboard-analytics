import { PlausibleProvider, GoogleProvider } from './providers.js'
import { DashboardWidgets, PageWidgets, NavigationWidgets } from './widgets.js'

export interface ItemConfig {
  widgets: DashboardWidgets[]
}

export interface PageItemConfig {
  widgets: PageWidgets[]
}

export interface Collection extends PageItemConfig {
  slug: string
}

export interface Global extends PageItemConfig {
  slug: string
}

export type Provider = PlausibleProvider | GoogleProvider

export type AccessControl = (user: any) => boolean

export type CacheConfig = {
  slug: string
  routes?: {
    globalAggregate?: number
    globalChart?: number
    pageAggregate?: number
    pageChart?: number
    report?: number
    live?: number
  }
}

export type RouteOptions = {
  access?: AccessControl
  cache?: CacheConfig
}

export type Labels = {
  views?: string
  visitors?: string
  bounceRate?: string
  sessionDuration?: string
  sessions?: string
}

export type DashboardAnalyticsConfig = {
  provider: Provider
  access?: AccessControl
  cache?: boolean | CacheConfig
  collections?: Collection[]
  globals?: Global[]
  labels?: Labels
  navigation?: {
    beforeNavLinks?: NavigationWidgets[]
    afterNavLinks?: NavigationWidgets[]
  }
  dashboard?: {
    beforeDashboard?: DashboardWidgets[]
    afterDashboard?: DashboardWidgets[]
  }
}
