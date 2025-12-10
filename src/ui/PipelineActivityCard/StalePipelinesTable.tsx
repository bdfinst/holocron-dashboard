import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { TeamMetrics } from 'api'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  getDaysAgo,
  roundValue,
} from 'utils/DashboardWidgetWrapper'
import globalConfig from 'globalConfig'
import StyledTooltip from 'utils/StyledTooltip'
import helpContent from './StalePipelinesTableHelpContent.md'

const { METRICS_SETTINGS, UI_SETTINGS } = globalConfig
const { OUTDATED_PIPELINE_TIME_DAYS } = METRICS_SETTINGS
const { TOOL_TIP_DELAY } = UI_SETTINGS

type StalePipeline = {
  durationInHours: number
  ageInDays: number
  buildUrl: string
}

export type StalePipelinesTableProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  data: StalePipeline[]
}

export const getStalePipelines = ({
  apiMetrics,
}: {
  apiMetrics: TeamMetrics[]
}): StalePipelinesTableProps['data'] => {
  const [teamMetrics] = apiMetrics
  const { latestBuilds } = teamMetrics
  return latestBuilds
    .map(latestBuild => {
      const toHours = (milliSecondsSinceEpoch: number) => {
        const millisecondsPerHour = 1000 * 60 * 60
        return roundValue(milliSecondsSinceEpoch / millisecondsPerHour, 1)
      }
      const runDuration =
        new Date(latestBuild.endTime).getTime() -
        new Date(latestBuild.startTime).getTime()
      return {
        durationInHours: toHours(runDuration),
        buildUrl: latestBuild.buildUrl,
        ageInDays: Math.round(
          getDaysAgo(new Date(latestBuild.endTime).getTime()),
        ),
      }
    })
    .filter(({ ageInDays }) => ageInDays > OUTDATED_PIPELINE_TIME_DAYS)
}

const StalePipelinesTable = ({
  data,
  cardProps,
  contentProps,
}: StalePipelinesTableProps) => {
  const stalePipelinesSortedByAgeInDescendingOrder = [...data].sort(
    (a, b) => b.ageInDays - a.ageInDays,
  )

  return (
    <DashboardWidgetWrapper
      title={`Pipelines Not Run In Over ${OUTDATED_PIPELINE_TIME_DAYS} Days`}
      helpContent={helpContent}
      notEnoughData={stalePipelinesSortedByAgeInDescendingOrder.length === 0}
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <TableContainer sx={{ width: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">Build</TableCell>
              <TableCell align="center">Run Time (Hours)</TableCell>
              <TableCell align="center">Last Run (Days)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stalePipelinesSortedByAgeInDescendingOrder.map(pipeline => (
              <TableRow key={pipeline.buildUrl}>
                <TableCell align="center">
                  <StyledTooltip
                    title="Go To Build"
                    placement="left"
                    enterTouchDelay={TOOL_TIP_DELAY}
                  >
                    <Link
                      href={pipeline.buildUrl}
                      color="secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {pipeline.buildUrl}
                    </Link>
                  </StyledTooltip>
                </TableCell>
                <TableCell align="center">{pipeline.durationInHours}</TableCell>
                <TableCell align="center">{pipeline.ageInDays}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardWidgetWrapper>
  )
}

export default StalePipelinesTable
