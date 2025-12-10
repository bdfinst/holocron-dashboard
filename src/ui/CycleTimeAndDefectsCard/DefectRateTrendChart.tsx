import { useTheme } from '@mui/material'
import { TeamMetrics } from 'api'
import {
  axisMaxDomain,
  getMonthAndMondayDayLabel,
  LabelAndValueChartTooltip,
  legendFormatter,
  padAndSortAscendingWeekEntires,
} from 'utils/DashboardWidgetWrapper'
import {
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
} from 'recharts'

type DefectRateTrendChartDataPoint = {
  xAxisTick: string
  defectsCreated: number
}

export type DefectRateTrendChartProps = {
  data: DefectRateTrendChartDataPoint[]
}

export const getDefectRateTrendChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): DefectRateTrendChartDataPoint[] => {
  const weekToHelperData: {
    [week: string]: { week: string; defectsCreated: number }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const { week, defectsCreated } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : {
              week,
              defectsCreated: 0,
            }
      dataPoint.defectsCreated += defectsCreated
      weekToHelperData[week] = dataPoint
    }
  }

  return padAndSortAscendingWeekEntires(
    Object.values(weekToHelperData),
    {
      week: '',
      defectsCreated: 0,
    },
    weekRange,
  ).map(({ week, defectsCreated }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    defectsCreated,
  }))
}

const DefectRateTrendChart = ({ data }: DefectRateTrendChartProps) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorDefectsCreated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.chart.red} stopOpacity={0.8} />
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
          dataKey="defectsCreated"
          name="Defect Rate"
          stroke={theme.chart.red}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorDefectsCreated)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default DefectRateTrendChart
