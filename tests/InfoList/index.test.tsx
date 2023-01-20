import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import InfoList, { InfoItemProps } from '../../components/InfoList'

import styles from './styles.module.scss'
import { style } from '@mui/system'

const defaultList: InfoItemProps[] = [
  {
    field: 'testStatus',
    content: 'testStatus',
  },
]

const testList: InfoItemProps[] = [
  {
    field: 'type',
    content: 'Meta Contract',
  },
  {
    field: 'status',
    content: 'status',
  },
]
const tooltipList: InfoItemProps[] = [
  {
    field: 'type',
    content: 'Meta Contract',
    tooltipTitle: 'Meta Contract',
  },
  {
    field: 'status',
    content: 'status',
  },
]

describe('InfoList', () => {
  beforeEach(() => {
    const { getComputedStyle } = window
    window.getComputedStyle = elt => getComputedStyle(elt)
  })
  afterEach(cleanup)

  it('render default list.', () => {
    render(<InfoList list={defaultList} />)
    expect(screen.queryByTestId('infoList')).toBeInTheDocument()
  })

  it('render teh title from props.', () => {
    const title = 'test title'
    render(<InfoList list={defaultList} title={title} />)

    expect(screen.queryByTestId('title')).toHaveTextContent(title)
  })

  it('render the list from props.', () => {
    render(<InfoList list={testList} />)

    expect(screen.queryByTitle('type')).toBeInTheDocument()
    expect(screen.queryByTitle('status')).toBeInTheDocument()
    expect(screen.queryByTitle('testStatus')).not.toBeInTheDocument()
  })

  it('render type and test the situations with diffrent types.', () => {
    render(<InfoList list={testList} type="one-column" />)
    expect(screen.queryAllByRole('listitem')?.[0]).toHaveStyle('order: 1')

    cleanup()

    render(<InfoList list={testList} type="two-columns" />)
    expect(screen.queryAllByRole('listitem')?.[0]).toHaveStyle('order: 0')
  })

  it('render the style from the props.', () => {
    const style = { color: 'red', fontSize: '12px' }

    render(<InfoList list={defaultList} style={style} />)

    expect(screen.queryByTestId('infoList')).toHaveStyle('font-size: 12px;')
    expect(screen.queryByTestId('infoList')?.style.color).toBe('red')
  })

  it('render classNames.', () => {
    render(<InfoList list={defaultList} className={styles['color-gray']} />)
    const classList = screen.queryByTestId('infoList')?.className

    expect(classList?.includes('container')).toBeTruthy()
    expect(classList?.includes('color-gray')).toBeTruthy()
  })

  it('render tooltip.', async () => {
    render(<InfoList list={tooltipList} />)
    const ele = screen.getByText('Meta Contract')
    console.log(window.getComputedStyle(ele, ':before'), 'elelment')

    await waitFor(() => {
      expect(window.getComputedStyle(ele, ':before')?.visibility).toBe('visible')
    })
  })
})
