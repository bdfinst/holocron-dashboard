import { render, screen } from '@testing-library/react'
import MockValueStreams from '__mocks__/ValueStreams'
import MockOrganizations from '__mocks__/Organizations'
import Teams from '__mocks__/Teams'
import MockMetrics from '__mocks__/Metrics'
import { CostDashboardWidgets } from './CostDashboardWidgets'

jest.mock('ui/DeliveryMetricsDashboard', () => ({
  withDashboardNotReadyHandler: jest.fn(),
}))

jest.mock('ui/EffortCard', () => ({
  __esModule: true,
  default: () => <div data-testid="EffortCard" />,
}))

const [organization] = MockOrganizations.result
const [valueStream] = MockValueStreams.result
const [team] = Teams.result

describe('CostDashboardWidgets', () => {
  it('should render the widgets', () => {
    render(
      <CostDashboardWidgets
        apiMetrics={MockMetrics.result}
        organization={organization}
        valueStream={valueStream}
        team={team}
        weekRange={4}
      />,
    )

    expect(screen.getByTestId('EffortCard')).toBeInTheDocument()
  })
})
