import ExpandIcon from 'assets/icons/expand.svg'
import { useTranslation } from 'next-i18next'
import styles from './styles.module.scss'

const ScriptCode: React.FC<{ script: Record<'args' | 'code_hash' | 'hash_type', string>; name: string }> = ({
  script,
  name,
}) => {
  const [t] = useTranslation('account')
  return (
    <details className={styles.container}>
      <summary>
        <div className={styles.name}>{name || t('unknownScript')}</div>
        <ExpandIcon />
      </summary>
      <pre style={{ tabSize: '2ch', fontSize: '0.8em' }}>{`{\n\t"code_hash": "${
        script?.code_hash ?? ''
      }",\n\t"args": "${script?.args ?? ''}",\n\t"hash_type": "${script?.hash_type ?? ''}"\n}`}</pre>
    </details>
  )
}

export default ScriptCode
