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
  roundValue,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'

type LeadTimeTrendChartDataPoint = {
  xAxisTick: string
  averageStoryLeadTime: number
}

export type LeadTimeTrendChartProps = {
  data: LeadTimeTrendChartDataPoint[]
}

export const getLeadTimeTrendChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): LeadTimeTrendChartDataPoint[] => {
  const weekToHelperData: {
    [week: string]: { week: string; totalLeadTime: number; issueCount: number }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const { week, ticketLeadTimes } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : {
              week,
              totalLeadTime: 0,
              issueCount: 0,
            }
      dataPoint.totalLeadTime += ticketLeadTimes.reduce(
        (total, { days }) => total + days,
        0,
      )
      dataPoint.issueCount += ticketLeadTimes.length
      weekToHelperData[week] = dataPoint
    }
  }

  const leadTimeTrendChartDataPoints = Object.values(weekToHelperData).map(
    point => ({
      week: point.week,
      averageStoryLeadTime: roundValue(
        safeDivide(point.totalLeadTime, point.issueCount),
        2,
      ),
    }),
  )

  return padAndSortAscendingWeekEntires(
    leadTimeTrendChartDataPoints,
    {
      week: '',
      averageStoryLeadTime: 0,
    },
    weekRange,
  ).map(({ week, averageStoryLeadTime }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    averageStoryLeadTime,
  }))
}

const LeadTimeTrendChart = ({ data }: LeadTimeTrendChartProps) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient
            id="colorAverageStoryLeadTime"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
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
          dataKey="averageStoryLeadTime"
          name="Lead Time"
          stroke={theme.chart.blue}
          strokeWidth={2}
          fillOpacity={1}
          unit="Days"
          fill="url(#colorAverageStoryLeadTime)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default LeadTimeTrendChart
