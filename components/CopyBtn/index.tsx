import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Alert, Snackbar } from '@mui/material'
import CopyIcon from 'assets/icons/copy.svg'
import { handleCopy } from 'utils'
import styles from './styles.module.scss'

const CopyBtn: React.FC<{ content: string }> = ({ content }) => {
  const [t] = useTranslation('common')
  const [isCopied, setIsCopied] = useState(false)

  const handleHashCopy = async () => {
    await handleCopy(content)
    setIsCopied(true)
  }
  return (
    <>
      <button className={styles.copyBtn} aria-label="copy" onClick={handleHashCopy}>
        <CopyIcon fontSize="inherit" />
      </button>
      <Snackbar
        open={isCopied}
        onClose={() => setIsCopied(false)}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'top',
        }}
        autoHideDuration={3000}
        color="secondary"
      >
        <Alert severity="success" variant="filled">
          {t(`blockHashCopied`)}
        </Alert>
      </Snackbar>
    </>
  )
}
export default CopyBtn
