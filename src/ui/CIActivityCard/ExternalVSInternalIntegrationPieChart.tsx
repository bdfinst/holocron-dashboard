import { Stack, Typography, useTheme } from '@mui/material'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  ChartTooltipWrapper,
  ChartTooltipWrapperProps,
  safeDivide,
} from 'utils/DashboardWidgetWrapper'
import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { CIActivityChartDataPoint } from './utils'

type IntegrationSector = {
  categoryKey: keyof Pick<
    CIActivityChartDataPoint,
    'totalExternalIntegrations' | 'totalInternalIntegrations'
  >
  category: string
  amount: number
}

export const getIntegrationSectors = (
  data: CIActivityChartDataPoint[],
): IntegrationSector[] => {
  const sectors: IntegrationSector[] = [
    {
      categoryKey: 'totalExternalIntegrations',
      category: 'External Integrations',
      amount: 0,
    },
    {
      categoryKey: 'totalInternalIntegrations',
      category: 'Internal Integrations',
      amount: 0,
    },
  ]
  const [categoryExternalIntegrations, categoryInternalIntegrations] = sectors
  for (const { totalExternalIntegrations, totalInternalIntegrations } of data) {
    categoryInternalIntegrations.amount += totalInternalIntegrations
    categoryExternalIntegrations.amount += totalExternalIntegrations
  }

  return sectors
}

const getGreatestCommonDivisor = (numberA: number, numberB: number) => {
  let numerator = Math.max(numberA, numberB)
  let denominator = Math.min(numberA, numberB)
  while (denominator !== 0) {
    const previousDenominator = denominator
    denominator = numerator % denominator
    numerator = previousDenominator
  }
  return numerator
}

export const getReducedRatio = (numberA: number, numberB: number) => {
  const greatestCommonDivisor = getGreatestCommonDivisor(numberA, numberB)
  return {
    numberARatioAmount: numberA / greatestCommonDivisor,
    numberBRatioAmount: numberB / greatestCommonDivisor,
  }
}

const InternalToExternalRatioLabel = ({
  viewBox = { cx: 0, cy: 0 },
  internalIntegrations,
  externalIntegrations,
}: {
  viewBox?: { cx: number; cy: number }
  internalIntegrations: { color: string; amount: number }
  externalIntegrations: { color: string; amount: number }
}) => {
  const theme = useTheme()
  const {
    numberARatioAmount: externalIntegrationsRatioAmount,
    numberBRatioAmount: internalIntegrationsRatioAmount,
  } = getReducedRatio(externalIntegrations.amount, internalIntegrations.amount)
  return (
    <text y={viewBox.cy} textAnchor="middle">
      <tspan
        fill={externalIntegrations.color}
        x={viewBox.cx}
        y={viewBox.cy}
        fontFamily={theme.typography.fontFamily}
      >
        {externalIntegrationsRatioAmount}
      </tspan>
      <tspan x={viewBox.cx} fill={theme.palette.text.primary} dy="1.2em">
        to
      </tspan>
      <tspan
        fill={internalIntegrations.color}
        x={viewBox.cx}
        dy="1.2em"
        fontFamily={theme.typography.fontFamily}
      >
        {internalIntegrationsRatioAmount}
      </tspan>
    </text>
  )
}

export type ChartTooltipProps = Omit<
  ChartTooltipWrapperProps,
  'children' | 'showLabel'
> & { totalIntegrations: number }

export const ChartTooltip = ({
  totalIntegrations,
  ...tooltipProps
}: ChartTooltipProps) => {
  const theme = useTheme()
  const pieColors: { [category: string]: string } = {
    'External Integrations': theme.chart.green,
    'Internal Integrations': theme.chart.blue,
  }

  return (
    <ChartTooltipWrapper {...tooltipProps}>
      {({ payload }) => {
        const hoveredSectorValue = payload[0].value as number
        const hoveredSectorLabel = payload[0].name as string

        return (
          <Stack>
            <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
              <Typography color={pieColors[hoveredSectorLabel]}>
                {hoveredSectorLabel} / %:
              </Typography>
              <Typography color={theme.palette.text.primary}>
                {hoveredSectorValue} /{' '}
                {Math.round(
                  safeDivide(hoveredSectorValue, totalIntegrations) * 100,
                )}
                %
              </Typography>
            </Stack>
            <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
              <Typography>Total Integrations:</Typography>
              <Typography>{totalIntegrations}</Typography>
            </Stack>
          </Stack>
        )
      }}
    </ChartTooltipWrapper>
  )
}

const ExternalVSInternalIntegrationsPieChart = ({
  sectors,
}: {
  sectors: IntegrationSector[]
}) => {
  const theme = useTheme()
  const pieColors: { [category: string]: string } = {
    'External Integrations': theme.chart.green,
    'Internal Integrations': theme.chart.blue,
  }
  const [externalIntegrationsInformation, internalIntegrationsInformation] =
    sectors
  const finalizedSectors = sectors.map(sector => ({
    ...sector,
    color: pieColors[sector.category],
    totalInternalIntegrations: internalIntegrationsInformation.amount,
    totalExternalIntegrations: externalIntegrationsInformation.amount,
  }))
  const [externalIntegrations, internalIntegrations] = finalizedSectors
  const totalIntegrations =
    internalIntegrations.amount + externalIntegrations.amount

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={80}
          dataKey="amount"
          isAnimationActive
          labelLine={false}
          paddingAngle={5}
          data={finalizedSectors}
        >
          {finalizedSectors.map(sector => (
            <Cell
              key={sector.category}
              fill={sector.color}
              name={sector.category}
              stroke="none"
            />
          ))}
          <Label
            position="center"
            content={
              <InternalToExternalRatioLabel
                internalIntegrations={internalIntegrations}
                externalIntegrations={externalIntegrations}
              />
            }
          />
        </Pie>
        <Legend />
        <Tooltip
          content={<ChartTooltip totalIntegrations={totalIntegrations} />}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export type ExternalVSInternalIntegrationsPieChartCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  data: CIActivityChartDataPoint[]
}

const ExternalVSInternalIntegrationsPieChartCard = ({
  data,
  cardProps,
  contentProps,
}: ExternalVSInternalIntegrationsPieChartCardProps) => {
  const sectors = getIntegrationSectors(data)
  const noInternalOrExternalContributors = sectors.some(
    sector => sector.amount === 0,
  )

  return (
    <DashboardWidgetWrapper
      title="Integration Distribution"
      notEnoughData={noInternalOrExternalContributors}
      notEnoughDataMessage="No external or internal contributors in data to show a meaningful representation."
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <ExternalVSInternalIntegrationsPieChart sectors={sectors} />
    </DashboardWidgetWrapper>
  )
}

export default ExternalVSInternalIntegrationsPieChartCard
