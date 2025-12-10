import { alpha, Grid, Stack, Typography, useTheme } from '@mui/material'
import DashboardWidgetWrapper, {
  axisMaxDomain,
  DashboardWidgetWrapperProps,
  ChartTooltipWrapper,
  ChartTooltipWrapperProps,
} from 'utils/DashboardWidgetWrapper'
import TrendIndicator from 'utils/TrendIndicator'
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CIActivityChartDataPoint } from './utils'

type IntegrationRatesProps = {
  data: CIActivityChartDataPoint[]
}

export type ChartTooltipProps = Omit<
  ChartTooltipWrapperProps,
  'children' | 'showLabel'
>

export const ChartTooltip = (tooltipProps: ChartTooltipProps) => {
  const theme = useTheme()

  return (
    <ChartTooltipWrapper {...tooltipProps}>
      {({ payload }) => {
        const hoveredData = payload[0].payload as CIActivityChartDataPoint

        return (
          <Stack>
            <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
              <Typography color={theme.chart.blue}>
                Internal Integrations:
              </Typography>
              <Typography color={theme.palette.text.primary}>
                {hoveredData.totalInternalIntegrations}
              </Typography>
            </Stack>
            <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
              <Typography color={theme.chart.green}>
                External Integrations:
              </Typography>
              <Typography color={theme.palette.text.primary}>
                {hoveredData.totalExternalIntegrations}
              </Typography>
            </Stack>
            <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
              <Typography color={theme.chart.yellow}>
                Direct Integrations:
              </Typography>
              <Typography color={theme.palette.text.primary}>
                {hoveredData.totalDirectIntegrations}
              </Typography>
            </Stack>
          </Stack>
        )
      }}
    </ChartTooltipWrapper>
  )
}

const IntegrationRates = ({ data }: IntegrationRatesProps) => {
  const theme = useTheme()

  const lineGraphs: {
    dataKey: keyof CIActivityChartDataPoint
    color: string
    name: string
  }[] = [
    {
      dataKey: 'totalInternalIntegrations',
      color: theme.chart.blue,
      name: 'Internal Integrations',
    },
    {
      dataKey: 'totalExternalIntegrations',
      color: theme.chart.green,
      name: 'External Integrations',
    },
    {
      dataKey: 'totalDirectIntegrations',
      color: theme.chart.yellow,
      name: 'Direct Integrations',
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
        {lineGraphs.map(({ dataKey, color, name }) => (
          <Line
            key={dataKey}
            type="monotone"
            dataKey={dataKey}
            dot={false}
            stroke={alpha(color, 1)}
            name={name}
          />
        ))}
        <Tooltip content={<ChartTooltip />} />
        <Legend verticalAlign="bottom" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export type IntegrationRatesCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> &
  IntegrationRatesProps

const IntegrationRatesCard = ({
  data,
  cardProps,
  contentProps,
}: IntegrationRatesCardProps) => {
  const theme = useTheme()

  const hasEnoughData =
    data.some(point => point.totalInternalIntegrations > 0) && data.length >= 2
  return (
    <DashboardWidgetWrapper
      title="Integration Rates"
      notEnoughData={!hasEnoughData}
      cardProps={cardProps}
      contentProps={contentProps}
      Footer={
        hasEnoughData && (
          <Grid container justifyContent="space-between">
            <Grid
              item
              md={4}
              xs={12}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <TrendIndicator
                beforeValue={data[data.length - 2].totalInternalIntegrations}
                afterValue={data[data.length - 1].totalInternalIntegrations}
                title="Internal Integrations"
                titleProps={{
                  color: theme.chart.blue,
                }}
                timeFrame="week"
              />
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <TrendIndicator
                beforeValue={data[data.length - 2].totalExternalIntegrations}
                afterValue={data[data.length - 1].totalExternalIntegrations}
                title="External Integrations"
                titleProps={{
                  color: theme.chart.green,
                }}
                timeFrame="week"
              />
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <TrendIndicator
                beforeValue={data[data.length - 2].totalDirectIntegrations}
                afterValue={data[data.length - 1].totalDirectIntegrations}
                title="Direct Integrations"
                titleProps={{
                  color: theme.chart.yellow,
                }}
                timeFrame="week"
              />
            </Grid>
          </Grid>
        )
      }
    >
      <IntegrationRates data={data} />
    </DashboardWidgetWrapper>
  )
}

export default IntegrationRatesCard
