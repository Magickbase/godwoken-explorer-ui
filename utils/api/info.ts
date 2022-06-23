import { API_ENDPOINT } from './utils'

type Version = Record<'godwokenVersion' | 'web3IndexerVersion' | 'web3Version', string>

export const fetchVersion = (): Promise<Version> => fetch(`${API_ENDPOINT}/poly_versions`).then(res => res.json())
