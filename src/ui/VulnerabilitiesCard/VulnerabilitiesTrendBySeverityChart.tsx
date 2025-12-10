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

type VulnerabilitiesTrendBySeverityChartDataPoint = {
  xAxisTick: string
  highSeverityVulnerabilities: number
  mediumSeverityVulnerabilities: number
  lowSeverityVulnerabilities: number
}

export type VulnerabilitiesTrendBySeverityChartProps = {
  data: VulnerabilitiesTrendBySeverityChartDataPoint[]
}

export const getVulnerabilitiesTrendBySeverityChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): VulnerabilitiesTrendBySeverityChartProps['data'] => {
  const [teamMetrics] = apiMetrics

  return padAndSortAscendingWeekEntires(
    teamMetrics.historicalData.map(
      ({
        week,
        highSeverityVulnerabilities,
        mediumSeverityVulnerabilities,
        lowSeverityVulnerabilities,
      }) => ({
        week,
        highSeverityVulnerabilities,
        mediumSeverityVulnerabilities,
        lowSeverityVulnerabilities,
      }),
    ),
    {
      week: '',
      highSeverityVulnerabilities: 0,
      mediumSeverityVulnerabilities: 0,
      lowSeverityVulnerabilities: 0,
    },
    weekRange,
  ).map(
    ({
      week,
      highSeverityVulnerabilities,
      mediumSeverityVulnerabilities,
      lowSeverityVulnerabilities,
    }) => ({
      xAxisTick: getMonthAndMondayDayLabel(week),
      highSeverityVulnerabilities,
      mediumSeverityVulnerabilities,
      lowSeverityVulnerabilities,
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
      const totalVulnerabilities: number = payload.reduce(
        (result: number, { value: vulnerabilities }) =>
          result + (vulnerabilities as number),
        0,
      )

      return (
        <>
          {payload.map(({ name: severity, value: vulnerabilities, color }) => (
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
                {vulnerabilities} (
                {roundValue(
                  safeDivide(vulnerabilities as number, totalVulnerabilities) *
                    100,
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
            <Typography aria-label="Total Value">
              {totalVulnerabilities}
            </Typography>
          </Stack>
        </>
      )
    }}
  </ChartTooltipWrapper>
)

const VulnerabilitiesTrendBySeverityChart = ({
  data,
}: VulnerabilitiesTrendBySeverityChartProps) => {
  const theme = useTheme()

  const lines = [
    {
      dataKey: 'highSeverityVulnerabilities',
      name: 'High Severity Vulnerabilities',
      color: theme.chart.red,
    },
    {
      dataKey: 'mediumSeverityVulnerabilities',
      name: 'Medium Severity Vulnerabilities',
      color: theme.chart.yellow,
    },
    {
      dataKey: 'lowSeverityVulnerabilities',
      name: 'Low Severity Vulnerabilities',
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

export default VulnerabilitiesTrendBySeverityChart
