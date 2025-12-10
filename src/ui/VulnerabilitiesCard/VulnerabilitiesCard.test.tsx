import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import MockMetrics from '__mocks__/Metrics'
import { screen, within } from '@testing-library/react'
import VulnerabilitiesCard from '.'

jest.mock('./helpContent.md', () => 'helpContent')

jest.mock('./ActiveVulnerabilitiesTable', () => ({
  __esModule: true,
  default: () => <div data-testid="ActiveVulnerabilitiesTable" />,
}))

jest.mock('./VulnerabilitiesTrendChart', () => ({
  ...jest.requireActual('./VulnerabilitiesTrendChart'),
  __esModule: true,
  default: () => <div data-testid="VulnerabilitiesTrendChart" />,
}))

jest.mock('./VulnerabilitiesTrendBySeverityChart', () => ({
  ...jest.requireActual('./VulnerabilitiesTrendBySeverityChart'),
  __esModule: true,
  default: () => <div data-testid="VulnerabilitiesTrendBySeverityChart" />,
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

describe('VulnerabilitiesCard', () => {
  it('should render with VulnerabilitiesTrendChart in main view, and other charts in AdditionalInformation', () => {
    RenderWithWrapper(
      <VulnerabilitiesCard apiMetrics={MockMetrics.result} weekRange={4} />,
    )
    expect(screen.getByTestId('VulnerabilitiesTrendChart')).toBeInTheDocument()
    const { getByTestId } = within(
      // first card wrapper additional information is what we are
      // interested in in the ui.
      screen.getAllByTestId('AdditionalInformation')[0],
    )
    expect(getByTestId('ActiveVulnerabilitiesTable')).toBeInTheDocument()
    expect(
      getByTestId('VulnerabilitiesTrendBySeverityChart'),
    ).toBeInTheDocument()
  })
})
