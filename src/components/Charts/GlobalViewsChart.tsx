'use client'
import React, { useEffect, useState, lazy, useMemo } from 'react'
import { ChartDataPoint, ChartData } from '../../types/data.js'
import { AxisOptions } from 'react-charts'
import { useTheme } from '@payloadcms/ui'

type Props = {}

const ChartComponent = lazy(() =>
  import('react-charts').then((module) => {
    return { default: module.Chart }
  }),
)

export const GlobalViewsChart: React.FC<Props> = ({}) => {
  const [chartData, setChartData] = useState<ChartData>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const theme = useTheme()

  useEffect(() => {
    const getChartData = fetch(`/api/analytics/globalChart`, {
      method: 'post',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeframe: 'currentMonth',
        metrics: ['views'],
      }),
    }).then((response) => response.json())

    getChartData.then((data: ChartData) => {
      setChartData(data)
      setIsLoading(false)
    })
  }, [])

  const timeframeIndicator = useMemo(() => {
    return new Date().toLocaleString('default', { month: 'long' })
  }, [])

  const chartLabel = useMemo(() => {
    return 'Views'
  }, [])

  const primaryAxis = React.useMemo<AxisOptions<ChartDataPoint>>(() => {
    return {
      getValue: (datum) => datum.timestamp,
      show: false,
      elementType: 'line',
      showDatumElements: false,
    }
  }, [])

  const secondaryAxes = React.useMemo<AxisOptions<ChartDataPoint>[]>(
    () => [
      {
        getValue: (datum) => {
          return datum.value
        },
        elementType: 'line',
      },
    ],
    [],
  )

  return (
    <section
      style={{
        marginBottom: '1.5rem',
        maxWidth: '70rem',
      }}
    >
      {chartData?.length && chartData.length > 0 ? (
        <>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            {chartLabel} ({timeframeIndicator})
          </h1>
          <div style={{ minHeight: '200px', position: 'relative' }}>
            <ChartComponent
              options={{
                data: chartData,
                dark: theme.theme === 'dark',
                initialHeight: 220,
                tooltip: false,
                /* @ts-ignore */
                primaryAxis,
                /* @ts-ignore */
                secondaryAxes,
              }}
            />
          </div>
        </>
      ) : isLoading ? (
        <> Loading...</>
      ) : (
        <div>No data found for {chartLabel}.</div>
      )}
    </section>
  )
}
