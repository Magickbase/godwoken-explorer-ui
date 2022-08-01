import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { FilterAlt as FilterIcon } from '@mui/icons-material'

import styles from './styles.module.scss'

const NUM_KEYS = ['block_from', 'block_to']
const FilterMenu: React.FC<{ filterKeys: Array<string> }> = ({ filterKeys }) => {
  const [t] = useTranslation('list')
  const { query, push, asPath } = useRouter()

  const menuId = filterKeys.join()

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const q = { ...query } as Record<string, string>
    filterKeys.forEach(field => {
      const input = e.currentTarget[field.toString()]
      if (input) {
        const v = input.value.trim()
        if (v) {
          if (NUM_KEYS.includes(field)) {
            q[field] = `${+v}`
          } else {
            q[field] = v
          }
        } else {
          delete q[field]
        }
      }
    })

    push(`${asPath.split('?')[0] ?? ''}?${new URLSearchParams(q)}`)
    document.body.focus()
    // blur
  }

  const handleFilterClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    e.currentTarget
      .closest('form')
      ?.querySelectorAll('input')
      .forEach(i => (i.value = ''))
  }

  return (
    <div className={styles.container}>
      <label htmlFor={menuId}>
        <FilterIcon fontSize="inherit" />
        <input id={menuId} />
      </label>
      <form onSubmit={handleFilterSubmit} className={styles.menu}>
        {filterKeys.map((field, idx) => {
          return (
            <div key={field} style={{ padding: '4px 16px' }}>
              <input
                type={NUM_KEYS.includes(field) ? 'number' : 'text'}
                name={field}
                defaultValue={query[field] ?? ''}
                autoFocus={!idx}
              />
            </div>
          )
        })}
        <div className={styles.btns}>
          <button type="submit">{t(`filter`)}</button>
          <button type="button" onClick={handleFilterClear}>
            {t(`clear`)}
          </button>
        </div>
      </form>
    </div>
  )
}

FilterMenu.displayName = 'FilterMenu'

export default FilterMenu
