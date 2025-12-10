import { alpha, useTheme } from '@mui/material'
import {
  axisMaxDomain,
  getMonthAndMondayDayLabel,
  legendFormatter,
  padAndSortAscendingWeekEntires,
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
import globalConfig from 'globalConfig'
import { TeamMetrics } from 'api'
import { ChartTooltip } from './EffortDaysChart'

const { METRICS_SETTINGS } = globalConfig
const { FTE_RATE_UNIT } = METRICS_SETTINGS

type EffortCostsChartDataPoint = {
  xAxisTick: string
  amountSpentOnFeatures: number
  amountSpentOnDefects: number
  amountSpentOnUnplanned: number
  amountSpentOnMaintenance: number
}

export type EffortCostsChartProps = {
  data: EffortCostsChartDataPoint[]
}

export const getEffortCostsChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): EffortCostsChartProps['data'] => {
  const weekToHelperData: {
    [week: string]: {
      week: string
      amountSpentOnFeatures: number
      amountSpentOnDefects: number
      amountSpentOnUnplanned: number
      amountSpentOnMaintenance: number
    }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const {
      week,
      amountSpentOnDefects,
      amountSpentOnFeatures,
      amountSpentOnMaintenance,
      amountSpentOnUnplanned,
    } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : {
              week,
              amountSpentOnDefects: 0,
              amountSpentOnFeatures: 0,
              amountSpentOnMaintenance: 0,
              amountSpentOnUnplanned: 0,
            }
      dataPoint.amountSpentOnDefects += amountSpentOnDefects
      dataPoint.amountSpentOnMaintenance += amountSpentOnMaintenance
      dataPoint.amountSpentOnUnplanned += amountSpentOnUnplanned
      dataPoint.amountSpentOnFeatures += amountSpentOnFeatures
      weekToHelperData[week] = dataPoint
    }
  }

  return padAndSortAscendingWeekEntires(
    Object.values(weekToHelperData),
    {
      week: '',
      amountSpentOnDefects: 0,
      amountSpentOnFeatures: 0,
      amountSpentOnMaintenance: 0,
      amountSpentOnUnplanned: 0,
    },
    weekRange,
  ).map(
    ({
      week,
      amountSpentOnDefects,
      amountSpentOnFeatures,
      amountSpentOnMaintenance,
      amountSpentOnUnplanned,
    }) => ({
      xAxisTick: getMonthAndMondayDayLabel(week),
      amountSpentOnDefects,
      amountSpentOnFeatures,
      amountSpentOnMaintenance,
      amountSpentOnUnplanned,
    }),
  )
}

const EffortCostsChart = ({ data }: EffortCostsChartProps) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
        <XAxis
          dataKey="xAxisTick"
          stroke={theme.palette.text.primary}
          height={45}
          angle={45}
          dy={10}
        />
        <YAxis
          domain={[0, axisMaxDomain]}
          orientation="right"
          stroke={theme.palette.text.primary}
          tickFormatter={(tick: number) => `${FTE_RATE_UNIT}${tick}`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend formatter={legendFormatter} />

        <Area
          name="Defects"
          type="monotone"
          dataKey="amountSpentOnDefects"
          stackId="1"
          unit={FTE_RATE_UNIT}
          fill={alpha(theme.chart.red, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.red}
        />

        <Area
          name="Unplanned"
          type="monotone"
          dataKey="amountSpentOnUnplanned"
          stackId="1"
          unit={FTE_RATE_UNIT}
          fill={alpha(theme.chart.yellow, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.yellow}
        />

        <Area
          name="Maintenance"
          type="monotone"
          dataKey="amountSpentOnMaintenance"
          stackId="1"
          unit={FTE_RATE_UNIT}
          fill={alpha(theme.chart.blue, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.blue}
        />

        <Area
          name="Features"
          dataKey="amountSpentOnFeatures"
          type="monotone"
          stackId="1"
          unit={FTE_RATE_UNIT}
          fill={alpha(theme.chart.green, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.green}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default EffortCostsChart
