import { useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/zh-cn'
import utc from 'dayjs/plugin/utc'
import timezones from 'dayjs/plugin/timezone'
import TextField from '@mui/material/TextField'
import { usePopupState, bindTrigger, bindPopper } from 'material-ui-popup-state/hooks'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { Popper, ClickAwayListener, Fade } from '@mui/material'
import styled from '@emotion/styled'
import Alert from 'components/Alert'
import FilterIcon from 'assets/icons/filter.svg'
import ClearIcon from 'assets/icons/clear.svg'

dayjs.extend(utc)
dayjs.extend(timezones)

const locales = { 'en-US': 'en', 'zh-CN': 'zh-cn' }

const Container = styled.div`
  position: relative;
  display: inline-flex;
  label.filterBtn {
    display: flex;
    cursor: pointer;
    &:hover {
      color: var(--primary-color);
    }
    svg {
      @media screen and (max-width: 1024px) {
        transform: scale(0.9);
      }
    }
  }
  .clearIcon {
    display: none;
    position: absolute;
    top: -70%;
    right: -70%;
    width: 12px;
    height: 12px;
    cursor: pointer;
    path {
      fill: #333;
    }
  }

  &[data-active='true'] {
    label.filterBtn {
      svg {
        color: var(--primary-color);
      }
    }
    .clearIcon {
      display: block;
    }
  }
`

const FormMenu = styled.form`
  padding: 0.7rem;
  width: 256px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  z-index: 9;

  .field {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    label {
      line-height: 1em;
      text-transform: capitalize;
      color: var(--secondary-text-color);
      font-size: 90%;
      margin-bottom: 6px;
    }
    .MuiInputBase-root {
      input {
        padding-left: 10px;
      }
      fieldset {
        border: unset;
      }
      width: 100%;
      height: 42px;
      color: var(--primary-text-color);
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      box-sizing: border-box;
      &:hover,
      &:focus {
        border-color: var(--primary-color);
      }
      &::placeholder {
        color: #999;
      }
    }
  }

  .btns {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    button {
      appearance: none;
      border: none;
      margin-left: 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 5.5rem;
      height: 2rem;
      border-radius: 1rem;
      border: 1px solid #e5e5e5;
      background-color: transparent;
      text-transform: capitalize;
      cursor: pointer;
      &[type='submit'] {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: #fff;
      }
    }
  }
`

const AgeFilterMenu: React.FC<{ filterKeys: Array<string> }> = ({ filterKeys }) => {
  const [t] = useTranslation('list')
  const { query, push, locale } = useRouter()
  const defaultState = filterKeys.reduce((res, key) => ({ ...res, [key]: null }), {})
  const filterRef = useRef<HTMLLabelElement>(null)
  const [state, setState] = useState<Record<string, Dayjs>>(
    filterKeys.reduce((res, key) => ({ ...res, [key]: query[key] ? dayjs(query[key] as string) : null }), {}),
  )
  const [alert, setAlert] = useState<{ open: boolean; type?: 'success' | 'error' | 'warning'; msg?: string }>({
    open: false,
    type: 'success',
    msg: '',
  })

  const handleClickAway = () => {
    popupState.setOpen(false)
  }

  const popupState = usePopupState({
    variant: 'popper',
    popupId: 'formPopover',
  })

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const q = { ...query } as Record<string, string>
    const timezone = dayjs.tz.guess()
    try {
      filterKeys.forEach(key => {
        if (state[key]) {
          q[key] = state[key].tz(timezone).utc().toISOString()
        } else {
          delete q[key]
        }
      })
    } catch {
      setAlert({ open: true, type: 'warning', msg: t('invalid_date') })
      return
    }
    popupState.setOpen(false)
    push(`${window.location.pathname ?? ''}?${new URLSearchParams(q)}`)
  }

  const handleDateChange = (localDate: Dayjs, field: string) => {
    setState({ ...state, [field]: localDate })
  }

  const handleFilterContentClear = () => {
    setState(defaultState)
  }

  const handleFilterIconClear = (e: React.MouseEvent<HTMLOrSVGElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const q = { ...query } as Record<string, string>
    filterKeys.forEach(field => {
      delete q[field]
    })

    push(`${window.location.pathname ?? ''}?${new URLSearchParams(q)}`)
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Container data-active={filterKeys.some(field => query[field])}>
        <label htmlFor={`${filterKeys[0]}_filter`} className="filterBtn" ref={filterRef}>
          <FilterIcon fontSize="inherit" {...bindTrigger(popupState)} />
          <ClearIcon className="clearIcon" onClick={handleFilterIconClear} />
        </label>
        <Alert
          open={alert?.open}
          onClose={() => setAlert({ ...alert, open: false })}
          content={alert.msg}
          type={alert.type}
        />
        <Popper
          {...bindPopper(popupState)}
          onResize={undefined}
          onResizeCapture={undefined}
          open={popupState.isOpen}
          placement="bottom"
          sx={{ pt: '25px' }}
          container={filterRef.current}
          disablePortal
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={300}>
              <div>
                <FormMenu onSubmit={handleFilterSubmit} className="menu" data-role="filter-menu">
                  {filterKeys.map(field => {
                    return (
                      <div key={field} className="field">
                        <label>{t(field)}</label>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locales[locale]}>
                          <DateTimePicker
                            key={field}
                            value={state[field]}
                            disableFuture
                            disableMaskedInput
                            ampm
                            onChange={(newValue: Dayjs) => handleDateChange(newValue, field)}
                            inputFormat="YYYY/MM/DD, HH:mm"
                            renderInput={params => (
                              <TextField {...params} helperText="" autoFocus={field === filterKeys[0]} />
                            )}
                          />
                        </LocalizationProvider>
                      </div>
                    )
                  })}
                  <div className="btns">
                    <button type="button" onClick={handleFilterContentClear}>
                      {t(`clear`)}
                    </button>
                    <button type="submit">{t(`filter`)}</button>
                  </div>
                </FormMenu>
              </div>
            </Fade>
          )}
        </Popper>
      </Container>
    </ClickAwayListener>
  )
}

AgeFilterMenu.displayName = 'AgeFilterMenu'

export default AgeFilterMenu
