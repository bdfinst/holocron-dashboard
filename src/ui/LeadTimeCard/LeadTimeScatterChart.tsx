import { alpha, Box, Stack, Typography, useTheme } from '@mui/material'
import { TeamMetrics } from 'api'
import {
  axisMaxDomain,
  ChartTooltipWrapper,
  ChartTooltipWrapperProps,
  getMonthAndMondayDayLabel,
  padAndSortAscendingWeekEntires,
  roundValue,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'
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

type LeadTimeScatterChartDataPoint = {
  xAxisTick: string
  averageStoryLeadTime: number
  leadTime: number | null
  numberOfIssues: number
}

export type LeadTimeScatterChartProps = {
  data: LeadTimeScatterChartDataPoint[]
}

export const getLeadTimeScatterChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}) => {
  const weekToLeadTimeFrequencyTable: {
    [week: string]: {
      [leadTime: number]: number
    }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const { week, ticketLeadTimes } of teamMetrics.historicalData) {
      const leadTimeFrequencyTable: { [leadTime: number]: number } =
        week in weekToLeadTimeFrequencyTable
          ? weekToLeadTimeFrequencyTable[week]
          : {}

      for (const { days } of ticketLeadTimes) {
        // rounding lead time to precision 2 since there can
        // be many lead times with more precision, but we
        // do not care past last 2 decimal places.
        const leadTimeKey = roundValue(days, 2)
        if (leadTimeKey in leadTimeFrequencyTable) {
          leadTimeFrequencyTable[leadTimeKey] += 1
        } else {
          leadTimeFrequencyTable[leadTimeKey] = 1
        }
      }

      weekToLeadTimeFrequencyTable[week] = leadTimeFrequencyTable
    }
  }

  const chartDataPointsWithoutXAxisTick = Object.entries(
    weekToLeadTimeFrequencyTable,
  ).flatMap(([week, leadTimeFrequencyTable]) => {
    const totalLeadTime = Object.entries(leadTimeFrequencyTable).reduce(
      (result, [leadTime, numberOfIssues]) =>
        result + Number(leadTime) * numberOfIssues,
      0,
    )
    const totalNumberOfIssues = Object.values(leadTimeFrequencyTable).reduce(
      (result, numberOfIssues) => result + numberOfIssues,
      0,
    )
    const averageStoryLeadTime = roundValue(
      safeDivide(totalLeadTime, totalNumberOfIssues),
      2,
    )

    return Object.entries(leadTimeFrequencyTable).map(
      ([leadTime, numberOfIssues]) => ({
        week,
        averageStoryLeadTime,
        leadTime: Number(leadTime),
        numberOfIssues,
      }),
    )
  })

  return padAndSortAscendingWeekEntires(
    chartDataPointsWithoutXAxisTick,
    {
      week: '',
      averageStoryLeadTime: 0,
      // mapping lead time to null as filler
      // data, so that recharts does not show
      // the point, but still shows the
      // XAxisTick for the tick
      leadTime: null,
      numberOfIssues: 0,
    },
    weekRange,
  ).map(({ week, averageStoryLeadTime, leadTime, numberOfIssues }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    averageStoryLeadTime,
    leadTime,
    numberOfIssues,
  }))
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
          .payload as LeadTimeScatterChartDataPoint

        return (
          <Stack>
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
              <Typography aria-label="Lead Time" color={theme.chart.blue}>
                Lead Time:
              </Typography>
              <Typography aria-label="Lead Time Value">
                {hoveredDataPoint.leadTime} Days
              </Typography>
            </Stack>
            <Stack
              spacing={1}
              justifyContent="space-between"
              direction={{ sm: 'row', xs: 'column' }}
            >
              <Typography aria-label="Average Lead Time">
                Average Lead Time:
              </Typography>
              <Typography aria-label="Average Lead Time Value">
                {hoveredDataPoint.averageStoryLeadTime} Days
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
          </Stack>
        )
      }}
    </ChartTooltipWrapper>
  )
}

const LeadTimeScatterChart = ({ data }: LeadTimeScatterChartProps) => {
  const theme = useTheme()

  const legendFormatter: LegendProps['formatter'] = value => (
    <span style={{ color: alpha(theme.chart.blue, 1) }}>{value}</span>
  )

  const {
    maxNumberOfIssuesForGivenLeadTime,
    minNumberOfIssuesForGivenLeadTime,
  } = data.reduce(
    (result, point) => ({
      maxNumberOfIssuesForGivenLeadTime: Math.max(
        result.maxNumberOfIssuesForGivenLeadTime,
        point.numberOfIssues,
      ),
      minNumberOfIssuesForGivenLeadTime: Math.min(
        result.minNumberOfIssuesForGivenLeadTime,
        point.numberOfIssues,
      ),
    }),
    {
      minNumberOfIssuesForGivenLeadTime: 0,
      maxNumberOfIssuesForGivenLeadTime: 0,
    },
  )
  const circleRadiusSizeScaleFactor = 50
  const maxCircleRadius =
    circleRadiusSizeScaleFactor * maxNumberOfIssuesForGivenLeadTime
  const minCircleRadius =
    circleRadiusSizeScaleFactor * minNumberOfIssuesForGivenLeadTime

  return (
    <ResponsiveContainer>
      <ScatterChart>
        <defs>
          <linearGradient id="colorLeadTime" x1="0" y1="0" x2="0" y2="1">
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
          dataKey="leadTime"
          name="Lead Time"
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
         * with the given lead time. For more information see
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
          fill="url(#colorLeadTime)"
          name="Lead Time"
          stroke={theme.chart.blue}
          type="monotone"
          strokeWidth={2}
          fillOpacity={1}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export default LeadTimeScatterChart
