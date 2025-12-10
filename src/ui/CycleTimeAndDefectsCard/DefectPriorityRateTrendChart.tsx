import { Stack, Typography, alpha, useTheme } from '@mui/material'
import { TeamMetrics } from 'api'
import {
  axisMaxDomain,
  ChartTooltipWrapper,
  ChartTooltipWrapperProps,
  getMonthAndMondayDayLabel,
  legendFormatter,
  padAndSortAscendingWeekEntires,
  roundValue,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type DefectPriorityRateTrendChartDataPoint = {
  xAxisTick: string
  highestPriorityDefectsCreated: number
  highPriorityDefectsCreated: number
  mediumPriorityDefectsCreated: number
  lowPriorityDefectsCreated: number
  lowestPriorityDefectsCreated: number
}

export type DefectPriorityRateTrendChartProps = {
  data: DefectPriorityRateTrendChartDataPoint[]
}

const makeEmptyWeekDataPoint = (week: string) => ({
  week,
  highestPriorityDefectsCreated: 0,
  highPriorityDefectsCreated: 0,
  mediumPriorityDefectsCreated: 0,
  lowPriorityDefectsCreated: 0,
  lowestPriorityDefectsCreated: 0,
})

export const getDefectPriorityRateTrendChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): DefectPriorityRateTrendChartDataPoint[] => {
  const weekToHelperData: {
    [week: string]: {
      week: string
      highestPriorityDefectsCreated: number
      highPriorityDefectsCreated: number
      mediumPriorityDefectsCreated: number
      lowPriorityDefectsCreated: number
      lowestPriorityDefectsCreated: number
    }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const {
      week,
      highestPriorityDefectsCreated,
      highPriorityDefectsCreated,
      mediumPriorityDefectsCreated,
      lowPriorityDefectsCreated,
      lowestPriorityDefectsCreated,
    } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : makeEmptyWeekDataPoint(week)
      dataPoint.highestPriorityDefectsCreated += highestPriorityDefectsCreated
      dataPoint.highPriorityDefectsCreated += highPriorityDefectsCreated
      dataPoint.mediumPriorityDefectsCreated += mediumPriorityDefectsCreated
      dataPoint.lowPriorityDefectsCreated += lowPriorityDefectsCreated
      dataPoint.lowestPriorityDefectsCreated += lowestPriorityDefectsCreated
      weekToHelperData[week] = dataPoint
    }
  }

  return padAndSortAscendingWeekEntires(
    Object.values(weekToHelperData),
    makeEmptyWeekDataPoint(''),
    weekRange,
  ).map(({ week, ...point }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    ...point,
  }))
}

export type ChartTooltipProps = Omit<
  ChartTooltipWrapperProps,
  'children' | 'showLabel'
>

export const ChartTooltip = (tooltipProps: ChartTooltipProps) => (
  <ChartTooltipWrapper {...tooltipProps}>
    {({ payload }) => {
      const totalDefects: number = payload.reduce(
        (result: number, { value: numberOfDefectsWithPriority }) =>
          result + (numberOfDefectsWithPriority as number),
        0,
      )

      return (
        <>
          {payload.map(
            ({
              name: priorityType,
              value: numberOfDefectsWithPriority,
              color,
            }) => (
              <Stack
                key={`${priorityType}`}
                spacing={1}
                justifyContent="space-between"
                direction={{ sm: 'row', xs: 'column' }}
              >
                <Typography color={color} aria-label={`${priorityType}`}>
                  {priorityType}:
                </Typography>
                <Typography aria-label={`${priorityType} Value`}>
                  {numberOfDefectsWithPriority} (
                  {roundValue(
                    safeDivide(
                      numberOfDefectsWithPriority as number,
                      totalDefects,
                    ) * 100,
                  )}
                  %)
                </Typography>
              </Stack>
            ),
          )}
          <Stack
            spacing={1}
            justifyContent="space-between"
            direction={{ sm: 'row', xs: 'column' }}
          >
            <Typography aria-label="Total">Total:</Typography>
            <Typography aria-label="Total Value">{totalDefects}</Typography>
          </Stack>
        </>
      )
    }}
  </ChartTooltipWrapper>
)

const DefectPriorityRateTrendChart = ({
  data,
}: DefectPriorityRateTrendChartProps) => {
  const theme = useTheme()

  const lines = [
    {
      dataKey: 'highestPriorityDefectsCreated',
      name: 'Highest Priority Defects',
      color: theme.chart.red,
    },
    {
      dataKey: 'highPriorityDefectsCreated',
      name: 'High Priority Defects',
      color: theme.chart.orange,
    },
    {
      dataKey: 'mediumPriorityDefectsCreated',
      name: 'Medium Priority Defects',
      color: theme.chart.yellow,
    },
    {
      dataKey: 'lowPriorityDefectsCreated',
      name: 'Low Priority Defects',
      color: theme.chart.blue,
    },
    {
      dataKey: 'lowestPriorityDefectsCreated',
      name: 'Lowest Priority Defects',
      color: theme.chart.green,
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

export default DefectPriorityRateTrendChart
