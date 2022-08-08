/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Button, Modal } from '@mui/material'
import CopyIcon from 'assets/icons/qr-code.svg'
import CloseIcon from 'assets/icons/close.svg'
import styles from './styles.module.scss'
import Tooltip from 'components/Tooltip'
import QRCode from 'qrcode'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const QRCodeBtn: React.FC<{ content: string }> = ({ content }) => {
  const [t] = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [data, setData] = useState('')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleOpen = async () => {
    const dataUrl = await generateQR(content)
    setData(dataUrl)
    setOpen(true)
  }

  const generateQR = async (text: string) => {
    try {
      return QRCode.toDataURL(text, {
        margin: 0,
        type: 'image/jpeg',
        rendererOpts: { quality: 1 },
        errorCorrectionLevel: 'H',
      })
    } catch (err) {
      console.log(err)
    }
  }

  const handleSave = () => {
    const link = document.createElement('a')
    link.download = content
    link.href = data
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            <CloseIcon fontSize={14} />
          </div>
          <img src={data} alt="qr-code-image" width={128} height={128} />
          <p className="mono-font">{content}</p>
          {isMobile && (
            <Button
              variant="contained"
              sx={{
                mt: 3,
                borderRadius: 6,
                textTransform: 'none',
                fontSize: 12,
                width: 160,
                height: 40,
                boxShadow: 'none',
              }}
              onClick={handleSave}
            >
              {t('saveQrCode')}
            </Button>
          )}
        </div>
      </Modal>
    </>
  )
}
export default QRCodeBtn
