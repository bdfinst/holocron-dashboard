import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import DevCycleTimeHistogram, {
  DevCycleTimeHistogramProps,
  getDevCycleTimeHistogramData,
  getPercentile,
} from './DevCycleTimeHistogram'
import { DevCycleTimeScatterChartProps } from './DevCycleTimeScatterChart'

const MockBarChartDataPropsSpy = jest.fn()

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BarChart: ({
    data,
    children,
  }: {
    data: unknown
    children: React.ReactNode
  }) => {
    MockBarChartDataPropsSpy(data)
    return <svg>{children}</svg>
  },
  XAxis: () => <div data-testid="XAxis" />,
  YAxis: () => <div data-testid="YAxis" />,
  Bar: () => <div data-testid="Bar" />,
  ReferenceLine: () => <div data-testid="ReferenceLine" />,
  Label: () => <div data-testid="Label" />,
  Legend: () => <div data-testid="Legend" />,
}))

describe('getPercentile', () => {
  it('for an index that falls between the range, it should just return [Math.round((percentile / 100) * (N - 1))] index dataset', () => {
    const percentile = 30
    const sortedDataSet = [1, 2, 3, 4]
    // Math.floor(30% * sortedDataSet.length) = percentile index
    // = (30 / 100) * 4 = 1.2 is index
    // so result should sortedDataSet[Math.round(1.2)] = 2
    const expected = 2
    expect(getPercentile(percentile, sortedDataSet)).toEqual(expected)
  })

  it('for an index higher than the minimum index value of dataset (N - 1), it should return the N - 1 index dataset', () => {
    const percentile = 90
    const sortedDataSet = [1, 2, 3, 4]
    // Math.floor(90% * sortedDataSet.length) = percentile index
    // = (90 / 100) * 4 = 3.6 is index
    // Math.round(3.6) > sortedDataSet.length - 1
    // so result should sortedDataSet[sortedDataSet.length - 1] = 4
    const expected = 4
    expect(getPercentile(percentile, sortedDataSet)).toEqual(expected)
  })
})

describe('getDevCycleTimeHistogramData', () => {
  it('should have the overall mapping of devCycleTime to number of issues for the given dev cycle time given the dev cycle time scatter chart data', () => {
    const devCycleTimeScatterChartData: DevCycleTimeScatterChartProps['data'] =
      [
        {
          xAxisTick: 'dontcare-1',
          devCycleTime: 3,
          numberOfIssues: 4,
          averageDevCycleTime: 0, // dont care about this value
        },
        {
          xAxisTick: 'dontcare-1',
          devCycleTime: 5,
          numberOfIssues: 6,
          averageDevCycleTime: 0, // dont care about this value
        },
        {
          xAxisTick: 'dontcare-1',
          devCycleTime: 2,
          numberOfIssues: 1,
          averageDevCycleTime: 0, // dont care about this value
        },
        {
          xAxisTick: 'dontcare-1',
          devCycleTime: 2,
          numberOfIssues: 2,
          averageDevCycleTime: 0, // dont care about this value
        },
      ]
    const expected: DevCycleTimeHistogramProps['data'] = [
      {
        devCycleTime: 2,
        // counting the sum of number of issues in the first two points
        numberOfIssues: 3,
      },
      {
        devCycleTime: 3,
        // same as one on the list
        numberOfIssues: 4,
      },
      {
        devCycleTime: 5,
        // same as one on the list
        numberOfIssues: 6,
      },
    ].sort((a, b) => a.devCycleTime - b.devCycleTime)
    expect(
      getDevCycleTimeHistogramData(devCycleTimeScatterChartData).sort(
        (a, b) => a.devCycleTime - b.devCycleTime,
      ),
    ).toEqual(expected)
  })
})

describe('DevCycleTimeHistogram', () => {
  it('should call BarChart with computed mock data sorted by dev cycle time', () => {
    const mockData: DevCycleTimeHistogramProps['data'] = [
      {
        devCycleTime: 6,
        numberOfIssues: 1,
      },
      {
        devCycleTime: 4,
        numberOfIssues: 1,
      },
    ]
    RenderWithWrapper(<DevCycleTimeHistogram data={mockData} />)

    expect(MockBarChartDataPropsSpy).toHaveBeenCalledWith(
      [...mockData].sort((a, b) => a.devCycleTime - b.devCycleTime),
    )
  })
})
