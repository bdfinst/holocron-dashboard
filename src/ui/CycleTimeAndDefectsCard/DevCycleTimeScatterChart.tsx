import { Box, Stack, Typography, alpha, useTheme } from '@mui/material'
import { TeamMetrics } from 'api'
import {
  Legend,
  LegendProps,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import {
  axisMaxDomain,
  ChartTooltipWrapper,
  ChartTooltipWrapperProps,
  getMonthAndMondayDayLabel,
  padAndSortAscendingWeekEntires,
  roundValue,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'

type DevCycleTimeScatterChartDataPoint = {
  xAxisTick: string
  averageDevCycleTime: number
  devCycleTime: number | null
  numberOfIssues: number
}

export type DevCycleTimeScatterChartProps = {
  data: DevCycleTimeScatterChartDataPoint[]
}

export type ChartTooltipProps = Omit<
  ChartTooltipWrapperProps,
  'children' | 'showLabel'
>

export const ChartTooltip = (tooltipProps: ChartTooltipProps) => {
  const theme = useTheme()

  return (
    <ChartTooltipWrapper {...tooltipProps} showLabel={false}>
      {({ payload }) => {
        const hoveredDataPoint = payload[0]
          .payload as DevCycleTimeScatterChartDataPoint

        return (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  color: 'inherit',
                  fontSize: '1em',
                  textAlign: 'center',
                }}
              >
                {hoveredDataPoint.xAxisTick}
              </Typography>
            </Box>
            <Stack
              spacing={1}
              justifyContent="space-between"
              direction={{ sm: 'row', xs: 'column' }}
            >
              <Typography aria-label="Dev Cycle Time" color={theme.chart.blue}>
                Dev Cycle Time:
              </Typography>
              <Typography aria-label="Dev Cycle Time Value">
                {hoveredDataPoint.devCycleTime} Days
              </Typography>
            </Stack>
            <Stack
              spacing={1}
              justifyContent="space-between"
              direction={{ sm: 'row', xs: 'column' }}
            >
              <Typography aria-label="Average Dev Cycle Time">
                Average Dev Cycle Time:
              </Typography>
              <Typography aria-label="Average Dev Cycle Time Value">
                {hoveredDataPoint.averageDevCycleTime} Days
              </Typography>
            </Stack>
            <Stack
              spacing={1}
              justifyContent="space-between"
              direction={{ sm: 'row', xs: 'column' }}
            >
              <Typography aria-label="Number of Issues">
                Number of Issues:
              </Typography>
              <Typography aria-label="Number of Issues Value">
                {hoveredDataPoint.numberOfIssues}
              </Typography>
            </Stack>
          </>
        )
      }}
    </ChartTooltipWrapper>
  )
}

export const getDevCycleTimeScatterChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): DevCycleTimeScatterChartDataPoint[] => {
  const weekToDevCycleTimeFrequencyTable: {
    [week: string]: {
      [devCycleTime: number]: number
    }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const {
      week,
      ticketDevelopmentCycleTimes,
    } of teamMetrics.historicalData) {
      const devCycleTimeFrequencyTable: { [devCycleTime: number]: number } =
        week in weekToDevCycleTimeFrequencyTable
          ? weekToDevCycleTimeFrequencyTable[week]
          : {}

      for (const { days } of ticketDevelopmentCycleTimes) {
        // rounding dev cycle time to precision 2 since there can
        // be many dev cycle times with more precision, but we
        // do not care past last 2 decimal places.
        const devCycleTimeKey = roundValue(days, 2)
        if (devCycleTimeKey in devCycleTimeFrequencyTable) {
          devCycleTimeFrequencyTable[devCycleTimeKey] += 1
        } else {
          devCycleTimeFrequencyTable[devCycleTimeKey] = 1
        }
      }

      weekToDevCycleTimeFrequencyTable[week] = devCycleTimeFrequencyTable
    }
  }

  const chartDataPointsWithoutXAxisTick = Object.entries(
    weekToDevCycleTimeFrequencyTable,
  ).flatMap(([week, devCycleTimeFrequencyTable]) => {
    const totalDevCycleTime = Object.entries(devCycleTimeFrequencyTable).reduce(
      (result, [devCycleTime, numberOfIssues]) =>
        result + Number(devCycleTime) * numberOfIssues,
      0,
    )

    const totalNumberOfIssues = Object.values(
      devCycleTimeFrequencyTable,
    ).reduce((result, numberOfIssues) => result + numberOfIssues, 0)

    const averageDevCycleTime = roundValue(
      safeDivide(totalDevCycleTime, totalNumberOfIssues),
      2,
    )

    return Object.entries(devCycleTimeFrequencyTable).map(
      ([devCycleTime, numberOfIssues]) => ({
        week,
        averageDevCycleTime,
        devCycleTime: Number(devCycleTime),
        numberOfIssues,
      }),
    )
  })

  return padAndSortAscendingWeekEntires(
    chartDataPointsWithoutXAxisTick,
    {
      week: '',
      averageDevCycleTime: 0,
      // mapping dev cycle time to null as filler
      // data, so that recharts does not show
      // the point, but still shows the
      // xAxisTick for the tick
      devCycleTime: null,
      numberOfIssues: 0,
    },
    weekRange,
  ).map(({ week, averageDevCycleTime, devCycleTime, numberOfIssues }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    averageDevCycleTime,
    devCycleTime,
    numberOfIssues,
  }))
}

