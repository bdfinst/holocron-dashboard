import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { TeamMetrics, BuildStatus, Build } from 'api'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  getMinutesAgo,
  roundValue,
} from 'utils/DashboardWidgetWrapper'
import globalConfig from 'globalConfig'
import StyledTooltip from 'utils/StyledTooltip'
import { ErrorIcon, WarningIcon } from 'utils/icons'
import helpContent from './BuildIssuesTableHelpContent.md'

const { UI_SETTINGS } = globalConfig

type BuildIssue = {
  durationInHours: number
  buildUrl: string
  ageInMinutes: number
  failedBuild: boolean
}

export type BuildIssueTableProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  data: BuildIssue[]
}

export const getBuildIssues = ({
  apiMetrics,
}: {
  apiMetrics: TeamMetrics[]
}): BuildIssueTableProps['data'] => {
  // this is a team only graph
  const [teamMetrics] = apiMetrics

  const { latestBuilds } = teamMetrics

  const isBuildWithIssue = (build: Build) =>
    build.buildStatus === BuildStatus.FAILED ||
    build.buildStatus === BuildStatus.PASSED_WITH_WARNINGS

  return latestBuilds.filter(isBuildWithIssue).map(latestBuild => {
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
      failedBuild: latestBuild.buildStatus === BuildStatus.FAILED,
      ageInMinutes: Math.round(
        getMinutesAgo(new Date(latestBuild.endTime).getTime()),
      ),
    }
  })
}

const BuildIssuesTable = ({
  data,
  cardProps,
  contentProps,
}: BuildIssueTableProps) => {
  const buildsSortedInDescendingOrderByAge = [...data].sort(
    (a, b) => b.ageInMinutes - a.ageInMinutes,
  )
  return (
    <DashboardWidgetWrapper
      title="Build Issues"
      helpContent={helpContent}
      notEnoughData={buildsSortedInDescendingOrderByAge.length === 0}
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <TableContainer sx={{ width: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Build</TableCell>
              <TableCell align="center">Run Time (Hours)</TableCell>
              <TableCell align="center">
                Time Since Detection (Minutes)
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {buildsSortedInDescendingOrderByAge.map(build => (
              <TableRow key={build.buildUrl}>
                <TableCell align="center">
                  {build.failedBuild ? (
                    <StyledTooltip
                      title="Build Failed"
                      placement="left"
                      enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
                    >
                      <ErrorIcon color="error" />
                    </StyledTooltip>
                  ) : (
                    <StyledTooltip
                      title="Build Passed with Warnings"
                      placement="left"
                      enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
                    >
                      <WarningIcon color="warning" />
                    </StyledTooltip>
                  )}
                </TableCell>
                <TableCell align="center">
                  <StyledTooltip
                    title="Go to Build"
                    placement="left"
                    enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
                  >
                    <Link
                      href={build.buildUrl}
                      color="secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {build.buildUrl}
                    </Link>
                  </StyledTooltip>
                </TableCell>
                <TableCell align="center">{build.durationInHours}</TableCell>
                <TableCell align="center">{build.ageInMinutes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardWidgetWrapper>
  )
}

export default BuildIssuesTable
