import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { API_ENDPOINT } from 'utils'
import DownloadIcon from 'assets/icons/download.svg'
import styles from './styles.module.scss'

interface DownloadMenuProps {
  items: Array<Record<'label' | 'href', string>>
}
export const DOWNLOAD_HREF_LIST = {
  accountTxList: (eth_address: string) => `${API_ENDPOINT}/txs?${new URLSearchParams({ eth_address, export: 'true' })}`,
  accountBridgeRecordList: (eth_address: string) =>
    `${API_ENDPOINT}/deposit_withdrawals?${new URLSearchParams({ eth_address, export: 'true' })}`,
  accountTransferList: (eth_address: string) =>
    `${API_ENDPOINT}/transfers?${new URLSearchParams({ eth_address, export: 'true' })}`,
  udtHolderList: (udt_id: string) => `${API_ENDPOINT}/account_udts?${new URLSearchParams({ udt_id, export: 'true' })}`,
  udtBridgeRecordList: (udt_id: string) =>
    `${API_ENDPOINT}/deposit_withdrawals?${new URLSearchParams({ udt_id, export: 'true' })}`,
  udtTransferList: (udt_address: string) =>
    `${API_ENDPOINT}/transfers?${new URLSearchParams({ udt_address, export: 'true' })}`,
  blockBridgeRecordList: (block_number: string) =>
    `${API_ENDPOINT}/deposit_withdrawals?${new URLSearchParams({ block_number, export: 'true' })}`,
  blockTxList: (block_hash: string) => `${API_ENDPOINT}/txs?${new URLSearchParams({ block_hash, export: 'true' })}`,
  txTransferList: (tx_hash: string) => `${API_ENDPOINT}/transfers?${new URLSearchParams({ tx_hash, export: 'true' })}`,
}

const DownloadMenu: React.FC<DownloadMenuProps> = ({ items }) => {
  const [t] = useTranslation('common')

  return (
    <div className={styles.container}>
      <div className="tooltip" data-tooltip={t(`up_to_5k_records_will_be_exported`)}>
        <label htmlFor="download-button">
          {t(`download`)}
          <DownloadIcon />
        </label>
        <input id="download-button" readOnly inputMode="none" />
      </div>
      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.label}>
            <NextLink href={item.href}>
              <a>{item.label}</a>
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DownloadMenu
