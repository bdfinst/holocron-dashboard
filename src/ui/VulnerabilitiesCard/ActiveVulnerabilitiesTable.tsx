import { ProjectIssueType, TeamMetrics } from 'api'
import { ProjectIssueTable } from '../TechDebtCard'

export type ActiveVulnerabilitiesTableProps = {
  apiMetrics: TeamMetrics[]
}

const ActiveVulnerabilitiesTable = ({
  apiMetrics,
}: ActiveVulnerabilitiesTableProps) => (
  <ProjectIssueTable
    title="Active Vulnerabilities"
    apiMetrics={apiMetrics}
    projectIssueType={ProjectIssueType.VULNERABILITY}
  />
)

export default ActiveVulnerabilitiesTable
