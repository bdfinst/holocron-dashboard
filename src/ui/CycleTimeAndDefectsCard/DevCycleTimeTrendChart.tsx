import { useTheme } from '@mui/material'
import { TeamMetrics } from 'api'
import {
  LabelAndValueChartTooltip,
  axisMaxDomain,
  getMonthAndMondayDayLabel,
  legendFormatter,
  padAndSortAscendingWeekEntires,
  roundValue,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type DevCycleTimeTrendChartDataPoint = {
  xAxisTick: string
  averageDevCycleTime: number
}

export const getDevCycleTimeTrendChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): DevCycleTimeTrendChartDataPoint[] => {
  const weekToHelperData: {
    [week: string]: { week: string; totalCycleTime: number; issueCount: number }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const {
      week,
      ticketDevelopmentCycleTimes,
    } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : {
              week,
              totalCycleTime: 0,
              issueCount: 0,
            }
      dataPoint.totalCycleTime += ticketDevelopmentCycleTimes.reduce(
        (total, { days }) => total + days,
        0,
      )
      dataPoint.issueCount += ticketDevelopmentCycleTimes.length
      weekToHelperData[week] = dataPoint
    }
  }

  const dataPointsWithoutXAxisTick = Object.values(weekToHelperData).map(
    point => ({
      week: point.week,
      averageDevCycleTime: roundValue(
        safeDivide(point.totalCycleTime, point.issueCount),
        2,
      ),
    }),
  )

  return padAndSortAscendingWeekEntires(
    dataPointsWithoutXAxisTick,
    {
      week: '',
      averageDevCycleTime: 0,
    },
    weekRange,
  ).map(({ week, averageDevCycleTime }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    averageDevCycleTime,
  }))
}

export type DevCycleTimeTrendChartProps = {
  data: DevCycleTimeTrendChartDataPoint[]
}

const DevCycleTimeTrendChart = ({ data }: DevCycleTimeTrendChartProps) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorDevCycleTime" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.chart.blue} stopOpacity={0.8} />
            <stop offset="95%" stopColor="gray" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="xAxisTick"
          stroke={theme.palette.text.primary}
          height={45}
          angle={45}
          dy={10}
        />
        <YAxis
          type="number"
          domain={[0, axisMaxDomain]}
          orientation="right"
          stroke={theme.palette.text.primary}
          label={{
            angle: 270,
            value: 'Days',
            dx: 20,
            fill: theme.palette.text.primary,
          }}
        />
        <Tooltip content={<LabelAndValueChartTooltip />} />
        <Legend formatter={legendFormatter} />

        <Area
          type="monotone"
          dataKey="averageDevCycleTime"
          name="Dev Cycle Time"
          stroke={theme.chart.blue}
          strokeWidth={2}
          fillOpacity={1}
          unit="Days"
          fill="url(#colorDevCycleTime)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default DevCycleTimeTrendChart
