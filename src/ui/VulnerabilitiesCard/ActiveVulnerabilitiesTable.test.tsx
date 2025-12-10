import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { ProjectIssueSeverity, ProjectIssueType, TeamMetrics } from 'api'
import { screen } from '@testing-library/react'
import ActiveVulnerabilitiesTable from './ActiveVulnerabilitiesTable'

jest.mock('../TechDebtCard/helpContent.md', () => 'helpContent')

jest.mock('../TechDebtCard', () => ({
  ProjectIssueTable: jest.requireActual('../TechDebtCard').ProjectIssueTable,
}))

describe('ActiveVulnerabilitiesTable', () => {
  it('should list the summary on the amount of vulnerabilities based on severity', () => {
    RenderWithWrapper(
      <ActiveVulnerabilitiesTable
        apiMetrics={
          [
            {
              // only one team since team only graph
              activeIssues: [
                {
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.1',
                  type: ProjectIssueType.VULNERABILITY,
                },
                {
                  severity: ProjectIssueSeverity.MEDIUM,
                  issueUrl: 'https://active.issue.2',
                  type: ProjectIssueType.VULNERABILITY,
                },
                {
                  severity: ProjectIssueSeverity.LOW,
                  issueUrl: 'https://active.issue.3',
                  type: ProjectIssueType.VULNERABILITY,
                },
                {
                  // should ignore this one
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.4',
                  type: ProjectIssueType.MAINTAINABILITY,
                },
              ],
            },
          ] as TeamMetrics[]
        }
      />,
    )

    expect(
      screen.getByLabelText('Summary Amount of High Vulnerability'),
    ).toHaveTextContent('1 High Severity Vulnerability(s)')
    expect(
      screen.getByLabelText('Summary Amount of Medium Vulnerability'),
    ).toHaveTextContent('1 Medium Severity Vulnerability(s)')
    expect(
      screen.getByLabelText('Summary Amount of Low Vulnerability'),
    ).toHaveTextContent('1 Low Severity Vulnerability(s)')
  })

  it('should show items on the table sorted based on severity of the vulnerability', () => {
    RenderWithWrapper(
      <ActiveVulnerabilitiesTable
        apiMetrics={
          [
            {
              // only one team since team only graph
              activeIssues: [
                {
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.1',
                  type: ProjectIssueType.VULNERABILITY,
                },
                {
                  severity: ProjectIssueSeverity.MEDIUM,
                  issueUrl: 'https://active.issue.2',
                  type: ProjectIssueType.VULNERABILITY,
                },
                {
                  severity: ProjectIssueSeverity.LOW,
                  issueUrl: 'https://active.issue.3',
                  type: ProjectIssueType.VULNERABILITY,
                },
                {
                  // should ignore this one
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.4',
                  type: ProjectIssueType.MAINTAINABILITY,
                },
              ],
            },
          ] as TeamMetrics[]
        }
      />,
    )
    const expectedRowOrder = [
      'https://active.issue.1',
      'https://active.issue.2',
      'https://active.issue.3',
    ]
    const rows = screen.getAllByRole('row')
    const [_header, ...dataRows] = rows
    expect(dataRows).toHaveLength(expectedRowOrder.length)
    dataRows.forEach((row, i) => {
      expect(row).toHaveTextContent(expectedRowOrder[i])
    })
  })
})
