import styles from './styles.module.scss'

type Metadata = Record<'name' | 'description' | 'image', string>

const Metadata: React.FC<Metadata> = metadata => {
  return (
    <div className={styles.container}>
      {metadata ? <textarea defaultValue={JSON.stringify(metadata, null, 2)} readOnly /> : `No Metadata`}
    </div>
  )
}

Metadata.displayName = 'Metadata'

export default Metadata
