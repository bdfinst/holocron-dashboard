import { useAPIContext, TeamMetrics } from 'api'
import {
  Bar,
  BarChart,
  Cell,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Grid, Stack, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  ChartTooltipWrapper,
  ChartTooltipWrapperProps,
  getLastUpdatedMessage,
  roundValue,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'
import { CIActivityChartDataPoint, getCIActivityChartData } from './utils'
import helpContent from './helpContent.md'
import IntegrationRatesCard from './IntegrationRates'
import ExternalVSInternalIntegrationsPieChartCard from './ExternalVSInternalIntegrationPieChart'

const MAX_PROGRESS_TO_CI_PERCENT = 100
const MAX_Y_AXIS_CI_PERCENT = 120

export type CIActivityCardProps = {
  apiMetrics: TeamMetrics[]
  weekRange: number
  cardProps?: DashboardWidgetWrapperProps['cardProps']
  contentProps?: DashboardWidgetWrapperProps['contentProps']
}

export type ChartTooltipProps = Omit<
  ChartTooltipWrapperProps,
  'children' | 'showLabel'
>

export const ChartTooltip = (tooltipProps: ChartTooltipProps) => {
  const theme = useTheme()
  const { featureFlags } = useAPIContext()

  return (
    <ChartTooltipWrapper {...tooltipProps}>
      {({ payload }) => {
        const hoveredData = payload[0].payload as CIActivityChartDataPoint
        const progressToCI = payload[0].value as number

        return (
          <Stack>
            <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
              <Typography color={theme.chart.blue}>CI Progress:</Typography>
              <Typography
                color={theme.palette.text.primary}
                aria-label="Progress To CI"
              >
                {progressToCI}%
              </Typography>
            </Stack>
            <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
              <Typography color={theme.chart.blue}>Team Size: </Typography>
              <Typography
                color={theme.palette.text.primary}
                aria-label="Team Size"
              >
                {hoveredData.averageTeamSize}
              </Typography>
            </Stack>
            <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
              <Typography color={theme.chart.blue}>
                Internal Integrations / Goal:
              </Typography>
              <Typography
                color={theme.palette.text.primary}
                aria-label="Internal Integrations / Goal"
              >
                {hoveredData.totalInternalIntegrations} /{' '}
                {hoveredData.minimumIntegrationsNeeded}
              </Typography>
            </Stack>
            <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
              <Typography color={theme.chart.blue}>
                Direct Integrations / %:
              </Typography>
              <Typography
                color={theme.palette.text.primary}
                aria-label="Direct Integrations / Percent"
              >
                {hoveredData.totalDirectIntegrations} /{' '}
                {roundValue(
                  safeDivide(
                    hoveredData.totalDirectIntegrations,
                    hoveredData.totalExternalIntegrations +
                      hoveredData.totalInternalIntegrations,
                  ) * 100,
                )}
                %
              </Typography>
            </Stack>
            {featureFlags.FEATURE_EXTERNAL_CONTRIBUTORS && (
              <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
                <Typography color={theme.chart.blue}>
                  External Integrations / %:
                </Typography>
                <Typography
                  color={theme.palette.text.primary}
                  aria-label="External Integrations / Percent"
                >
                  {hoveredData.totalExternalIntegrations} /{' '}
                  {roundValue(
                    safeDivide(
                      hoveredData.totalExternalIntegrations,
                      hoveredData.totalExternalIntegrations +
                        hoveredData.totalInternalIntegrations,
                    ) * 100,
                  )}
                  %
                </Typography>
              </Stack>
            )}
          </Stack>
        )
      }}
    </ChartTooltipWrapper>
  )
}

const CIActivity = ({ data }: { data: CIActivityChartDataPoint[] }) => {
  const theme = useTheme()

  return (
    <ResponsiveContainer>
      <BarChart
        data={data}
        margin={{
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        <XAxis
          dataKey="xAxisTick"
          stroke={theme.palette.text.primary}
          height={45}
          angle={45}
          dy={10}
        />
        <YAxis
          domain={[0, MAX_Y_AXIS_CI_PERCENT]}
          orientation="right"
          stroke={theme.palette.text.primary}
          allowDecimals={false}
          allowDataOverflow={false}
          tickFormatter={(label: string) => `${label}%`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar
          name="CI Progress"
          type="monotone"
          dataKey="percentProgressToCI"
          radius={[3, 3, 0, 0]}
        >
          {data.map(point => {
            const fillColor =
              point.percentProgressToCI >= MAX_PROGRESS_TO_CI_PERCENT
                ? theme.palette.success.main
                : theme.palette.warning.main
            return (
              <Cell
                key={`cell-${point.week}`}
                fill={alpha(fillColor, theme.chart.fillTransparencyPct)}
                stroke={fillColor}
                strokeWidth={2}
              />
            )
          })}
        </Bar>
        <ReferenceLine
          y={MAX_PROGRESS_TO_CI_PERCENT}
          stroke={theme.palette.mode === 'dark' ? 'gold' : 'black'}
          strokeWidth={3}
          strokeDasharray="3 3"
          ifOverflow="extendDomain"
          label={
            <Label
              value="100% CI"
              position="top"
              style={{ fill: theme.palette.mode === 'dark' ? 'gold' : 'black' }}
            />
          }
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

const CIActivityCard = ({
  apiMetrics,
  weekRange,
  cardProps,
  contentProps,
}: CIActivityCardProps) => {
  const { featureFlags } = useAPIContext()
  const data = getCIActivityChartData({
    apiMetrics,
    weekRange,
    featureFlags,
  })
  const { scm: lastUpdatedMessage } = getLastUpdatedMessage(apiMetrics)
  const notEnoughData = data.every(item => item.totalInternalIntegrations === 0)

  return (
    <DashboardWidgetWrapper
      title="Continuous Integration"
      helpContent={helpContent}
      Footer={
        <Typography
          variant="caption"
          aria-label="Continuous Integration Last Updated Footer"
        >
          {lastUpdatedMessage}
        </Typography>
      }
      notEnoughData={notEnoughData}
      cardProps={cardProps}
      contentProps={contentProps}
      AdditionalInformation={
        featureFlags.FEATURE_EXTERNAL_CONTRIBUTORS && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DashboardWidgetWrapper
                title="Continuous Integration"
                notEnoughData={notEnoughData}
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
                    height: { md: 200, xs: 350 },
                  },
                }}
              >
                <CIActivity data={data} />
              </DashboardWidgetWrapper>
            </Grid>
            <Grid item md={6} xs={12}>
              <IntegrationRatesCard
                data={data}
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
                    height: { md: 200, xs: 350 },
                  },
                }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <ExternalVSInternalIntegrationsPieChartCard
                data={data}
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
                    height: { md: 350, xs: 400 },
                  },
                }}
              />
            </Grid>
          </Grid>
        )
      }
    >
      <CIActivity data={data} />
    </DashboardWidgetWrapper>
  )
}

export default CIActivityCard
