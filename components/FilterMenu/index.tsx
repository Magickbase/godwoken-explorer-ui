import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import FilterIcon from 'assets/icons/filter.svg'
import ClearIcon from 'assets/icons/clear.svg'

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
  }

  const handleFilterContentClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    e.currentTarget
      .closest('form')
      ?.querySelectorAll('input')
      .forEach(i => (i.value = ''))
  }

  const handleFilterClear = (e: React.MouseEvent<HTMLOrSVGElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const q = { ...query } as Record<string, string>
    filterKeys.forEach(field => {
      delete q[field]
    })

    push(`${asPath.split('?')[0] ?? ''}?${new URLSearchParams(q)}`)
  }

  return (
    <div className={styles.container} data-active={filterKeys.some(field => query[field])}>
      <label htmlFor={menuId} className={styles.filterBtn}>
        <FilterIcon fontSize="inherit" />
        <ClearIcon className={styles.clearIcon} onClick={handleFilterClear} />
        <input id={menuId} />
      </label>
      <form onSubmit={handleFilterSubmit} className={styles.menu} data-role="filter-menu">
        {filterKeys.map(field => {
          const isNum = NUM_KEYS.includes(field)
          return (
            <div key={field} className={styles.field}>
              <label>{t(field)}</label>
              <input
                type={isNum ? 'number' : 'text'}
                name={field}
                placeholder={t(`filter_menu.${field}`)}
                defaultValue={query[field] ?? ''}
                inputMode={isNum ? 'numeric' : 'text'}
              />
            </div>
          )
        })}
        <div className={styles.btns}>
          <button type="button" onClick={handleFilterContentClear}>
            {t(`clear`)}
          </button>
          <button type="submit">{t(`filter`)}</button>
        </div>
      </form>
    </div>
  )
}

FilterMenu.displayName = 'FilterMenu'

export default FilterMenu
