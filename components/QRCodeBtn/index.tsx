/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Box, Modal, Typography } from '@mui/material'
import CopyIcon from 'assets/icons/qr-code.svg'
import CloseIcon from 'assets/icons/close.svg'
import styles from './styles.module.scss'
import Tooltip from 'components/Tooltip'
import QRCode from 'qrcode'

const QRCodeBtn: React.FC<{ content: string }> = ({ content }) => {
  const [t] = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [data, setData] = useState('')

  const handleOpen = async () => {
    const dataUrl = await generateQR(content)
    setData(dataUrl)
    setOpen(true)
  }

  const generateQR = async (text: string) => {
    try {
      return QRCode.toDataURL(text, { margin: 0 })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      <Tooltip title={t(`clickViewQRCode`)} placement="bottom">
        <button className={styles.qrCodeBtn} aria-label="qr-code" onClick={handleOpen}>
          <CopyIcon fontSize="inherit" />
        </button>
      </Tooltip>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className={styles.qrCodeModal}>
          <div className={styles.close} onClick={() => setOpen(false)}>
            <CloseIcon fontSize="inherit" />
          </div>
          <img src={data} alt="qr-code-image" width={128} height={128} />
          <p id="modal-modal-title">{content}</p>
        </div>
      </Modal>
    </>
  )
}
export default QRCodeBtn
