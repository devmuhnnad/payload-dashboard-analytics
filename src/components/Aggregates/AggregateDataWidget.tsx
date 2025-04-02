'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { AggregateData, MetricsMap } from '../../types/data.js'
import { PageInfoWidget } from '../../types/widgets.js'
import { useDocumentInfo } from '@payloadcms/ui'
import { useTheme } from '@payloadcms/ui'

type Props = {
  options: PageInfoWidget
  metricsMap: MetricsMap
}

export const AggregateDataWidget: React.FC<Props> = ({ options, metricsMap }) => {
  const [data, setData] = useState<AggregateData>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const theme = useTheme()
  const { savedDocumentData: publishedDoc } = useDocumentInfo()

  const { timeframe, metrics, idMatcher: idMatcherSerialized, label } = options

  const idMatcher = new Function(`return ${idMatcherSerialized}`)()

  const pageId = useMemo(() => {
    if (publishedDoc) return idMatcher(publishedDoc)
    else return ''
  }, [publishedDoc])

  const timeframeIndicator =
    timeframe === 'currentMonth'
      ? new Date().toLocaleString('default', { month: 'long' })
      : (timeframe ?? '30d')

  useEffect(() => {
    if (pageId) {
      const getAggregateData = fetch(`/api/analytics/pageAggregate`, {
        method: 'post',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: timeframe,
          metrics: metrics,
          pageId: pageId,
        }),
      }).then((response) => response.json())

      getAggregateData.then((data: AggregateData) => {
        setData(data)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [publishedDoc, pageId])

  const heading = useMemo(() => {
    if (label) return label

    const metricValues: string[] = []

    Object.entries(metricsMap).forEach(([key, value]) => {
      /* @ts-ignore */
      if (metrics.includes(key)) metricValues.push(value.label)
    })

    return metricValues.join(', ')
  }, [options, metricsMap])

  return (
    <section
      style={{
        marginBottom: '1.5rem',
        border: '1px solid',
        borderColor: 'var(--theme-elevation-100)',
        padding: '1rem',
      }}
    >
      {label !== 'hidden' && (
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          {heading} ({timeframeIndicator})
        </h1>
      )}
      <div>
        {isLoading ? (
          <>Loading...</>
        ) : data.length > 0 ? (
          <ul style={{ margin: '0', listStyle: 'none', padding: '0' }}>
            {data.map((item, index) => {
              const value =
                typeof item.value === 'string'
                  ? Math.floor(parseInt(item.value))
                  : Math.floor(item.value)

              const itemLabel = item.label

              const label = metricsMap?.[itemLabel]?.label ?? itemLabel

              return (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: '700' }}>{label}</div>
                  <div>{value}</div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div>No data found.</div>
        )}
      </div>
    </section>
  )
}
