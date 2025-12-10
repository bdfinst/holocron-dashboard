import { screen, within } from '@testing-library/react'
import MockMetrics from '__mocks__/Metrics'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import TechDebtTrendCard from '.'

jest.mock('./helpContent.md', () => 'helpContent')

jest.mock('./TechDebtTrendBySeverityChart', () => ({
  ...jest.requireActual('./TechDebtTrendBySeverityChart'),
  __esModule: true,
  default: () => <div data-testid="TechDebtTrendBySeverityChart" />,
}))

jest.mock('./ActiveTechDebtsTables', () => ({
  ActiveMaintainabilityIssuesTable: () => (
    <div data-testid="ActiveMaintainabilityIssuesTable" />
  ),
  ActivePossibleBugsTable: () => <div data-testid="ActivePossibleBugsTable" />,
  ActiveUnknownIssuesTable: () => (
    <div data-testid="ActiveUnknownIssuesTable" />
  ),
}))

jest.mock('./TechDebtTrendChart', () => ({
  ...jest.requireActual('./TechDebtTrendChart'),
  __esModule: true,
  default: () => <div data-testid="TechDebtTrendChart" />,
}))

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

describe('TechDebtTrendCard', () => {
  it('should render the TechDebtTrendChart, and Additional Information', () => {
    RenderWithWrapper(
      <TechDebtTrendCard
        apiMetrics={MockMetrics.result}
        weekRange={4}
        showDetails
      />,
    )

    expect(screen.getByTestId('TechDebtTrendChart')).toBeInTheDocument()
    const { getByTestId } = within(
      // first card wrapper additional information is what we are
      // interested in in the ui.
      screen.getAllByTestId('AdditionalInformation')[0],
    )
    expect(getByTestId('ActiveMaintainabilityIssuesTable')).toBeInTheDocument()
    expect(getByTestId('ActivePossibleBugsTable')).toBeInTheDocument()
    expect(getByTestId('ActiveUnknownIssuesTable')).toBeInTheDocument()
    expect(getByTestId('TechDebtTrendBySeverityChart')).toBeInTheDocument()
  })
})
