import { screen } from '@testing-library/react'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import globalConfig from 'globalConfig'
import EffortCostsAggregateTable from './EffortCostsAggregateTable'

const { METRICS_SETTINGS } = globalConfig
const { FTE_RATE_UNIT } = METRICS_SETTINGS

describe('EffortCostsAggregateTable', () => {
  it('should have the aggregates for all the values in a time period with percentages of each type of effort', () => {
    RenderWithWrapper(
      <EffortCostsAggregateTable
        data={[
          {
            amountSpentOnDefects: 5,
            amountSpentOnFeatures: 5,
            amountSpentOnMaintenance: 5,
            amountSpentOnUnplanned: 5,
          },
          {
            amountSpentOnDefects: 4,
            amountSpentOnFeatures: 4,
            amountSpentOnMaintenance: 4,
            amountSpentOnUnplanned: 4,
          },
          {
            amountSpentOnDefects: 3,
            amountSpentOnFeatures: 3,
            amountSpentOnMaintenance: 3,
            amountSpentOnUnplanned: 3,
          },
          {
            amountSpentOnDefects: 2,
            amountSpentOnFeatures: 2,
            amountSpentOnMaintenance: 2,
            amountSpentOnUnplanned: 2,
          },
          {
            amountSpentOnDefects: 1,
            amountSpentOnFeatures: 1,
            amountSpentOnMaintenance: 1,
            amountSpentOnUnplanned: 1,
          },
        ]}
      />,
    )
    // 5 + 4 + 3 + 2 + 1 = 15 from each key in the data json above
    expect(screen.getByLabelText('Amount spent on defects')).toHaveTextContent(
      `${FTE_RATE_UNIT} 15`,
    )
    expect(
      screen.getByLabelText('Percent amount spent on defects'),
    ).toHaveTextContent('25%')
    expect(screen.getByLabelText('Amount spent on features')).toHaveTextContent(
      `${FTE_RATE_UNIT} 15`,
    )
    expect(
      screen.getByLabelText('Percent amount spent on features'),
    ).toHaveTextContent('25%')
    expect(
      screen.getByLabelText('Amount spent on maintenance'),
    ).toHaveTextContent(`${FTE_RATE_UNIT} 15`)
    expect(
      screen.getByLabelText('Percent amount spent on maintenance'),
    ).toHaveTextContent('25%')
    expect(
      screen.getByLabelText('Amount spent on unplanned'),
    ).toHaveTextContent(`${FTE_RATE_UNIT} 15`)
    expect(
      screen.getByLabelText('Percent amount spent on unplanned'),
    ).toHaveTextContent('25%')
    // 15 * 4, from all totals above
    expect(screen.getByLabelText('Amount total')).toHaveTextContent('60')
  })

  it('should show empty percentages if overall total is 0', () => {
    RenderWithWrapper(<EffortCostsAggregateTable data={[]} />)

    expect(screen.getByLabelText('Amount spent on defects')).toHaveTextContent(
      `${FTE_RATE_UNIT} 0`,
    )
    expect(
      screen.getByLabelText('Percent amount spent on defects'),
    ).toHaveTextContent('')
    expect(screen.getByLabelText('Amount spent on features')).toHaveTextContent(
      `${FTE_RATE_UNIT} 0`,
    )
    expect(
      screen.getByLabelText('Percent amount spent on features'),
    ).toHaveTextContent('')
    expect(
      screen.getByLabelText('Amount spent on maintenance'),
    ).toHaveTextContent(`${FTE_RATE_UNIT} 0`)
    expect(
      screen.getByLabelText('Percent amount spent on maintenance'),
    ).toHaveTextContent('')
    expect(
      screen.getByLabelText('Amount spent on unplanned'),
    ).toHaveTextContent(`${FTE_RATE_UNIT} 0`)
    expect(
      screen.getByLabelText('Percent amount spent on unplanned'),
    ).toHaveTextContent('')
  })
})
