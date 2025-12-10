import { render, screen } from '@testing-library/react'
import TrendIndicator from '.'

describe('TrendIndicator', () => {
  const trendType = 'metric'

  it('should show a increasing trend if that is the case', () => {
    render(
      <TrendIndicator
        beforeValue={10}
        afterValue={20}
        timeFrame="month"
        title={trendType}
      />,
    )

    expect(screen.getByLabelText(`Increasing ${trendType}`)).toHaveTextContent(
      '+100%',
    )
    expect(screen.getByText('vs last month')).toBeInTheDocument()
  })

  it('should show a decreasing trend if that is the case', () => {
    render(
      <TrendIndicator
        beforeValue={20}
        afterValue={10}
        timeFrame="week"
        title={trendType}
      />,
    )

    expect(screen.getByLabelText(`Decreasing ${trendType}`)).toHaveTextContent(
      '-50%',
    )
    expect(screen.getByText('vs last week')).toBeInTheDocument()
  })

  it('should show a no change trend if that is the case', () => {
    render(
      <TrendIndicator
        beforeValue={10}
        afterValue={10}
        timeFrame="week"
        title={trendType}
      />,
    )

    expect(screen.getByLabelText(`No Change ${trendType}`)).toHaveTextContent(
      '0%',
    )
    expect(screen.getByText('vs last week')).toBeInTheDocument()
  })
})
