import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { screen } from '@testing-library/react'
import DefectPriorityPieChart, {
  ChartTooltip,
  DefectPriorityPieChartProps,
  getDefectPriorityPieChartData,
} from './DefectPriorityPieChart'
import { DefectPriorityRateTrendChartProps } from './DefectPriorityRateTrendChart'

const MockPieDataPropsSpy = jest.fn()

jest.mock('recharts', () => ({
  Cell: () => <div data-testid="Cell" />,
  Legend: () => <div data-testid="Legend" />,
  Pie: ({ data, children }: { data: unknown; children: React.ReactNode }) => {
    MockPieDataPropsSpy(data)
    return <div>{children}</div>
  },
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <svg>{children}</svg>
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div data-testid="Tooltip" />,
}))

describe('getDefectPriorityPieChartData', () => {
  const defectPriorityRateTrendChartData: DefectPriorityRateTrendChartProps['data'] =
    [
      {
        xAxisTick: 'dontcare-1',
        highestPriorityDefectsCreated: 6,
        highPriorityDefectsCreated: 6,
        mediumPriorityDefectsCreated: 6,
        lowPriorityDefectsCreated: 6,
        lowestPriorityDefectsCreated: 6,
      },
      {
        xAxisTick: 'dontcare-2',
        highestPriorityDefectsCreated: 6,
        highPriorityDefectsCreated: 6,
        mediumPriorityDefectsCreated: 6,
        lowPriorityDefectsCreated: 6,
        lowestPriorityDefectsCreated: 6,
      },
      {
        xAxisTick: 'dontcare-3',
        highestPriorityDefectsCreated: 6,
        highPriorityDefectsCreated: 6,
        mediumPriorityDefectsCreated: 6,
        lowPriorityDefectsCreated: 6,
        lowestPriorityDefectsCreated: 6,
      },
      {
        xAxisTick: 'dontcare-4',
        highestPriorityDefectsCreated: 6,
        highPriorityDefectsCreated: 6,
        mediumPriorityDefectsCreated: 6,
        lowPriorityDefectsCreated: 6,
        lowestPriorityDefectsCreated: 6,
      },
    ]
  it('should have the total amount of defects for each priority category of defect as sector data', () => {
    const expected: DefectPriorityPieChartProps['data'] = [
      {
        defectPriority: 'Highest Priority Defects',
        // sum of highestPriorityDefectsCreated * number
        // of trend data point = 6 * 4 = 24
        defectsCreated: 24,
      },
      {
        defectPriority: 'High Priority Defects',
        // sum of highPriorityDefectsCreated * number
        // of trend data point = 6 * 4 = 24
        defectsCreated: 24,
      },
      {
        defectPriority: 'Medium Priority Defects',
        // sum of mediumPriorityDefectsCreated * number
        // of trend data point = 6 * 4 = 24
        defectsCreated: 24,
      },
      {
        defectPriority: 'Low Priority Defects',
        // sum of lowPriorityDefectsCreated * number
        // of trend data point = 6 * 4 = 24
        defectsCreated: 24,
      },
      {
        defectPriority: 'Lowest Priority Defects',
        // sum of lowestPriorityDefectsCreated * number
        // of trend data point = 6 * 4 = 24
        defectsCreated: 24,
      },
    ]
    expect(
      getDefectPriorityPieChartData(defectPriorityRateTrendChartData),
    ).toEqual(expected)
  })
})

describe('ChartTooltip', () => {
  it('should render with the percentage for that sector and the total', () => {
    RenderWithWrapper(
      <ChartTooltip
        active
        payload={[
          {
            name: 'Highest Priority Defects',
            value: 4,
            payload: {
              defectPriority: 'Highest Priority Defects',
              defectsCreated: 4,
            },
          },
        ]}
        totalDefectsCreated={4}
      />,
    )

    expect(
      screen.getByLabelText('Highest Priority Defects Value'),
    ).toHaveTextContent('4 (100%)')

    expect(screen.getByLabelText('Total Value')).toHaveTextContent('4')
  })
})

describe('DefectPriorityPieChart', () => {
  it('should call Pie with the given computed data', () => {
    const mockData: DefectPriorityPieChartProps['data'] = [
      {
        defectPriority: 'Highest Priority Defects',
        defectsCreated: 4,
      },
    ]
    RenderWithWrapper(<DefectPriorityPieChart data={mockData} />)

    expect(MockPieDataPropsSpy).toHaveBeenCalledWith(mockData)
  })
})