const DevCycleTimeScatterChart = ({ data }: DevCycleTimeScatterChartProps) => {
  const theme = useTheme()

  const legendFormatter: LegendProps['formatter'] = value => (
    <span style={{ color: alpha(theme.chart.blue, 1) }}>{value}</span>
  )

  const {
    maxNumberOfIssuesForGivenDevCycleTime,
    minNumberOfIssuesForGivenDevCycleTime,
  } = data.reduce(
    (result, point) => ({
      maxNumberOfIssuesForGivenDevCycleTime: Math.max(
        result.maxNumberOfIssuesForGivenDevCycleTime,
        point.numberOfIssues,
      ),
      minNumberOfIssuesForGivenDevCycleTime: Math.min(
        result.minNumberOfIssuesForGivenDevCycleTime,
        point.numberOfIssues,
      ),
    }),
    {
      minNumberOfIssuesForGivenDevCycleTime: 0,
      maxNumberOfIssuesForGivenDevCycleTime: 0,
    },
  )
  const circleRadiusSizeScaleFactor = 50
  const maxCircleRadius =
    circleRadiusSizeScaleFactor * maxNumberOfIssuesForGivenDevCycleTime
  const minCircleRadius =
    circleRadiusSizeScaleFactor * minNumberOfIssuesForGivenDevCycleTime

  return (
    <ResponsiveContainer>
      <ScatterChart>
        <defs>
          <linearGradient id="colorDevCycleTime" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.chart.blue} stopOpacity={0.8} />
            <stop offset="95%" stopColor="gray" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="xAxisTick"
          stroke={theme.palette.text.primary}
          allowDuplicatedCategory={false}
          height={45}
          angle={45}
          dy={10}
        />
        <YAxis
          dataKey="devCycleTime"
          name="Dev Cycle Time"
          orientation="right"
          domain={[0, axisMaxDomain]}
          stroke={theme.palette.text.primary}
          label={{
            angle: 270,
            value: 'Days',
            dx: 20,
            fill: theme.palette.text.primary,
          }}
        />
        {/**
         * ZAxis creates the size of the circle
         * which is based off of the number of issues
         * with the given dev cycle time. For more information see
         * https://recharts.org/en-US/examples/ThreeDimScatterChart
         */}
        <ZAxis
          type="number"
          dataKey="numberOfIssues"
          name="Number Of Issues"
          range={[minCircleRadius, maxCircleRadius]}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend formatter={legendFormatter} />

        <Scatter
          data={data}
          fill="url(#colorDevCycleTime)"
          name="Dev Cycle Time"
          stroke={theme.chart.blue}
          type="monotone"
          strokeWidth={2}
          fillOpacity={1}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default DevCycleTimeScatterChart
