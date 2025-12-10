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
} from 'utils/DashboardWidgetWrapper'
import globalConfig from 'globalConfig'
import StyledTooltip from 'utils/StyledTooltip'
import helpContent from './StaleBranchesTableHelpContent.md'

const { METRICS_SETTINGS } = globalConfig
const { OUTDATED_BRANCHES_TIME_DAYS } = METRICS_SETTINGS

type StaleBranch = {
  url: string
  ageInDays: number
  name: string
}

export type StaleBranchesTableProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  data: StaleBranch[]
}

export const getStaleBranches = ({
  apiMetrics,
}: {
  apiMetrics: TeamMetrics[]
}): StaleBranchesTableProps['data'] => {
  // team only ui
  const [teamMetrics] = apiMetrics
  const { staleBranches } = teamMetrics
  return staleBranches
    .map(branch => {
      const { lastUpdated, name, url } = branch
      const lastUpdatedMillisecondsSinceEpoch = new Date(lastUpdated).getTime()
      const differenceInDays = Math.round(
        getDaysAgo(lastUpdatedMillisecondsSinceEpoch),
      )
      return { ageInDays: differenceInDays, name, url }
    })
    .filter(branch => branch.ageInDays > OUTDATED_BRANCHES_TIME_DAYS)
}

const StaleBranchesTable = ({
  data,
  cardProps,
  contentProps,
}: StaleBranchesTableProps) => {
  const branchesSortedByDescendingAge = [...data].sort(
    (a, b) => b.ageInDays - a.ageInDays,
  )
  return (
    <DashboardWidgetWrapper
      title={`Branches Older Than ${OUTDATED_BRANCHES_TIME_DAYS} day(s)`}
      helpContent={helpContent}
      notEnoughData={branchesSortedByDescendingAge.length === 0}
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <TableContainer sx={{ width: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">Branch</TableCell>
              <TableCell align="center">Days</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {branchesSortedByDescendingAge.map(branch => (
              <TableRow key={branch.url}>
                <TableCell align="center">
                  <StyledTooltip
                    title="Go to Branch"
                    placement="left"
                    enterTouchDelay={globalConfig.UI_SETTINGS.TOOL_TIP_DELAY}
                  >
                    <Link
                      href={branch.url}
                      color="secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {branch.name}
                    </Link>
                  </StyledTooltip>
                </TableCell>
                <TableCell align="center">{branch.ageInDays}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardWidgetWrapper>
  )
}

export default StaleBranchesTable
