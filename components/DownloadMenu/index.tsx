import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Button, Menu, MenuList, MenuItem, Link, Tooltip } from '@mui/material'
import { Download as DownloadIcon } from '@mui/icons-material'
import { API_ENDPOINT } from 'utils'

interface DownloadMenuProps {
  items: Array<Record<'label' | 'href', string>>
}
export const DOWNLOAD_HREF_LIST = {
  accountTxList: (eth_address: string) => `${API_ENDPOINT}/txs?${new URLSearchParams({ eth_address, export: 'true' })}`,
  accountBridgeRecordList: (eth_address: string) =>
    `${API_ENDPOINT}/deposit_withdrawals?${new URLSearchParams({ eth_address, export: 'true' })}`,
  accountTransferList: (eth_address: string) =>
    `${API_ENDPOINT}/transfers?${new URLSearchParams({ eth_address, export: 'true' })}`,
  udtHolderList: (udt_id: string) => `${API_ENDPOINT}/account_udts/${new URLSearchParams({ udt_id, export: 'true' })}`,
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const handleDismiss = () => setAnchorEl(null)

  return (
    <div>
      <Tooltip title={t(`up_to_5k_records_will_be_exported`)} placement="bottom">
        <Button variant="text" onClick={handleOpen} endIcon={<DownloadIcon />}>
          {t('download')}
        </Button>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleDismiss}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList>
          {items.map(item => (
            <Link key={item.label} href={item.href} underline="none">
              <MenuItem sx={{ minWidth: 100 }} onClick={handleDismiss}>
                {item.label}
              </MenuItem>
            </Link>
          ))}
        </MenuList>
      </Menu>
    </div>
  )
}

export default DownloadMenu
