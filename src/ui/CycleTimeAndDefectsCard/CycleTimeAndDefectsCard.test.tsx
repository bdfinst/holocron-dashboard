import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import MockMetrics from '__mocks__/Metrics'
import { screen, within } from '@testing-library/react'
import CycleTimeAndDefectsCard from '.'

jest.mock('./helpContent.md', () => 'helpContent')

jest.mock('./DefectPriorityPieChart', () => ({
  ...jest.requireActual('./DefectPriorityPieChart'),
  __esModule: true,
  default: () => <div data-testid="DefectPriorityPieChart" />,
}))

jest.mock('./DefectPriorityRateTrendChart', () => ({
  ...jest.requireActual('./DefectPriorityRateTrendChart'),
  __esModule: true,
  default: () => <div data-testid="DefectPriorityRateTrendChart" />,
}))

jest.mock('./DefectRateTrendChart', () => ({
  ...jest.requireActual('./DefectRateTrendChart'),
  __esModule: true,
  default: () => <div data-testid="DefectRateTrendChart" />,
}))

jest.mock('./DevCycleTimeHistogram', () => ({
  ...jest.requireActual('./DevCycleTimeHistogram'),
  __esModule: true,
  default: () => <div data-testid="DevCycleTimeHistogram" />,
}))

jest.mock('./DevCycleTimeScatterChart', () => ({
  ...jest.requireActual('./DevCycleTimeScatterChart'),
  __esModule: true,
  default: () => <div data-testid="DevCycleTimeScatterChart" />,
}))

jest.mock('./DevCycleTimeTrendChart', () => ({
  ...jest.requireActual('./DevCycleTimeTrendChart'),
  __esModule: true,
  default: () => <div data-testid="DevCycleTimeTrendChart" />,
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

describe('CycleTimeAndDefectsCard', () => {
  it('should render with DevCycleTimeTrendChart and DefectRateTrendChart, and have the rest of the charts for additional information', () => {
    RenderWithWrapper(
      <CycleTimeAndDefectsCard apiMetrics={MockMetrics.result} weekRange={4} />,
    )
    expect(screen.getByTestId('DevCycleTimeTrendChart')).toBeInTheDocument()
    expect(screen.getByTestId('DefectRateTrendChart')).toBeInTheDocument()
    const { getByTestId } = within(
      // first card wrapper additional information is what we are
      // interested in in the ui.
      screen.getAllByTestId('AdditionalInformation')[0],
    )
    expect(getByTestId('DevCycleTimeHistogram')).toBeInTheDocument()
    expect(getByTestId('DefectPriorityRateTrendChart')).toBeInTheDocument()
    expect(getByTestId('DefectPriorityPieChart')).toBeInTheDocument()
    expect(getByTestId('DevCycleTimeHistogram')).toBeInTheDocument()
  })
})
