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
  LabelAndValueChartTooltip,
  axisMaxDomain,
  getMonthAndMondayDayLabel,
  legendFormatter,
  padAndSortAscendingWeekEntires,
} from 'utils/DashboardWidgetWrapper'

type VulnerabilitiesTrendChartDataPoint = {
  xAxisTick: string
  vulnerabilities: number
}

export type VulnerabilitiesTrendChartProps = {
  data: VulnerabilitiesTrendChartDataPoint[]
}

export const getVulnerabilitiesTrendChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): VulnerabilitiesTrendChartProps['data'] => {
  const [teamMetrics] = apiMetrics

  return padAndSortAscendingWeekEntires(
    teamMetrics.historicalData.map(({ week, vulnerabilities }) => ({
      week,
      vulnerabilities,
    })),
    {
      week: '',
      vulnerabilities: 0,
    },
    weekRange,
  ).map(({ week, vulnerabilities }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    vulnerabilities,
  }))
}

const VulnerabilitiesTrendChart = ({
  data,
}: VulnerabilitiesTrendChartProps) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorVulnerabilities" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.chart.red} stopOpacity={0.8} />
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
        />
        <Tooltip content={<LabelAndValueChartTooltip />} />
        <Legend formatter={legendFormatter} />
        <Area
          type="monotone"
          dataKey="vulnerabilities"
          name="Vulnerabilities"
          stroke={theme.chart.red}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorVulnerabilities)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default VulnerabilitiesTrendChart
