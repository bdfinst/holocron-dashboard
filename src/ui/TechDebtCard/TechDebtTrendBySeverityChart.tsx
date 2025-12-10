import { TeamMetrics } from 'api'
import { Stack, Typography, alpha, useTheme } from '@mui/material'
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartTooltipWrapper,
  ChartTooltipWrapperProps,
  axisMaxDomain,
  getMonthAndMondayDayLabel,
  legendFormatter,
  padAndSortAscendingWeekEntires,
  roundValue,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'

type TechDebtTrendBySeverityChartDataPoint = {
  xAxisTick: string
  highSeverityTechDebts: number
  mediumSeverityTechDebts: number
  lowSeverityTechDebts: number
}

export type TechDebtTrendBySeverityChartProps = {
  data: TechDebtTrendBySeverityChartDataPoint[]
}

export const getTechDebtTrendBySeverityChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): TechDebtTrendBySeverityChartProps['data'] => {
  const [teamMetrics] = apiMetrics

  return padAndSortAscendingWeekEntires(
    teamMetrics.historicalData.map(
      ({
        week,
        maintainabilityHighSeverityIssues,
        maintainabilityMediumSeverityIssues,
        maintainabilityLowSeverityIssues,
      }) => ({
        week,
        highSeverityTechDebts: maintainabilityHighSeverityIssues,
        mediumSeverityTechDebts: maintainabilityMediumSeverityIssues,
        lowSeverityTechDebts: maintainabilityLowSeverityIssues,
      }),
    ),
    {
      week: '',
      highSeverityTechDebts: 0,
      mediumSeverityTechDebts: 0,
      lowSeverityTechDebts: 0,
    },
    weekRange,
  ).map(
    ({
      week,
      highSeverityTechDebts,
      mediumSeverityTechDebts,
      lowSeverityTechDebts,
    }) => ({
      xAxisTick: getMonthAndMondayDayLabel(week),
      highSeverityTechDebts,
      mediumSeverityTechDebts,
      lowSeverityTechDebts,
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
      const totalTechDebts: number = payload.reduce(
        (result: number, { value: techDebts }) =>
          result + (techDebts as number),
        0,
      )

      return (
        <>
          {payload.map(({ name: severity, value: techDebts, color }) => (
            <Stack
              key={`${severity}`}
              spacing={1}
              justifyContent="space-between"
              direction={{ sm: 'row', xs: 'column' }}
            >
              <Typography color={color} aria-label={`${severity}`}>
                {severity}:
              </Typography>
              <Typography aria-label={`${severity} Value`}>
                {techDebts} (
                {roundValue(
                  safeDivide(techDebts as number, totalTechDebts) * 100,
                )}
                %)
              </Typography>
            </Stack>
          ))}
          <Stack
            spacing={1}
            justifyContent="space-between"
            direction={{ sm: 'row', xs: 'column' }}
          >
            <Typography aria-label="Total">Total:</Typography>
            <Typography aria-label="Total Value">{totalTechDebts}</Typography>
          </Stack>
        </>
      )
    }}
  </ChartTooltipWrapper>
)

const TechDebtTrendBySeverityChart = ({
  data,
}: TechDebtTrendBySeverityChartProps) => {
  const theme = useTheme()

  const lines = [
    {
      dataKey: 'highSeverityTechDebts',
      name: 'High Severity Tech Debts',
      color: theme.chart.red,
    },
    {
      dataKey: 'mediumSeverityTechDebts',
      name: 'Medium Severity Tech Debts',
      color: theme.chart.yellow,
    },
    {
      dataKey: 'lowSeverityTechDebts',
      name: 'Low Severity Tech Debts',
      color: theme.chart.blue,
    },
  ]

  return (
    <ResponsiveContainer>
      <LineChart data={data}>
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
        {lines.map(({ dataKey, name, color }) => (
          <Line
            key={dataKey}
            type="monotone"
            dataKey={dataKey}
            name={name}
            dot={false}
            stroke={alpha(color, 1)}
          />
        ))}
        <Legend
          formatter={legendFormatter}
          wrapperStyle={{
            padding: '0 2rem',
            height: '20%',
            overflow: 'auto',
          }}
        />
        <Tooltip content={<ChartTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default TechDebtTrendBySeverityChart
