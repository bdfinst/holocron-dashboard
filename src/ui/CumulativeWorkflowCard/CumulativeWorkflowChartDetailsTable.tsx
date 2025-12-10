import { roundValue } from 'utils/DashboardWidgetWrapper'
import { TeamMetrics } from 'api'
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material'
import StyledTooltip from 'utils/StyledTooltip'
import globalConfig from 'globalConfig'

const { UI_SETTINGS } = globalConfig

export type CumulativeFlowChartDetailsTableProps = {
  averageAgeOfBacklogTickets: string
  amountOfOutdatedTickets: string
}

export const getCumulativeWorkflowChartDetailsTableData = ({
  apiMetrics,
}: {
  apiMetrics: TeamMetrics[]
}): CumulativeFlowChartDetailsTableProps => {
  const helperData: {
    totalAgeOfBacklogIssues: number
    amountOfIssuesInBacklog: number
    amountOfOutdatedIssuesInBacklog: number
  } = {
    totalAgeOfBacklogIssues: 0,
    amountOfIssuesInBacklog: 0,
    amountOfOutdatedIssuesInBacklog: 0,
  }

  for (const teamMetrics of apiMetrics) {
    const { ageOfTicketsInBacklog, staleBacklogTickets } = teamMetrics
    helperData.amountOfIssuesInBacklog += ageOfTicketsInBacklog.length
    helperData.amountOfOutdatedIssuesInBacklog += staleBacklogTickets
    helperData.totalAgeOfBacklogIssues += ageOfTicketsInBacklog.reduce(
      (total, { days }) => total + days,
      0,
    )
  }

  return {
    averageAgeOfBacklogTickets:
      helperData.amountOfIssuesInBacklog === 0
        ? 'N/A'
        : roundValue(
            helperData.totalAgeOfBacklogIssues /
              helperData.amountOfIssuesInBacklog,
            2,
          ).toString(),
    amountOfOutdatedTickets:
      helperData.amountOfOutdatedIssuesInBacklog === 0
        ? 'N/A'
        : helperData.amountOfOutdatedIssuesInBacklog.toString(),
  }
}

const CumulativeWorkflowChartDetailsTable = ({
  averageAgeOfBacklogTickets,
  amountOfOutdatedTickets,
}: CumulativeFlowChartDetailsTableProps) => (
  <Card>
    <CardContent>
      <Typography variant="h5"> Additional Information </Typography>
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <StyledTooltip
                title="Average Age of Tickets in Backlog"
                placement="left"
                enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
              >
                <TableCell>
                  Average Age of Tickets in Backlog (measured in days)
                </TableCell>
              </StyledTooltip>
              <TableCell aria-label="Average Age of Tickets in Backlog Value">
                {averageAgeOfBacklogTickets}
              </TableCell>
            </TableRow>
            <TableRow>
              <StyledTooltip
                title="Number of Tickets with Age past 30 days"
                placement="left"
                enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
              >
                <TableCell>Number of Outdated Tickets in Backlog</TableCell>
              </StyledTooltip>
              <TableCell aria-label="Number of Tickets with Age past 30 days Value">
                {amountOfOutdatedTickets}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
)

export default CumulativeWorkflowChartDetailsTable
