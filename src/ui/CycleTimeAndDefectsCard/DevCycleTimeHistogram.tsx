import {
  Bar,
  BarChart,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { alpha, useTheme } from '@mui/material'
import { axisMaxDomain, roundValue } from 'utils/DashboardWidgetWrapper'
import { DevCycleTimeScatterChartProps } from './DevCycleTimeScatterChart'

type DevCycleTimeHistogramDataPoint = {
  devCycleTime: number
  numberOfIssues: number
}

export type DevCycleTimeHistogramProps = {
  data: DevCycleTimeHistogramDataPoint[]
}

export const getPercentile = (
  percentile: number,
  sortedDataSet: number[],
): number => {
  // The nearest rank algorithm (https://en.wikipedia.org/wiki/Percentile)
  const percentileIndex = Math.round((percentile / 100) * sortedDataSet.length)
  return percentileIndex > sortedDataSet.length - 1
    ? sortedDataSet[sortedDataSet.length - 1]
    : sortedDataSet[percentileIndex]
}

export const getDevCycleTimeHistogramData = (
  devCycleTimeScatterChartData: DevCycleTimeScatterChartProps['data'],
): DevCycleTimeHistogramDataPoint[] => {
  const devCycleTimeToIssueCountMap: { [devCycleTime: number]: number } = {}
  for (const scatterPoint of devCycleTimeScatterChartData) {
    const devCycleTimeKey = roundValue(scatterPoint.devCycleTime, 1)
    if (devCycleTimeKey in devCycleTimeToIssueCountMap) {
      devCycleTimeToIssueCountMap[devCycleTimeKey] +=
        scatterPoint.numberOfIssues
    } else {
      devCycleTimeToIssueCountMap[devCycleTimeKey] = scatterPoint.numberOfIssues
    }
  }
  return Object.entries(devCycleTimeToIssueCountMap).map(
    ([devCycleTime, numberOfIssues]) => ({
      devCycleTime: Number(devCycleTime),
      numberOfIssues,
    }),
  )
}

const DevCycleTimeHistogram = ({ data }: DevCycleTimeHistogramProps) => {
  const theme = useTheme()

  const sortedData = [...data].sort((a, b) => a.devCycleTime - b.devCycleTime)
  // our data for which we want to compute the
  // percentiles will be an array of numbers which indicate
  // dev cycle time for each issue.
  const devCycleTimes = sortedData.flatMap(({ devCycleTime, numberOfIssues }) =>
    Array<number>(numberOfIssues).fill(devCycleTime),
  )
  const bottomTenPercent = getPercentile(10, devCycleTimes)
  const topNinetyPercent = getPercentile(90, devCycleTimes)

  return (
    <ResponsiveContainer>
      <BarChart data={sortedData} barCategoryGap="10%">
        <XAxis
          type="number"
          dataKey="devCycleTime"
          stroke={theme.palette.text.primary}
          height={45}
          allowDecimals={false}
          label={{
            value: 'Days',
            dy: 13,
            fill: theme.palette.text.primary,
          }}
        />
        <YAxis
          type="number"
          dataKey="numberOfIssues"
          domain={[0, axisMaxDomain]}
          orientation="right"
          stroke={theme.palette.text.primary}
          allowDecimals={false}
          label={{
            angle: 270,
            value: 'Issues',
            dx: 20,
            fill: theme.palette.text.primary,
          }}
        />
        <Bar
          name="Number of Issues"
          dataKey="numberOfIssues"
          fill={alpha(theme.chart.blue, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.blue}
        />
        <ReferenceLine
          x={topNinetyPercent}
          strokeWidth={3}
          stroke={theme.chart.green}
          strokeDasharray="3 3"
          label={<Label value="90%" style={{ fill: theme.chart.green }} />}
        />
        <ReferenceLine
          x={bottomTenPercent}
          strokeWidth={3}
          stroke={theme.chart.yellow}
          strokeDasharray="3 3"
          label={<Label value="10%" style={{ fill: theme.chart.yellow }} />}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default DevCycleTimeHistogram
