import { TeamMetrics } from 'api'
import { Stack, Typography, alpha, useTheme } from '@mui/material'
import {
  Bar,
  BarChart,
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
} from 'utils/DashboardWidgetWrapper'
import helpContent from './helpContent.md'
import CumulativeWorkflowChartDetailsTable, {
  getCumulativeWorkflowChartDetailsTableData,
} from './CumulativeWorkflowChartDetailsTable'

type CumulativeFlowChartDataPoint = {
  xAxisTick: string
  amountOfTicketsInBacklog: number
  amountOfTicketsInProgress: number
}

export type CumulativeFlowChartProps = {
  data: CumulativeFlowChartDataPoint[]
}

export const getCumulativeWorkflowChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): CumulativeFlowChartProps['data'] => {
  const weekToHelperData: {
    [week: string]: {
      week: string
      amountOfTicketsInBacklog: number
      amountOfTicketsInProgress: number
    }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const {
      week,
      totalTicketsInBacklog,
      totalTicketsInProgress,
    } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : {
              week,
              amountOfTicketsInBacklog: 0,
              amountOfTicketsInProgress: 0,
            }
      dataPoint.amountOfTicketsInBacklog += totalTicketsInBacklog
      dataPoint.amountOfTicketsInProgress += totalTicketsInProgress
      weekToHelperData[week] = dataPoint
    }
  }

  return padAndSortAscendingWeekEntires(
    Object.values(weekToHelperData),
    {
      week: '',
      amountOfTicketsInBacklog: 0,
      amountOfTicketsInProgress: 0,
    },
    weekRange,
  ).map(({ week, amountOfTicketsInBacklog, amountOfTicketsInProgress }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    amountOfTicketsInBacklog,
    amountOfTicketsInProgress,
  }))
}

export const CumulativeFlowChart = ({ data }: CumulativeFlowChartProps) => {
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
          allowDecimals={false}
          stroke={theme.palette.text.primary}
        />
        <Tooltip content={<LabelAndValueChartTooltip />} />
        <Legend height={45} formatter={legendFormatter} />
        <Bar
          name="In Progress"
          type="monotone"
          dataKey="amountOfTicketsInProgress"
          unit="Issues"
          stackId="1"
          fill={alpha(theme.chart.blue, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.blue}
        />
        <Bar
          name="Backlog"
          type="monotone"
          dataKey="amountOfTicketsInBacklog"
          unit="Issues"
          stackId="1"
          fill={alpha(theme.chart.green, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.green}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export type CumulativeFlowCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  apiMetrics: TeamMetrics[]
  weekRange: number
}

const AdditionalInformation = ({
  apiMetrics,
  weekRange,
}: Omit<CumulativeFlowCardProps, 'cardProps' | 'contentProps'>) => {
  const cumulativeFlowChartData = getCumulativeWorkflowChartData({
    apiMetrics,
    weekRange,
  })
  const { amountOfOutdatedTickets, averageAgeOfBacklogTickets } =
    getCumulativeWorkflowChartDetailsTableData({
      apiMetrics,
    })

  return (
    <Stack spacing={2}>
      <DashboardWidgetWrapper
        title="Cumulative Workflow"
        notEnoughData={cumulativeFlowChartData.every(
          point =>
            point.amountOfTicketsInBacklog === 0 &&
            point.amountOfTicketsInProgress === 0,
        )}
        cardProps={{
          variant: 'outlined',
          sx: {
            textAlign: 'center',
            color: 'text.secondary',
            p: 1,
          },
        }}
        contentProps={{
          sx: {
            height: { md: 200, xs: 400 },
          },
        }}
      >
        <CumulativeFlowChart data={cumulativeFlowChartData} />
      </DashboardWidgetWrapper>
      <CumulativeWorkflowChartDetailsTable
        amountOfOutdatedTickets={amountOfOutdatedTickets}
        averageAgeOfBacklogTickets={averageAgeOfBacklogTickets}
      />
    </Stack>
  )
}

const CumulativeFlowCard = ({
  apiMetrics,
  weekRange,
  cardProps,
  contentProps,
}: CumulativeFlowCardProps) => {
  const { workflow: lastUpdatedMessage } = getLastUpdatedMessage(apiMetrics)
  const data = getCumulativeWorkflowChartData({
    apiMetrics,
    weekRange,
  })

  return (
    <DashboardWidgetWrapper
      title="Cumulative Workflow"
      helpContent={helpContent}
      notEnoughData={data.every(
        point =>
          point.amountOfTicketsInBacklog === 0 &&
          point.amountOfTicketsInProgress === 0,
      )}
      Footer={
        <Typography
          variant="caption"
          aria-label="Cumulative Workflow Last Updated Footer"
        >
          {lastUpdatedMessage}
        </Typography>
      }
      AdditionalInformation={
        <AdditionalInformation apiMetrics={apiMetrics} weekRange={weekRange} />
      }
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <CumulativeFlowChart data={data} />
    </DashboardWidgetWrapper>
  )
}

export default CumulativeFlowCard
