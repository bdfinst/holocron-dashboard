import { TeamMetrics } from 'api'
import { Typography, useTheme } from '@mui/material'
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  LabelAndValueChartTooltip,
  axisMaxDomain,
  getLastUpdatedMessage,
  getMonthAndMondayDayLabel,
  legendFormatter,
  padAndSortAscendingWeekEntires,
  roundValue,
} from 'utils/DashboardWidgetWrapper'
import helpContent from './helpContent.md'

type CodeReviewTrendChartDataPoint = {
  xAxisTick: string
  averageAgeInDaysCodeReviewWasOpen: number
}

export const getCodeReviewTrendChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): CodeReviewTrendChartDataPoint[] => {
  // since it is a team only chart
  const [teamMetrics] = apiMetrics
  const dataPoints = teamMetrics.historicalData.map(
    ({ week, averageAgeInDaysCodeReviewWasOpen }) => ({
      week,
      averageAgeInDaysCodeReviewWasOpen: roundValue(
        averageAgeInDaysCodeReviewWasOpen,
        2,
      ),
    }),
  )

  return padAndSortAscendingWeekEntires(
    dataPoints,
    {
      week: '',
      averageAgeInDaysCodeReviewWasOpen: 0,
    },
    weekRange,
  ).map(({ week, averageAgeInDaysCodeReviewWasOpen }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    averageAgeInDaysCodeReviewWasOpen,
  }))
}

export type CodeReviewTrendChartProps = {
  data: CodeReviewTrendChartDataPoint[]
}

export const CodeReviewTrendChart = ({ data }: CodeReviewTrendChartProps) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient
            id="colorAverageAgeInDaysCodeReviewWasOpen"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={theme.chart.green} stopOpacity={0.8} />
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
          dataKey="averageAgeInDaysCodeReviewWasOpen"
          name="Days Pull Request Was Open"
          stroke={theme.chart.green}
          strokeWidth={2}
          fillOpacity={1}
          unit="Days"
          fill="url(#colorAverageAgeInDaysCodeReviewWasOpen)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export type CodeReviewTrendCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  apiMetrics: TeamMetrics[]
  weekRange: number
}

const CodeReviewTrendCard = ({
  apiMetrics,
  weekRange,
  cardProps,
  contentProps,
}: CodeReviewTrendCardProps) => {
  const data = getCodeReviewTrendChartData({
    apiMetrics,
    weekRange,
  })

  const { scm: lastUpdatedMessage } = getLastUpdatedMessage(apiMetrics)

  return (
    <DashboardWidgetWrapper
      title="Code Review Trend"
      helpContent={helpContent}
      Footer={
        <Typography
          variant="caption"
          aria-label="Code Review Trend Last Updated Footer"
        >
          {lastUpdatedMessage}
        </Typography>
      }
      notEnoughData={data.every(
        point => point.averageAgeInDaysCodeReviewWasOpen === 0,
      )}
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <CodeReviewTrendChart data={data} />
    </DashboardWidgetWrapper>
  )
}

export default CodeReviewTrendCard
