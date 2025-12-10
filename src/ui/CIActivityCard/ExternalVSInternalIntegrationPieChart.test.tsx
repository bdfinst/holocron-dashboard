import { screen } from '@testing-library/react'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import ExternalVSInternalIntegrationsPieChartCard, {
  ChartTooltip,
  getIntegrationSectors,
  getReducedRatio,
} from './ExternalVSInternalIntegrationPieChart'
import { CIActivityChartDataPoint } from './utils'

jest.mock('recharts', () => ({
  Cell: () => <div data-testid="Cell" />,
  Label: ({ content }: { content: JSX.Element }) => (
    <div data-testid="Label">{content}</div>
  ),
  Legend: () => <div data-testid="Legend" />,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <svg>{children}</svg>
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div data-testid="Tooltip" />,
}))

describe('getReducedRatio', () => {
  it('should return a 1 to 1 ratio as a sample', () => {
    expect(getReducedRatio(1, 1)).toEqual({
      numberARatioAmount: 1,
      numberBRatioAmount: 1,
    })
    expect(getReducedRatio(2, 2)).toEqual({
      numberARatioAmount: 1,
      numberBRatioAmount: 1,
    })
  })

  it('should return 2 to 1/ 1 to 2 ratio as a sample', () => {
    expect(getReducedRatio(2, 1)).toEqual({
      numberARatioAmount: 2,
      numberBRatioAmount: 1,
    })
    expect(getReducedRatio(1, 2)).toEqual({
      numberARatioAmount: 1,
      numberBRatioAmount: 2,
    })
  })

  it('should return the reduced fraction as ratio', () => {
    expect(getReducedRatio(12, 4)).toEqual({
      numberARatioAmount: 3,
      numberBRatioAmount: 1,
    })
    expect(getReducedRatio(4, 24)).toEqual({
      numberARatioAmount: 1,
      numberBRatioAmount: 6,
    })
  })

  it('should return the unreduced form if the fraction is already reduced', () => {
    expect(getReducedRatio(3, 5)).toEqual({
      numberARatioAmount: 3,
      numberBRatioAmount: 5,
    })
    expect(getReducedRatio(4, 5)).toEqual({
      numberARatioAmount: 4,
      numberBRatioAmount: 5,
    })
  })
})

describe('getIntegrationSectors', () => {
  it('should calculate the total internal and external integrations amount for the given data points', () => {
    expect(
      getIntegrationSectors([
        {
          totalInternalIntegrations: 1,
          totalExternalIntegrations: 1,
        },
        {
          totalInternalIntegrations: 1,
          totalExternalIntegrations: 2,
        },
        {
          totalInternalIntegrations: 2,
          totalExternalIntegrations: 1,
        },
      ] as CIActivityChartDataPoint[]),
    ).toEqual([
      {
        categoryKey: 'totalExternalIntegrations',
        category: 'External Integrations',
        amount: 4,
      },
      {
        categoryKey: 'totalInternalIntegrations',
        category: 'Internal Integrations',
        amount: 4,
      },
    ])
  })
})

describe('ChartTooltip', () => {
  it('should render with the amount of internal or external integrations and shown as percentage', () => {
    RenderWithWrapper(
      <ChartTooltip
        active
        payload={[
          {
            value: 24,
            name: 'Internal Integrations',
            payload: {
              categoryKey: 'totalInternalIntegrations',
              category: 'Internal Integrations',
              amount: 24,
            },
          },
        ]}
        totalIntegrations={48}
      />,
    )

    expect(screen.getByText('Total Integrations:')).toBeInTheDocument()
    expect(screen.getByText('48')).toBeInTheDocument()
    expect(screen.getByText('Internal Integrations / %:')).toBeInTheDocument()
    expect(screen.getByText('24 / 50%')).toBeInTheDocument()
  })
})

describe('ExternalVSInternalIntegrationsPieChartCard', () => {
  it('should render with the title and ratio of external to internal integration', () => {
    RenderWithWrapper(
      <ExternalVSInternalIntegrationsPieChartCard
        data={
          [
            {
              totalInternalIntegrations: 1,
              totalExternalIntegrations: 2,
            },
            {
              totalInternalIntegrations: 1,
              totalExternalIntegrations: 2,
            },
            {
              totalInternalIntegrations: 1,
              totalExternalIntegrations: 2,
            },
          ] as CIActivityChartDataPoint[]
        }
      />,
    )

    expect(screen.getByText('Integration Distribution')).toBeInTheDocument()
    expect(screen.getByText(2)).toBeInTheDocument()
    expect(screen.getByText('to')).toBeInTheDocument()
    expect(screen.getByText(1)).toBeInTheDocument()
  })
})
