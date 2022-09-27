import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Tabs from '../components/Tabs'

describe('Home', () => {
  it('renders a heading', async () => {
    const tabs = [
      {
        label: 'tab1',
        href: 'testValue1',
      },
    ]

    render(<Tabs tabs={tabs} value={0} />)

    // const heading = screen.getByRole('heading', {
    //   name: /Home Page/i,
    // })
    const testText = screen.queryByTestId('tabs')

    expect(testText).toBeInTheDocument()
  })
})
