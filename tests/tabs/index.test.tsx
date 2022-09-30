import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Tabs from '../../components/Tabs'

describe('Tabs', () => {
  it('render default', async () => {
    const tabs = [
      {
        label: 'tab1',
        href: 'testValue1',
      },
    ]
    render(<Tabs tabs={tabs} value={0} />)

    expect(screen.queryByTestId('tabs')).toBeInTheDocument()
  })
})
