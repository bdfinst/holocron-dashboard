import { alpha, Stack, Typography, useTheme } from '@mui/material'
import { TeamMetrics } from 'api'
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  ChartTooltipWrapperProps,
  ChartTooltipWrapper,
  getLastUpdatedMessage,
  roundValue,
} from 'utils/DashboardWidgetWrapper'
import helpContent from './helpContent.md'

export const getWipGaugeData = ({
  apiMetrics,
}: {
  apiMetrics: TeamMetrics[]
}): { numberOfIssuesInProgress: number; teamSize: number; wipLoad: number } => {
  const overallTeamSize = apiMetrics.reduce(
    (size, teamMetrics) => size + teamMetrics.teamSize,
    0,
  )
  const totalNumberOfIssuesInProgress = apiMetrics.reduce(
    (wip, teamMetrics) => wip + teamMetrics.wipTickets,
    0,
  )
  return {
    numberOfIssuesInProgress: totalNumberOfIssuesInProgress,
    teamSize: overallTeamSize,
    wipLoad: roundValue(
      (totalNumberOfIssuesInProgress / overallTeamSize) * 100,
    ),
  }
}

export type WipLoadGaugeCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  apiMetrics: TeamMetrics[]
}

export type ChartTooltipProps = Omit<
  ChartTooltipWrapperProps,
  'children' | 'showLabel'
> & { currentWipLoad: number }

export const ChartTooltip = ({
  currentWipLoad,
  ...tooltipProps
}: ChartTooltipProps) => (
  <ChartTooltipWrapper {...tooltipProps}>
    {({ payload }) => {
      const hoveredWipGaugeSector = payload[0].payload as WipGaugeSector

      return (
        <Stack>
          <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
            <Typography>Current WIP Load:</Typography>
            <Typography>{currentWipLoad}</Typography>
          </Stack>
          <Stack spacing={1} direction={{ sm: 'row', xs: 'column' }}>
            <Typography color={hoveredWipGaugeSector.color}>
              {hoveredWipGaugeSector.tooltipDescription}
            </Typography>
            <Typography>
              {hoveredWipGaugeSector.tooltipWipLoadThreshold}
            </Typography>
          </Stack>
        </Stack>
      )
    }}
  </ChartTooltipWrapper>
)

const WipLoadGaugeLabel = ({
  viewBox = { cx: 0, cy: 0 },
  numberOfIssuesInProgress,
  teamSize,
  wipLoad,
  wipStatus,
  wipStatusColor,
}: {
  viewBox?: { cx: number; cy: number }
  numberOfIssuesInProgress: number
  teamSize: number
  wipLoad: number
  wipStatus: string
  wipStatusColor: string
}) => {
  const theme = useTheme()

  return (
    <text y={viewBox.cy} textAnchor="middle">
      <tspan
        x={viewBox.cx}
        y={viewBox.cy}
        fill={wipStatusColor}
        fontFamily={theme.typography.body1.fontFamily}
      >
        {wipStatus}
      </tspan>
      <tspan
        fill={theme.palette.primary.contrastText}
        x={viewBox.cx}
        fontFamily={theme.typography.body1.fontFamily}
        fontSize={theme.typography.body1.fontSize}
        dy="1.2em"
      >
        WIP Load: {wipLoad} %
      </tspan>
      <tspan
        x={viewBox.cx}
        dy="1.2em"
        fill={theme.palette.primary.contrastText}
        fontFamily={theme.typography.body1.fontFamily}
        fontSize={theme.typography.body1.fontSize}
      >
        In Progress: {numberOfIssuesInProgress}
      </tspan>
      <tspan
        x={viewBox.cx}
        dy="1.2em"
        fill={theme.palette.primary.contrastText}
        fontFamily={theme.typography.body1.fontFamily}
        fontSize={theme.typography.body1.fontSize}
      >
        People: {teamSize}
      </tspan>
    </text>
  )
}

type WipGaugeSector = {
  name: string
  area: number
  isHighlighted: boolean
  isCurrentWipLoad: boolean
  tooltipDescription: string
  tooltipWipLoadThreshold: number
  color: string
}

