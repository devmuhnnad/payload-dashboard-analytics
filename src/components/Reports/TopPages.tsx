'use client'
import React, { useEffect, useState, lazy, useReducer, useRef, useMemo } from 'react'

import { ReportData } from '../../types/data.js'
interface Props {}

export const TopPages: React.FC<Props> = () => {
  const [data, setData] = useState<ReportData>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  /* const { label } = options; */

  useEffect(() => {
    const getLiveData = fetch(`/api/analytics/report`, {
      method: 'post',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: ['views'],
        property: 'page',
      }),
    }).then((response) => response.json())

    getLiveData.then((data: ReportData) => {
      setData(data)
      setIsLoading(false)
    })
  }, [])

  return (
    <section
      style={{
        marginBottom: '1.5rem',
        border: '1px solid',
        borderColor: 'var(--theme-elevation-100)',
        padding: '1rem',
        width: '100%',
        maxWidth: '70rem',
      }}
    >
      <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{'Top pages'}</h1>
      <div>
        {isLoading ? (
          <>Loading...</>
        ) : (
          <ul style={{ margin: '0', listStyle: 'none', padding: '0' }}>
            {data?.map((item, itemIndex) => {
              const property = Object.keys(item)[0]

              return (
                <li
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: '0.5rem',
                  }}
                  key={itemIndex}
                >
                  <div style={{ fontWeight: '700' }}>{item[property]}</div>
                  {item.values.map((value, valueIndex) => {
                    const valueKey = Object.keys(value)[0]

                    return <div key={valueIndex}>{value[valueKey]}</div>
                  })}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
