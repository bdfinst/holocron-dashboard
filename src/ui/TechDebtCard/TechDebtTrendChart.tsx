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

type TechDebtTrendChartDataPoint = {
  xAxisTick: string
  totalTechDebt: number
}

export type TechDebtTrendChartProps = {
  data: TechDebtTrendChartDataPoint[]
}

export const getTechDebtTrendChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): TechDebtTrendChartDataPoint[] => {
  const weekToHelperData: {
    [week: string]: {
      week: string
      totalTechDebt: number
    }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const { week, maintainabilityIssues } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : {
              week,
              totalTechDebt: 0,
            }
      dataPoint.totalTechDebt += maintainabilityIssues
      weekToHelperData[week] = dataPoint
    }
  }

  return padAndSortAscendingWeekEntires(
    Object.values(weekToHelperData),
    {
      week: '',
      totalTechDebt: 0,
    },
    weekRange,
  ).map(({ week, totalTechDebt }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    totalTechDebt,
  }))
}

const TechDebtTrendChart = ({ data }: TechDebtTrendChartProps) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTechDebt" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={theme.chart.yellow}
              stopOpacity={0.8}
            />
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
            value: 'Tech Debts',
            dx: 20,
            fill: theme.palette.text.primary,
          }}
        />
        <Tooltip content={<LabelAndValueChartTooltip />} />
        <Legend formatter={legendFormatter} />
        <Area
          type="monotone"
          dataKey="totalTechDebt"
          name="Tech Debts"
          stroke={theme.chart.yellow}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorTechDebt)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default TechDebtTrendChart
