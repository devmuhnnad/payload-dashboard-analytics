import { GoogleProvider } from '../../types/providers.js'
import { LiveDataOptions } from '../index.js'
import { LiveData } from '../../types/data.js'
import client from './client.js'
import payload from 'payload'

async function getLiveData(provider: GoogleProvider, options: LiveDataOptions) {
  const googleClient = client(provider)

  const request = {
    property: `properties/${provider.propertyId}`,
    dateRanges: [
      {
        startDate: '2023-03-05',
        endDate: 'today',
      },
    ],
    /* dimensions: [{ name: "country" }], */
    metrics: [{ name: 'activeUsers' }],
  }

  const data = await googleClient.run
    .runRealtimeReport(request)
    .then((data) => data[0].rows?.[0]?.metricValues?.[0]?.value ?? null)

  const processedData: LiveData = {
    visitors: data ? parseInt(data) : 0,
  }

  return processedData
}

export default getLiveData
