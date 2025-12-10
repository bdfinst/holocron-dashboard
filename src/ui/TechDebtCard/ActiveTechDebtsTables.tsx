import {
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ProjectIssueSeverity, ProjectIssueType, TeamMetrics } from 'api'
import {
  DensityMediumIcon,
  LowPriorityIcon,
  PriorityHighIcon,
} from 'utils/icons'
import StyledTooltip from 'utils/StyledTooltip'
import globalConfig from 'globalConfig'
import DashboardWidgetWrapper from 'utils/DashboardWidgetWrapper'

export type ActiveTechDebtsTableProps = {
  apiMetrics: TeamMetrics[]
}

const { UI_SETTINGS } = globalConfig

const getProjectIssueCategoryLabel = (projectIssueType: ProjectIssueType) => {
  switch (projectIssueType) {
    case ProjectIssueType.MAINTAINABILITY:
      return 'Maintainability Issue'
    case ProjectIssueType.POSSIBLE_BUG:
      return 'Possible Bug'
    case ProjectIssueType.VULNERABILITY:
      return 'Vulnerability'
    default:
      return 'Unknown Issue'
  }
}

const TableSummary = ({
  activeHighSeverityProjectIssues,
  activeMediumSeverityProjectIssues,
  activeLowSeverityProjectIssues,
  projectIssueType,
}: {
  activeHighSeverityProjectIssues: number
  activeMediumSeverityProjectIssues: number
  activeLowSeverityProjectIssues: number
  projectIssueType: ProjectIssueType
}) => {
  const projectIssueCategoryLabel =
    getProjectIssueCategoryLabel(projectIssueType)

  return (
    <Stack
      direction={{ sm: 'column', lg: 'row' }}
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
    >
      <Stack direction="row" spacing={1}>
        <PriorityHighIcon
          color="error"
          aria-label={`High Severity ${projectIssueCategoryLabel} Icon`}
        />
        <Typography
          aria-label={`Summary Amount of High ${projectIssueCategoryLabel}`}
        >
          {activeHighSeverityProjectIssues} High Severity{' '}
          {projectIssueCategoryLabel}
          (s)
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
        <DensityMediumIcon
          color="warning"
          aria-label={`Medium Severity ${projectIssueCategoryLabel} Icon`}
        />
        <Typography
          aria-label={`Summary Amount of Medium ${projectIssueCategoryLabel}`}
        >
          {activeMediumSeverityProjectIssues} Medium Severity{' '}
          {projectIssueCategoryLabel}(s)
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
        <LowPriorityIcon
          color="info"
          aria-label={`Low Severity ${projectIssueCategoryLabel} Icon`}
        />
        <Typography
          aria-label={`Summary Amount of Low ${projectIssueCategoryLabel}`}
        >
          {activeLowSeverityProjectIssues} Low Severity{' '}
          {projectIssueCategoryLabel}(s)
        </Typography>
      </Stack>
    </Stack>
  )
}

const getIssueSeverityIcon = (
  severity: ProjectIssueSeverity,
  projectIssueType: ProjectIssueType,
) => {
  const projectIssueCategoryLabel =
    getProjectIssueCategoryLabel(projectIssueType)
  switch (severity) {
    case ProjectIssueSeverity.HIGH:
      return (
        <StyledTooltip
          title="High Severity"
          placement="left"
          enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
        >
          <PriorityHighIcon
            color="error"
            aria-label={`High Severity ${projectIssueCategoryLabel} Icon`}
          />
        </StyledTooltip>
      )
    case ProjectIssueSeverity.MEDIUM:
      return (
        <StyledTooltip
          title="Medium Severity"
          placement="left"
          enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
        >
          <DensityMediumIcon
            color="warning"
            aria-label={`Medium Severity ${projectIssueCategoryLabel} Icon`}
          />
        </StyledTooltip>
      )
    default:
      return (
        <StyledTooltip
          title="Low Severity"
          placement="left"
          enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
        >
          <LowPriorityIcon
            color="info"
            aria-label={`Low Severity ${projectIssueCategoryLabel} Icon`}
          />
        </StyledTooltip>
      )
  }
}

export type ProjectIssueTableProps = ActiveTechDebtsTableProps & {
  projectIssueType: ProjectIssueType
  title: string
}

export const ProjectIssueTable = ({
  apiMetrics,
  projectIssueType,
  title,
}: ProjectIssueTableProps) => {
  const [teamMetrics] = apiMetrics
  const activeHighSeverityProjectIssues = teamMetrics.activeIssues.filter(
    i =>
      i.type === projectIssueType && i.severity === ProjectIssueSeverity.HIGH,
  )
  const activeMediumSeverityProjectIssues = teamMetrics.activeIssues.filter(
    i =>
      i.type === projectIssueType && i.severity === ProjectIssueSeverity.MEDIUM,
  )
  const activeLowSeverityProjectIssues = teamMetrics.activeIssues.filter(
    i => i.type === projectIssueType && i.severity === ProjectIssueSeverity.LOW,
  )
  const allProjectIssues = [
    ...activeHighSeverityProjectIssues,
    ...activeMediumSeverityProjectIssues,
    ...activeLowSeverityProjectIssues,
  ]

  return (
    <DashboardWidgetWrapper
      title={title}
      notEnoughData={allProjectIssues.length === 0}
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
          overflow: 'scroll',
        },
      }}
    >
      <Stack spacing={1}>
        <TableSummary
          activeHighSeverityProjectIssues={
            activeHighSeverityProjectIssues.length
          }
          activeMediumSeverityProjectIssues={
            activeMediumSeverityProjectIssues.length
          }
          activeLowSeverityProjectIssues={activeLowSeverityProjectIssues.length}
          projectIssueType={projectIssueType}
        />
        <TableContainer sx={{ width: '100%' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">Severity</TableCell>
                <TableCell align="center">Issue Details Link</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {allProjectIssues.map(issue => (
                <TableRow key={issue.issueUrl}>
                  <TableCell align="center">
                    {getIssueSeverityIcon(issue.severity, projectIssueType)}
                  </TableCell>
                  <TableCell align="center">
                    <Link
                      href={issue.issueUrl}
                      color="secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {issue.issueUrl}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </DashboardWidgetWrapper>
  )
}

export const ActiveMaintainabilityIssuesTable = ({
  apiMetrics,
}: ActiveTechDebtsTableProps) => (
  <ProjectIssueTable
    title="Active Maintainability Issues"
    apiMetrics={apiMetrics}
    projectIssueType={ProjectIssueType.MAINTAINABILITY}
  />
)

export const ActivePossibleBugsTable = ({
  apiMetrics,
}: ActiveTechDebtsTableProps) => (
  <ProjectIssueTable
    title="Active Possible Bug Issues"
    apiMetrics={apiMetrics}
    projectIssueType={ProjectIssueType.POSSIBLE_BUG}
  />
)

export const ActiveUnknownIssuesTable = ({
  apiMetrics,
}: ActiveTechDebtsTableProps) => (
  <ProjectIssueTable
    title="Active Unknown Issues"
    apiMetrics={apiMetrics}
    projectIssueType={ProjectIssueType.UNKNOWN}
  />
)