const WipLoadGauge = ({
  numberOfIssuesInProgress,
  teamSize,
  wipLoad,
}: ReturnType<typeof getWipGaugeData>) => {
  const theme = useTheme()

  const sectors: WipGaugeSector[] = [
    {
      name: 'Really Good',
      area: 100,
      isHighlighted:
        numberOfIssuesInProgress === 1 || numberOfIssuesInProgress > 1,
      isCurrentWipLoad: numberOfIssuesInProgress === 1,
      tooltipDescription: '"Really good" WIP Load:',
      tooltipWipLoadThreshold: roundValue((1 / teamSize) * 100),
      color: theme.chart.green,
    },
    {
      name: 'Good',
      area: 150,
      isHighlighted:
        (numberOfIssuesInProgress > 1 && wipLoad <= 100) || wipLoad > 100,
      isCurrentWipLoad: numberOfIssuesInProgress > 1 && wipLoad <= 100,
      tooltipDescription: '"Good" less than or equal to:',
      tooltipWipLoadThreshold: 100,
      color: theme.chart.blue,
    },
    {
      name: 'Fair',
      area: 200,
      isHighlighted: (wipLoad > 100 && wipLoad <= 150) || wipLoad > 150,
      isCurrentWipLoad: wipLoad > 100 && wipLoad <= 150,
      tooltipDescription: '"Fair" less than or equal to:',
      tooltipWipLoadThreshold: 150,
      color: theme.chart.yellow,
    },
    {
      name: 'Poor',
      area: 250,
      isHighlighted: (wipLoad > 150 && wipLoad <= 200) || wipLoad > 200,
      isCurrentWipLoad: wipLoad > 150 && wipLoad <= 200,
      tooltipDescription: '"Poor" less than or equal to:',
      tooltipWipLoadThreshold: 200,
      color: theme.chart.orange,
    },
    {
      name: 'Over Loaded',
      area: 300,
      isHighlighted: wipLoad > 200,
      isCurrentWipLoad: wipLoad > 200,
      tooltipDescription: '"Over Loaded" greater than:',
      tooltipWipLoadThreshold: 200,
      color: theme.chart.red,
    },
  ]

  const currentWipLoadSector = sectors.find(sector => sector.isCurrentWipLoad)

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          dataKey="area"
          startAngle={180}
          endAngle={0}
          data={sectors}
          innerRadius="80%"
          outerRadius="100%"
          paddingAngle={5}
        >
          {sectors.map(sector => (
            <Cell
              key={sector.name}
              fill={
                sector.isHighlighted
                  ? sector.color
                  : alpha(sector.color, theme.chart.fillTransparencyPct * 0.3)
              }
              stroke="none"
            />
          ))}
          <Label
            position="center"
            content={
              <WipLoadGaugeLabel
                numberOfIssuesInProgress={numberOfIssuesInProgress}
                teamSize={teamSize}
                wipLoad={wipLoad}
                wipStatus={currentWipLoadSector.name}
                wipStatusColor={currentWipLoadSector.color}
              />
            }
          />
        </Pie>
        <Tooltip content={<ChartTooltip currentWipLoad={wipLoad} />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

const WipLoadGaugeCard = ({
  apiMetrics,
  cardProps,
  contentProps,
}: WipLoadGaugeCardProps) => {
  const { workflow: lastUpdatedMessage } = getLastUpdatedMessage(apiMetrics)
  const { numberOfIssuesInProgress, teamSize, wipLoad } = getWipGaugeData({
    apiMetrics,
  })

  return (
    <DashboardWidgetWrapper
      title="WIP Load"
      helpContent={helpContent}
      Footer={
        <Typography
          variant="caption"
          aria-label="Continuous Integration Last Updated Footer"
        >
          {lastUpdatedMessage}
        </Typography>
      }
      notEnoughData={teamSize <= 0 || numberOfIssuesInProgress <= 0}
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <WipLoadGauge
        numberOfIssuesInProgress={numberOfIssuesInProgress}
        teamSize={teamSize}
        wipLoad={wipLoad}
      />
    </DashboardWidgetWrapper>
  )
}

export default WipLoadGaugeCard
