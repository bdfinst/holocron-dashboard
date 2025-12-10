import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { ProjectIssueSeverity, ProjectIssueType, TeamMetrics } from 'api'
import { screen } from '@testing-library/react'
import {
  ActiveMaintainabilityIssuesTable,
  ActivePossibleBugsTable,
  ActiveUnknownIssuesTable,
} from './ActiveTechDebtsTables'

describe('ActiveMaintainabilityIssuesTable', () => {
  it('should list the summary on the amount of maintainability issues based on severity', () => {
    RenderWithWrapper(
      <ActiveMaintainabilityIssuesTable
        apiMetrics={
          [
            {
              // only one team since team only graph
              activeIssues: [
                {
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.1',
                  type: ProjectIssueType.MAINTAINABILITY,
                },
                {
                  severity: ProjectIssueSeverity.MEDIUM,
                  issueUrl: 'https://active.issue.2',
                  type: ProjectIssueType.MAINTAINABILITY,
                },
                {
                  severity: ProjectIssueSeverity.LOW,
                  issueUrl: 'https://active.issue.3',
                  type: ProjectIssueType.MAINTAINABILITY,
                },
                {
                  // should ignore this one
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.4',
                  type: ProjectIssueType.VULNERABILITY,
                },
              ],
            },
          ] as TeamMetrics[]
        }
      />,
    )

    expect(
      screen.getByLabelText('Summary Amount of High Maintainability Issue'),
    ).toHaveTextContent('1 High Severity Maintainability Issue(s)')
    expect(
      screen.getByLabelText('Summary Amount of Medium Maintainability Issue'),
    ).toHaveTextContent('1 Medium Severity Maintainability Issue(s)')
    expect(
      screen.getByLabelText('Summary Amount of Low Maintainability Issue'),
    ).toHaveTextContent('1 Low Severity Maintainability Issue(s)')
  })

  it('should show items on the table sorted based on severity of the maintainability issue', () => {
    RenderWithWrapper(
      <ActiveMaintainabilityIssuesTable
        apiMetrics={
          [
            {
              // only one team since team only graph
              activeIssues: [
                {
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.1',
                  type: ProjectIssueType.MAINTAINABILITY,
                },
                {
                  severity: ProjectIssueSeverity.MEDIUM,
                  issueUrl: 'https://active.issue.2',
                  type: ProjectIssueType.MAINTAINABILITY,
                },
                {
                  severity: ProjectIssueSeverity.LOW,
                  issueUrl: 'https://active.issue.3',
                  type: ProjectIssueType.MAINTAINABILITY,
                },
                {
                  // should ignore this one
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.4',
                  type: ProjectIssueType.VULNERABILITY,
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

describe('ActivePossibleBugsTable', () => {
  it('should list the summary on the amount of possible bugs based on severity', () => {
    RenderWithWrapper(
      <ActivePossibleBugsTable
        apiMetrics={
          [
            {
              // only one team since team only graph
              activeIssues: [
                {
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.1',
                  type: ProjectIssueType.POSSIBLE_BUG,
                },
                {
                  severity: ProjectIssueSeverity.MEDIUM,
                  issueUrl: 'https://active.issue.2',
                  type: ProjectIssueType.POSSIBLE_BUG,
                },
                {
                  severity: ProjectIssueSeverity.LOW,
                  issueUrl: 'https://active.issue.3',
                  type: ProjectIssueType.POSSIBLE_BUG,
                },
                {
                  // should ignore this one
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.4',
                  type: ProjectIssueType.VULNERABILITY,
                },
              ],
            },
          ] as TeamMetrics[]
        }
      />,
    )

    expect(
      screen.getByLabelText('Summary Amount of High Possible Bug'),
    ).toHaveTextContent('1 High Severity Possible Bug(s)')
    expect(
      screen.getByLabelText('Summary Amount of Medium Possible Bug'),
    ).toHaveTextContent('1 Medium Severity Possible Bug(s)')
    expect(
      screen.getByLabelText('Summary Amount of Low Possible Bug'),
    ).toHaveTextContent('1 Low Severity Possible Bug(s)')
  })

  it('should show items on the table sorted based on severity of the possible bug', () => {
    RenderWithWrapper(
      <ActivePossibleBugsTable
        apiMetrics={
          [
            {
              // only one team since team only graph
              activeIssues: [
                {
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.1',
                  type: ProjectIssueType.POSSIBLE_BUG,
                },
                {
                  severity: ProjectIssueSeverity.MEDIUM,
                  issueUrl: 'https://active.issue.2',
                  type: ProjectIssueType.POSSIBLE_BUG,
                },
                {
                  severity: ProjectIssueSeverity.LOW,
                  issueUrl: 'https://active.issue.3',
                  type: ProjectIssueType.POSSIBLE_BUG,
                },
                {
                  // should ignore this one
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.4',
                  type: ProjectIssueType.VULNERABILITY,
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

describe('ActiveUnknownIssuesTable', () => {
  it('should list the summary on the amount of unknown issues based on severity', () => {
    RenderWithWrapper(
      <ActiveUnknownIssuesTable
        apiMetrics={
          [
            {
              // only one team since team only graph
              activeIssues: [
                {
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.1',
                  type: ProjectIssueType.UNKNOWN,
                },
                {
                  severity: ProjectIssueSeverity.MEDIUM,
                  issueUrl: 'https://active.issue.2',
                  type: ProjectIssueType.UNKNOWN,
                },
                {
                  severity: ProjectIssueSeverity.LOW,
                  issueUrl: 'https://active.issue.3',
                  type: ProjectIssueType.UNKNOWN,
                },
                {
                  // should ignore this one
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.4',
                  type: ProjectIssueType.VULNERABILITY,
                },
              ],
            },
          ] as TeamMetrics[]
        }
      />,
    )

    expect(
      screen.getByLabelText('Summary Amount of High Unknown Issue'),
    ).toHaveTextContent('1 High Severity Unknown Issue(s)')
    expect(
      screen.getByLabelText('Summary Amount of Medium Unknown Issue'),
    ).toHaveTextContent('1 Medium Severity Unknown Issue(s)')
    expect(
      screen.getByLabelText('Summary Amount of Low Unknown Issue'),
    ).toHaveTextContent('1 Low Severity Unknown Issue(s)')
  })

  it('should show items on the table sorted based on severity of the unknown issue', () => {
    RenderWithWrapper(
      <ActiveUnknownIssuesTable
        apiMetrics={
          [
            {
              // only one team since team only graph
              activeIssues: [
                {
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.1',
                  type: ProjectIssueType.UNKNOWN,
                },
                {
                  severity: ProjectIssueSeverity.MEDIUM,
                  issueUrl: 'https://active.issue.2',
                  type: ProjectIssueType.UNKNOWN,
                },
                {
                  severity: ProjectIssueSeverity.LOW,
                  issueUrl: 'https://active.issue.3',
                  type: ProjectIssueType.UNKNOWN,
                },
                {
                  // should ignore this one
                  severity: ProjectIssueSeverity.HIGH,
                  issueUrl: 'https://active.issue.4',
                  type: ProjectIssueType.VULNERABILITY,
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
