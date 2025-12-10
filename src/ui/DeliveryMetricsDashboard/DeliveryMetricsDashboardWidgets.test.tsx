import { render, screen } from '@testing-library/react'
import { useAPIContext } from 'api'
import MockTeams from '__mocks__/Teams'
import MockMetrics from '__mocks__/Metrics'
import MockValueStreams, { createValueStream } from '__mocks__/ValueStreams'
import MockOrganizations from '__mocks__/Organizations'
import {
  withDashboardNotReadyHandler,
  DeliveryMetricsDashboardWidgets,
} from './DeliveryMetricsDashboardWidgets'

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
}))

jest.mock('./MetricsNotReady', () => ({
  __esModule: true,
  default: () => <div data-testid="MetricsNotReady" />,
}))

jest.mock('ui/LeadTimeCard', () => ({
  __esModule: true,
  default: () => <div data-testid="LeadTimeCard" />,
}))

jest.mock('ui/EffortCard', () => ({
  __esModule: true,
  default: () => <div data-testid="EffortCard" />,
}))

jest.mock('ui/DeployFrequencyCard', () => ({
  __esModule: true,
  default: () => <div data-testid="DeployFrequencyCard" />,
}))

jest.mock('ui/PipelineActivityCard', () => ({
  __esModule: true,
  default: () => <div data-testid="PipelineActivityCard" />,
}))

jest.mock('ui/WipLoadGaugeCard', () => ({
  __esModule: true,
  default: () => <div data-testid="WipLoadGaugeCard" />,
}))

jest.mock('ui/CIActivityCard', () => ({
  __esModule: true,
  default: () => <div data-testid="CIActivityCard" />,
}))

jest.mock('ui/CumulativeWorkflowCard', () => ({
  __esModule: true,
  default: () => <div data-testid="CumulativeWorkflowCard" />,
}))

jest.mock('ui/CycleTimeAndDefectsCard', () => ({
  __esModule: true,
  default: () => <div data-testid="CycleTimeAndDefectsCard" />,
}))

jest.mock('ui/CodeReviewTrendCard', () => ({
  __esModule: true,
  default: () => <div data-testid="CodeReviewTrendCard" />,
}))

jest.mock('ui/TechDebtCard', () => ({
  __esModule: true,
  default: () => <div data-testid="TechDebtCard" />,
}))

jest.mock('ui/VulnerabilitiesCard', () => ({
  __esModule: true,
  default: () => <div data-testid="VulnerabilitiesCard" />,
}))

const useAPIContextMock = useAPIContext as jest.Mock

const [organization] = MockOrganizations.result
const [valueStream] = MockValueStreams.result
const [team] = MockTeams.result

describe('withDashboardNotReadyHandler', () => {
  beforeEach(() => {
    useAPIContextMock.mockReturnValue({ featureFlags: {} })
  })

  it('should show metrics not ready message if server does not have the metrics', () => {
    const Component = withDashboardNotReadyHandler(() => (
      <div data-testid="WrappedComponent" />
    ))
    render(
      <Component
        apiMetrics={null}
        apiMetricsNotReady
        organization={organization}
        weekRange={4}
      />,
    )

    expect(screen.getByTestId('MetricsNotReady')).toBeInTheDocument()
  })

  it('should show metrics not ready message if the filtration for the parameters fail', () => {
    const Component = withDashboardNotReadyHandler(() => (
      <div data-testid="WrappedComponent" />
    ))
    render(
      <Component
        apiMetrics={MockMetrics.result}
        apiMetricsNotReady={false}
        organization={organization}
        valueStream={createValueStream({ name: 'does not exist' })}
        weekRange={4}
      />,
    )

    expect(screen.getByTestId('MetricsNotReady')).toBeInTheDocument()
  })

  it('otherwise should show the component', () => {
    const Component = withDashboardNotReadyHandler(() => (
      <div data-testid="WrappedComponent" />
    ))
    render(
      <Component
        apiMetrics={MockMetrics.result}
        apiMetricsNotReady={false}
        organization={organization}
        valueStream={valueStream}
        team={team}
        weekRange={4}
      />,
    )

    expect(screen.getByTestId('WrappedComponent')).toBeInTheDocument()
  })
})

describe('DeliveryMetricsDashboardWidgets', () => {
  it('should render the widgets', () => {
    useAPIContextMock.mockReturnValue({
      featureFlags: {
        FEATURE_DEPLOY_FREQUENCY: true,
      },
    })
    render(
      <DeliveryMetricsDashboardWidgets
        apiMetrics={MockMetrics.result}
        organization={organization}
        valueStream={valueStream}
        team={team}
        weekRange={4}
      />,
    )

    const expectedWidgetTestIds = [
      'LeadTimeCard',
      'EffortCard',
      'DeployFrequencyCard',
      'PipelineActivityCard',
      'WipLoadGaugeCard',
      'CIActivityCard',
      'CumulativeWorkflowCard',
      'CycleTimeAndDefectsCard',
      'CodeReviewTrendCard',
      'TechDebtCard',
      'VulnerabilitiesCard',
    ]
    expectedWidgetTestIds.forEach(testId => {
      expect(screen.getByTestId(testId)).toBeInTheDocument()
    })
  })
})
