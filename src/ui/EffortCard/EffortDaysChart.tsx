import { alpha, Stack, Typography, useTheme } from '@mui/material'
import { TeamMetrics } from 'api'
import {
  axisMaxDomain,
  ChartTooltipWrapper,
  ChartTooltipWrapperProps,
  safeDivide,
  legendFormatter,
  roundValue,
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type EffortDaysChartDataPoint = {
  xAxisTick: string
  daysSpentOnFeatures: number
  daysSpentOnDefects: number
  daysSpentOnUnplanned: number
  daysSpentOnMaintenance: number
}

export type EffortDaysChartProp = {
  data: EffortDaysChartDataPoint[]
}

export const getEffortDaysChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): EffortDaysChartProp['data'] => {
  const weekToHelperData: {
    [week: string]: {
      week: string
      daysSpentOnFeatures: number
      daysSpentOnDefects: number
      daysSpentOnUnplanned: number
      daysSpentOnMaintenance: number
    }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const {
      week,
      daysSpentOnDefects,
      daysSpentOnFeatures,
      daysSpentOnMaintenance,
      daysSpentOnUnplanned,
    } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : {
              week,
              daysSpentOnDefects: 0,
              daysSpentOnFeatures: 0,
              daysSpentOnMaintenance: 0,
              daysSpentOnUnplanned: 0,
            }
      dataPoint.daysSpentOnDefects += daysSpentOnDefects
      dataPoint.daysSpentOnMaintenance += daysSpentOnMaintenance
      dataPoint.daysSpentOnUnplanned += daysSpentOnUnplanned
      dataPoint.daysSpentOnFeatures += daysSpentOnFeatures
      weekToHelperData[week] = dataPoint
    }
  }

  return padAndSortAscendingWeekEntires(
    Object.values(weekToHelperData),
    {
      week: '',
      daysSpentOnDefects: 0,
      daysSpentOnFeatures: 0,
      daysSpentOnMaintenance: 0,
      daysSpentOnUnplanned: 0,
    },
    weekRange,
  ).map(
    ({
      week,
      daysSpentOnDefects,
      daysSpentOnFeatures,
      daysSpentOnMaintenance,
      daysSpentOnUnplanned,
    }) => ({
      xAxisTick: getMonthAndMondayDayLabel(week),
      daysSpentOnDefects,
      daysSpentOnFeatures,
      daysSpentOnMaintenance,
      daysSpentOnUnplanned,
    }),
  )
}

export type ChartTooltipProps = Omit<
  ChartTooltipWrapperProps,
  'children' | 'showLabel'
>

export const ChartTooltip = (tooltipProps: ChartTooltipProps) => (
  <ChartTooltipWrapper {...tooltipProps}>
    {({ payload }) => {
      const totalEffort = payload.reduce((result, effortType) => {
        const value = effortType.value as number
        return result + value
      }, 0)

      return (
        <Stack>
          {payload.map(effortType => (
            <Stack
              key={effortType.name}
              spacing={1}
              justifyContent="space-between"
              direction={{ sm: 'row', xs: 'column' }}
            >
              <Typography
                color={alpha(effortType.color, 1)}
                sx={{ fontWeight: 'bold' }}
              >
                {effortType.name}:
              </Typography>
              <Typography
                aria-label={`Amount of ${effortType.name}`}
                color={alpha(effortType.color, 1)}
              >
                {roundValue(effortType.value as number, 2)} {effortType.unit} (
                {Math.round(
                  safeDivide(effortType.value as number, totalEffort) * 100,
                )}
                %)
              </Typography>
            </Stack>
          ))}
          <Stack
            direction={{ sm: 'row', xs: 'column' }}
            spacing={1}
            justifyContent="space-between"
          >
            <Typography sx={{ fontWeight: 'bold' }}>Total:</Typography>
            <Typography aria-label="Total Amount">
              {roundValue(totalEffort, 2)} {payload[0].unit}
            </Typography>
          </Stack>
        </Stack>
      )
    }}
  </ChartTooltipWrapper>
)

const EffortDaysChart = ({ data }: EffortDaysChartProp) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <BarChart data={data}>
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
          label={{
            angle: 270,
            value: 'FTE Days',
            dx: 20,
            fill: theme.palette.text.primary,
          }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend formatter={legendFormatter} />

        <Bar
          name="Defects"
          type="monotone"
          dataKey="daysSpentOnDefects"
          stackId="1"
          unit="FTE Days"
          fill={alpha(theme.chart.red, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.red}
        />

        <Bar
          name="Unplanned"
          type="monotone"
          dataKey="daysSpentOnUnplanned"
          stackId="1"
          unit="FTE Days"
          fill={alpha(theme.chart.yellow, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.yellow}
        />

        <Bar
          name="Maintenance"
          type="monotone"
          dataKey="daysSpentOnMaintenance"
          stackId="1"
          unit="FTE Days"
          fill={alpha(theme.chart.blue, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.blue}
        />

        <Bar
          name="Features"
          dataKey="daysSpentOnFeatures"
          type="monotone"
          stackId="1"
          unit="FTE Days"
          radius={[3, 3, 0, 0]}
          fill={alpha(theme.chart.green, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.green}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default EffortDaysChart
