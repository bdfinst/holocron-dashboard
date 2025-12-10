import { Stack, Typography, useTheme } from '@mui/material'
import {
  ChartTooltipWrapper,
  ChartTooltipWrapperProps,
  roundValue,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { DefectPriorityRateTrendChartProps } from './DefectPriorityRateTrendChart'

type DefectPriorityPieChartSector = {
  defectPriority: string
  defectsCreated: number
}

export type DefectPriorityPieChartProps = {
  data: DefectPriorityPieChartSector[]
}

const useSectorColors = () => {
  const theme = useTheme()
  return {
    'Highest Priority Defects': theme.chart.red,
    'High Priority Defects': theme.chart.orange,
    'Medium Priority Defects': theme.chart.yellow,
    'Low Priority Defects': theme.chart.blue,
    'Lowest Priority Defects': theme.chart.green,
  }
}

export type ChartTooltipProps = Omit<
  ChartTooltipWrapperProps,
  'children' | 'showLabel'
> & { totalDefectsCreated: number }

export const ChartTooltip = ({
  totalDefectsCreated,
  ...tooltipProps
}: ChartTooltipProps) => {
  const colors = useSectorColors()

  return (
    <ChartTooltipWrapper {...tooltipProps}>
      {({ payload }) => {
        const [{ name: defectPriority, value: defectsCreated }] = payload

        return (
          <>
            <Stack
              spacing={1}
              justifyContent="space-between"
              direction={{ sm: 'row', xs: 'column' }}
            >
              <Typography
                color={colors[defectPriority]}
                aria-label={`${defectPriority}`}
              >
                {defectPriority}:
              </Typography>
              <Typography aria-label={`${defectPriority} Value`}>
                {defectsCreated} (
                {roundValue(
                  safeDivide(defectsCreated as number, totalDefectsCreated) *
                    100,
                )}
                %)
              </Typography>
            </Stack>
            <Stack
              spacing={1}
              justifyContent="space-between"
              direction={{ sm: 'row', xs: 'column' }}
            >
              <Typography aria-label="Total">Total:</Typography>
              <Typography aria-label="Total Value">
                {totalDefectsCreated}
              </Typography>
            </Stack>
          </>
        )
      }}
    </ChartTooltipWrapper>
  )
}

export const getDefectPriorityPieChartData = (
  defectPriorityRateTrendChartData: DefectPriorityRateTrendChartProps['data'],
): DefectPriorityPieChartSector[] => {
  const sectors: DefectPriorityPieChartSector[] = [
    {
      defectPriority: 'Highest Priority Defects',
      defectsCreated: 0,
    },
    {
      defectPriority: 'High Priority Defects',
      defectsCreated: 0,
    },
    {
      defectPriority: 'Medium Priority Defects',
      defectsCreated: 0,
    },
    {
      defectPriority: 'Low Priority Defects',
      defectsCreated: 0,
    },
    {
      defectPriority: 'Lowest Priority Defects',
      defectsCreated: 0,
    },
  ]
  const [
    highestPriorityDefectsSector,
    highPriorityDefectsSector,
    mediumPriorityDefectsSector,
    lowPriorityDefectsSector,
    lowestPriorityDefectsSector,
  ] = sectors

  for (const entry of defectPriorityRateTrendChartData) {
    highestPriorityDefectsSector.defectsCreated +=
      entry.highestPriorityDefectsCreated
    highPriorityDefectsSector.defectsCreated += entry.highPriorityDefectsCreated
    mediumPriorityDefectsSector.defectsCreated +=
      entry.mediumPriorityDefectsCreated
    lowPriorityDefectsSector.defectsCreated += entry.lowPriorityDefectsCreated
    lowestPriorityDefectsSector.defectsCreated +=
      entry.lowestPriorityDefectsCreated
  }

  return sectors
}

const DefectPriorityPieChart = ({ data }: DefectPriorityPieChartProps) => {
  const colors = useSectorColors()
  const totalDefectsCreated = data.reduce(
    (total, current) => total + current.defectsCreated,
    0,
  )

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          dataKey="defectsCreated"
          isAnimationActive
          labelLine={false}
          data={data}
        >
          {data.map(sector => (
            <Cell
              key={sector.defectPriority}
              fill={colors[sector.defectPriority]}
              name={sector.defectPriority}
              stroke="none"
            />
          ))}
        </Pie>
        <Legend />
        <Tooltip
          content={<ChartTooltip totalDefectsCreated={totalDefectsCreated} />}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default DefectPriorityPieChart
