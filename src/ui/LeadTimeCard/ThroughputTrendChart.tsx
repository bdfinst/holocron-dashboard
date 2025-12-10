import { TeamMetrics } from 'api'
import { useTheme } from '@mui/material'
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  axisMaxDomain,
  getMonthAndMondayDayLabel,
  LabelAndValueChartTooltip,
  legendFormatter,
  padAndSortAscendingWeekEntires,
} from 'utils/DashboardWidgetWrapper'

type ThroughputChartDataPoint = {
  xAxisTick: string
  totalThroughput: number
}

export type ThroughputTrendChartProps = {
  data: ThroughputChartDataPoint[]
}

export const getThroughputTrendChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): ThroughputChartDataPoint[] => {
  const weekToHelperData: {
    [week: string]: { week: string; totalThroughput: number }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const { week, totalThroughput } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : {
              week,
              totalThroughput: 0,
            }
      dataPoint.totalThroughput += totalThroughput
      weekToHelperData[week] = dataPoint
    }
  }

  return padAndSortAscendingWeekEntires(
    Object.values(weekToHelperData),
    {
      week: '',
      totalThroughput: 0,
    },
    weekRange,
  ).map(({ week, totalThroughput }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    totalThroughput,
  }))
}

const ThroughputTrendChart = ({ data }: ThroughputTrendChartProps) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTotalThroughput" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.chart.green} stopOpacity={0.8} />
            <stop offset="95%" stopColor="gray" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="xAxisTick"
          stroke={theme.palette.text.primary}
          angle={45}
          height={45}
          dy={10}
        />
        <YAxis
          type="number"
          orientation="right"
          domain={[0, axisMaxDomain]}
          stroke={theme.palette.text.primary}
        />
        <Tooltip content={<LabelAndValueChartTooltip />} />
        <Legend formatter={legendFormatter} />

        <Area
          type="monotone"
          dataKey="totalThroughput"
          name="Throughput"
          stroke={theme.chart.green}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorTotalThroughput)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default ThroughputTrendChart
