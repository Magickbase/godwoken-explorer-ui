import { SERVER_URL, pretreat } from './utils'

interface RawContract {
  balance: string
  compiler_file_format: string
  compiler_version: string
  deployment_tx_hash: string
  id: number
  name: string
  other_info: string | null
  tx_count: number
  registry_address: string
}

interface ParsedContract {
  address: string
  balance: string
  compiler: {
    fileFormat: string
    version: string
  }
  id: number
  name: string
  info: string | null
  txCount: number
}

interface Raw {
  data: Array<{ attributes: RawContract }>
  meta: Record<'current_page' | 'total_page', number>
}

interface Parsed {
  contracts: Array<ParsedContract>
  meta: Record<'page' | 'totalPage' | 'pageSize', number>
}

export const getContractListRes = (contractListRes: Raw, pageSize: number): Parsed => ({
  contracts: contractListRes.data.map(({ attributes: c }) => ({
    address: c.registry_address,
    balance: c.balance,
    compiler: {
      fileFormat: c.compiler_file_format,
      version: c.compiler_version,
    },
    id: c.id,
    name: c.name,
    info: c.other_info,
    txCount: c.tx_count,
  })),
  meta: {
    page: contractListRes.meta.current_page,
    totalPage: contractListRes.meta.total_page,
    pageSize: pageSize,
  },
})

export const fetchContractList = ({
  page = '1',
  page_size = '30',
  ...query
}: Partial<Record<'page' | 'page_size', string>>): Promise<ReturnType<typeof getContractListRes>> =>
  fetch(`${SERVER_URL}/smart_contracts?${new URLSearchParams({ ...query, page, page_size })}`)
    .then(res => pretreat<Parameters<typeof getContractListRes>[0]>(res))
    .then(res => getContractListRes(res, +page_size))
