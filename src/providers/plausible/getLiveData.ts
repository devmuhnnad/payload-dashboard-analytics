import { PlausibleProvider } from '../../types/providers.js'
import { LiveDataOptions } from '../index.js'
import { LiveData } from '../../types/data.js'
import client from './client.js'

async function getLiveData(provider: PlausibleProvider, options: LiveDataOptions) {
  const plausibleClient = client(provider, {
    endpoint: '/stats/realtime/visitors',
  })

  const data = await plausibleClient.fetch().then((response) => {
    return response.json()
  })

  const processedData: LiveData = {
    visitors: data,
  }

  return processedData
}

export default getLiveData
