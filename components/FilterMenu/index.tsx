import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import FilterIcon from 'assets/icons/filter.svg'
import ClearIcon from 'assets/icons/clear.svg'
import utc from 'dayjs/plugin/utc'
import timezones from 'dayjs/plugin/timezone'
import styles from './styles.module.scss'
import dayjs from 'dayjs'

dayjs.extend(utc)
dayjs.extend(timezones)

const NUM_KEYS = ['block_from', 'block_to']
const DATE_KEYS = ['age_range_end', 'age_range_start']

const FilterMenu: React.FC<{ filterKeys: Array<string> }> = ({ filterKeys }) => {
  const [t] = useTranslation('list')
  const { query, push, asPath } = useRouter()

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
          } else if (DATE_KEYS.includes(field)) {
            const localDate = dayjs(v)
            const timezone = dayjs.tz.guess()
            const utcDate = localDate.tz(timezone).utc().toISOString()
            q[field] = utcDate
          } else {
            q[field] = v
          }
        } else {
          delete q[field]
        }
      }
    })

    push(`${asPath.split('?')[0] ?? ''}?${new URLSearchParams(q)}`)
    if (['INPUT', 'BUTTON'].includes(document.activeElement.tagName)) {
      ;(document.activeElement as HTMLInputElement).blur()
    }
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
      <label htmlFor={`${filterKeys[0]}_filter`} className={styles.filterBtn}>
        <FilterIcon fontSize="inherit" />
        <ClearIcon className={styles.clearIcon} onClick={handleFilterClear} />
      </label>
      <form onSubmit={handleFilterSubmit} className={styles.menu} data-role="filter-menu">
        {filterKeys.map(field => {
          const isNum = NUM_KEYS.includes(field)
          const isDate = DATE_KEYS.includes(field)
          const defualtValue = query[field] ?? ''
          return (
            <div key={field} className={styles.field}>
              <label>{t(field)}</label>
              {isDate ? (
                <input
                  type="datetime-local"
                  key={field}
                  name={field}
                  placeholder={t(`filter_menu.${field}`)}
                  defaultValue={(defualtValue as string).replace('Z', '')}
                  id={`${field}_filter`}
                />
              ) : (
                <input
                  type={isNum ? 'number' : 'text'}
                  name={field}
                  placeholder={t(`filter_menu.${field}`)}
                  defaultValue={defualtValue}
                  inputMode={isNum ? 'numeric' : 'text'}
                  id={`${field}_filter`}
                />
              )}
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
