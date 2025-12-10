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
  getHoursAgo,
} from 'utils/DashboardWidgetWrapper'
import globalConfig from 'globalConfig'
import StyledTooltip from 'utils/StyledTooltip'
import { CheckCircleIcon, WarningIcon } from 'utils/icons'
import helpContent from './StaleCodeReviewsTableHelpContent.md'

const { METRICS_SETTINGS, UI_SETTINGS } = globalConfig
const { OUTDATED_MERGE_REQUEST_TIME_HOURS } = METRICS_SETTINGS
const { TOOL_TIP_DELAY } = UI_SETTINGS

type StaleCodeReview = {
  url: string
  title: string
  ageInHours: number
}

export type StaleCodeReviewsTableProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  data: StaleCodeReview[]
}

export const getStaleCodeReviews = ({
  apiMetrics,
}: {
  apiMetrics: TeamMetrics[]
}): StaleCodeReviewsTableProps['data'] => {
  // team only ui
  const [teamMetrics] = apiMetrics
  const { staleGitRequests } = teamMetrics
  return staleGitRequests.map(gr => {
    const { lastUpdated, title, url } = gr
    const createdDate = new Date(lastUpdated).getTime()
    return {
      url,
      title,
      ageInHours: Math.round(getHoursAgo(createdDate)),
    }
  })
}

const StaleCodeReviewsTable = ({
  data,
  cardProps,
  contentProps,
}: StaleCodeReviewsTableProps) => {
  const codeReviewsSortedInDescendingOrderByAge = [...data].sort(
    (a, b) => b.ageInHours - a.ageInHours,
  )

  return (
    <DashboardWidgetWrapper
      helpContent={helpContent}
      title={`Code Reviews Older Than ${OUTDATED_MERGE_REQUEST_TIME_HOURS} hour(s)`}
      notEnoughData={codeReviewsSortedInDescendingOrderByAge.length === 0}
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <TableContainer sx={{ width: '100%' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">Overdue</TableCell>
              <TableCell align="center">Code Review</TableCell>
              <TableCell align="center">Open For (Hours)</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {codeReviewsSortedInDescendingOrderByAge.map(codeReview => (
              <TableRow key={codeReview.url}>
                <TableCell align="center">
                  {codeReview.ageInHours > OUTDATED_MERGE_REQUEST_TIME_HOURS ? (
                    <StyledTooltip
                      title="Code Review is Overdue!"
                      placement="left"
                      enterTouchDelay={TOOL_TIP_DELAY}
                    >
                      <WarningIcon color="warning" />
                    </StyledTooltip>
                  ) : (
                    <StyledTooltip
                      title="Code Review still has time"
                      placement="left"
                      enterTouchDelay={TOOL_TIP_DELAY}
                    >
                      <CheckCircleIcon color="success" />
                    </StyledTooltip>
                  )}
                </TableCell>
                <TableCell align="center">
                  <StyledTooltip
                    title="Go To Code Review"
                    placement="left"
                    enterTouchDelay={TOOL_TIP_DELAY}
                  >
                    <Link
                      href={codeReview.url}
                      color="secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {codeReview.title}
                    </Link>
                  </StyledTooltip>
                </TableCell>
                <TableCell align="center">{codeReview.ageInHours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardWidgetWrapper>
  )
}

export default StaleCodeReviewsTable
