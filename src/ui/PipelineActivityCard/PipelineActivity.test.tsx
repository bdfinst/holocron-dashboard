import { render, screen, within } from '@testing-library/react'
import MockMetrics from '__mocks__/Metrics'
import PipelineActivityCard from '.'

jest.mock('./PipelineActivityCardHelpContent.md', () => 'helpContent')

jest.mock('utils/DashboardWidgetWrapper', () => ({
  ...jest.requireActual('utils/DashboardWidgetWrapper'),
  __esModule: true,
  default: ({ children, AdditionalInformation }) => (
    <div>
      <>{children}</>
      <div data-testid="AdditionalInformation">{AdditionalInformation}</div>
    </div>
  ),
}))

jest.mock('./StaleBranchesTable', () => ({
  __esModule: true,
  default: () => <div data-testid="StaleBranchesTable" />,
  getStaleBranches: jest.fn().mockReturnValue([]),
}))

jest.mock('./StalePipelinesTable', () => ({
  __esModule: true,
  default: () => <div data-testid="StalePipelinesTable" />,
  getStalePipelines: jest.fn().mockReturnValue([]),
}))

jest.mock('./StaleCodeReviewsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="StaleCodeReviewsTable" />,
  getStaleCodeReviews: jest.fn().mockReturnValue([]),
}))

jest.mock('./BuildIssuesTable', () => ({
  __esModule: true,
  default: () => <div data-testid="BuildIssuesTable" />,
  getBuildIssues: jest.fn().mockReturnValue([
    {
      durationInHours: 1,
      buildUrl: 'foo',
      failedBuild: true,
      ageInMinutes: 20,
    },
    {
      durationInHours: 1,
      buildUrl: 'bar',
      failedBuild: false,
      ageInMinutes: 21,
    },
  ]),
}))

jest.mock('./PipelineActivitySummary', () => ({
  __esModule: true,
  default: () => <div data-testid="PipelineActivitySummary" />,
}))

describe('PipelineActivityCard', () => {
  it('should show Pipeline Summary', () => {
    render(<PipelineActivityCard apiMetrics={MockMetrics.result} />)

    // two pipeline activity summary, one shown in main view,
    // and another in AdditionalInformation
    expect(screen.getAllByTestId('PipelineActivitySummary')).toHaveLength(2)
  })

  it('should show the details in the AdditionalInformation view', () => {
    render(<PipelineActivityCard apiMetrics={MockMetrics.result} />)

    const { getByTestId } = within(
      // only interested in the first additional information
      // which is the first card wrapper that's rendered's
      // additional information
      screen.getAllByTestId('AdditionalInformation')[0],
    )
    expect(getByTestId('PipelineActivitySummary')).toBeInTheDocument()
    expect(getByTestId('StalePipelinesTable')).toBeInTheDocument()
    expect(getByTestId('StaleCodeReviewsTable')).toBeInTheDocument()
    expect(getByTestId('StaleBranchesTable')).toBeInTheDocument()
    expect(getByTestId('BuildIssuesTable')).toBeInTheDocument()
  })
})
