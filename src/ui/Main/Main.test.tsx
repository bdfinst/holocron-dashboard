import { screen } from '@testing-library/react'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { adminUser } from '__mocks__/Users'
import { useAPIContext, useCollectorTargetsContext } from 'api'
import Main from '.'

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  APIContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="APIContextProvider">{children}</div>
  ),
  CollectorTargetsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="CollectorTargetsProvider">{children}</div>
  ),
  useAPIContext: jest.fn(),
  useCollectorTargetsContext: jest.fn(),
}))

jest.mock('ui/OnboardTeamWidget', () => ({
  UpdateTeamForm: () => <div data-testid="UpdateTeamForm" />,
  CreateTeamForm: () => <div data-testid="CreateTeamForm" />,
}))

jest.mock('ui/OnboardTeamViewWidget', () => ({
  UpdateTeamViewForm: () => <div data-testid="UpdateTeamViewForm" />,
  CreateTeamViewForm: () => <div data-testid="CreateTeamViewForm" />,
}))

jest.mock('ui/HeaderBar/SwitchThemeButton', () => ({
  __esModule: true,
  default: () => <div data-testid="SwitchThemeButton" />,
}))

jest.mock('ui/HeaderBar/infoContent.md', () => 'some content')

jest.mock('ui/CostMetricsDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="CostMetricsDashboard" />,
}))

jest.mock('ui/CostMetricsHomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="CostMetricsHomePage" />,
}))

jest.mock('ui/DeliveryMetricsDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="DeliveryMetricsDashboard" />,
}))

jest.mock('ui/HomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="HomePage" />,
}))

jest.mock('ui/OnboardOrganizationWidget', () => ({
  CreateOrganizationForm: () => <div data-testid="CreateOrganizationForm" />,
  UpdateOrganizationForm: () => <div data-testid="UpdateOrganizationForm" />,
}))

jest.mock('ui/OnboardValueStreamWidget', () => ({
  CreateValueStreamForm: () => <div data-testid="CreateValueStreamForm" />,
  UpdateValueStreamForm: () => <div data-testid="UpdateValueStreamForm" />,
}))

const useAPIContextMock = useAPIContext as jest.Mock
const useCollectorTargetsContextMock = useCollectorTargetsContext as jest.Mock

describe('Main Component', () => {
  beforeAll(() => {
    useAPIContextMock.mockReturnValue({
      featureFlags: {},
      currentUser: adminUser,
    })

    useCollectorTargetsContextMock.mockReturnValue({
      ticketBoards: [],
      repositories: [],
      pipelines: [],
      projects: [],
      isLoading: false,
      error: null,
    })
  })

  describe('Sidebar control', () => {
    it('Should toggle between hamburger and chevron buttons', async () => {
      RenderWithWrapper(<Main />)
      const hamburger = screen.getByLabelText(/open drawer/i)
      const [chevron] = screen.getAllByLabelText(/close drawer/i)
      await userEvent.click(hamburger)
      expect(chevron).toBeVisible()
      await userEvent.click(chevron)
      expect(hamburger).toBeVisible()
    })
  })

  describe('routes', () => {
    it('should redirect to a 404 route if route is not found', () => {
      RenderWithWrapper(<Main />, {
        initialEntries: ['/foobar'],
      })

      expect(screen.getByText('Warning: Page not Found')).toBeInTheDocument()
    })

    it('should render HomePage on "/" route', () => {
      RenderWithWrapper(<Main />, {
        initialEntries: ['/'],
      })

      expect(screen.getByTestId('HomePage')).toBeInTheDocument()
    })

    it('should render CostMetricsDashboard on "/costs/:organizationName" route', () => {
      RenderWithWrapper(<Main />, {
        initialEntries: ['/costs/my-org'],
      })

      expect(screen.getByTestId('CostMetricsDashboard')).toBeInTheDocument()
    })

    it('should render CreateTeamForm on "/admin/add-team" route', () => {
      RenderWithWrapper(<Main />, {
        initialEntries: ['/admin/add-team'],
      })

      expect(screen.getByTestId('CreateTeamForm')).toBeInTheDocument()
    })

    it('should ensure CollectorTargetsProvider is used', () => {
      RenderWithWrapper(<Main />)
      expect(screen.getByTestId('CollectorTargetsProvider')).toBeInTheDocument()
    })
    it('should nest CollectorTargetsProvider inside APIContextProvider', () => {
      RenderWithWrapper(<Main />)
      const apiProvider = screen.getByTestId('APIContextProvider')
      const collectorTargetsProvider = screen.getByTestId(
        'CollectorTargetsProvider',
      )
      expect(apiProvider).toContainElement(collectorTargetsProvider)
    })
  })
})
