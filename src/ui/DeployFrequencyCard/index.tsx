import { TeamMetrics } from 'api'
import { Box, Stack, alpha, useTheme } from '@mui/material'
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts'
import {
  DefectRateTrendChart,
  getDefectRateTrendChartData,
} from 'ui/CycleTimeAndDefectsCard'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  LabelAndValueChartTooltip,
  axisMaxDomain,
  getMonthAndMondayDayLabel,
  legendFormatter,
  padAndSortAscendingWeekEntires,
} from 'utils/DashboardWidgetWrapper'
import helpContent from './helpContent.md'

type DeployFrequencyChartData = {
  xAxisTick: string
  deploys: number
}

export type DeployFrequencyChartProps = {
  data: DeployFrequencyChartData[]
}

export const getDeployFrequencyChartData = ({
  apiMetrics,
  weekRange,
}: {
  apiMetrics: TeamMetrics[]
  weekRange: number
}): DeployFrequencyChartProps['data'] => {
  const weekToHelperData: {
    [week: string]: { week: string; deploys: number }
  } = {}

  for (const teamMetrics of apiMetrics) {
    for (const { week, totalDeploys } of teamMetrics.historicalData) {
      const dataPoint =
        week in weekToHelperData
          ? weekToHelperData[week]
          : {
              week,
              deploys: 0,
            }
      dataPoint.deploys += totalDeploys
      weekToHelperData[week] = dataPoint
    }
  }

  return padAndSortAscendingWeekEntires(
    Object.values(weekToHelperData),
    { week: '', deploys: 0 },
    weekRange,
  ).map(({ week, deploys }) => ({
    xAxisTick: getMonthAndMondayDayLabel(week),
    deploys,
  }))
}

export const DeployFrequencyChart = ({ data }: DeployFrequencyChartProps) => {
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
          name="Deploy Frequency"
          type="monotone"
          dataKey="deploys"
          fill={alpha(theme.chart.yellow, theme.chart.fillTransparencyPct)}
          stroke={theme.chart.yellow}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export type DeployFrequencyCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  apiMetrics: TeamMetrics[]
  weekRange: number
}

const AdditionalInformation = ({
  apiMetrics,
  weekRange,
}: Omit<DeployFrequencyCardProps, 'cardProps' | 'contentProps'>) => {
  const deployFrequencyChartData = getDeployFrequencyChartData({
    apiMetrics,
    weekRange,
  })
  const defectRateTrendChartData = getDefectRateTrendChartData({
    apiMetrics,
    weekRange,
  })

  return (
    <Stack spacing={2}>
      <DashboardWidgetWrapper
        title="Deploys & Defects"
        notEnoughData={deployFrequencyChartData.every(
          point => point.deploys === 0,
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
            height: { md: 400, xs: 800 },
          },
        }}
      >
        <Stack sx={{ height: 'inherit' }}>
          <Box sx={{ height: '45%' }}>
            <DeployFrequencyChart data={deployFrequencyChartData} />
          </Box>
          <Box sx={{ height: '45%' }}>
            <DefectRateTrendChart data={defectRateTrendChartData} />
          </Box>
        </Stack>
      </DashboardWidgetWrapper>
    </Stack>
  )
}

const DeployFrequencyCard = ({
  apiMetrics,
  weekRange,
  cardProps,
  contentProps,
}: DeployFrequencyCardProps) => {
  const deployFrequencyChartData = getDeployFrequencyChartData({
    apiMetrics,
    weekRange,
  })

  return (
    <DashboardWidgetWrapper
      title="Deploy Frequency"
      notEnoughData={deployFrequencyChartData.every(
        point => point.deploys === 0,
      )}
      helpContent={helpContent}
      AdditionalInformation={
        <AdditionalInformation apiMetrics={apiMetrics} weekRange={weekRange} />
      }
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <DeployFrequencyChart data={deployFrequencyChartData} />
    </DashboardWidgetWrapper>
  )
}

export default DeployFrequencyCard
