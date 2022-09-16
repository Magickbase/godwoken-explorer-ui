import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import Alert from 'components/Alert'
import CopyIcon from 'assets/icons/copy.svg'
import { handleCopy } from 'utils'
import styles from './styles.module.scss'

const CopyBtn: React.FC<Record<'content' | 'field', string>> = ({ content, field }) => {
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
      <Alert open={isCopied} onClose={() => setIsCopied(false)} content={t(`field-copied`, { field })} type="success" />
    </>
  )
}
export default CopyBtn
