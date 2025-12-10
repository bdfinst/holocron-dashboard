import { useAPIContext, useCollectorTargets } from 'api'
import { adminUser, basicUser, leadershipUser } from '__mocks__/Users'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import AdminPage from '.'

jest.mock('local-storage')

jest.mock('api/CollectorTargetsProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useCollectorTargetsContext: jest.fn().mockReturnValue({
    ticketBoards: [],
    repositories: [],
    pipelines: [],
    projects: [],
    isLoading: false,
    error: null,
  }),
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
  useCollectorTargets: jest.fn(),
}))

jest.mock('reactQueryConfig', () => {
  const config = jest.requireActual('reactQueryConfig').default
  const { USE_QUERY_CONFIG } = config
  return {
    __esModule: true,
    default: {
      ...config,
      USE_QUERY_CONFIG: {
        ...USE_QUERY_CONFIG,
        retry: 0,
      },
      LOGGER: {
        ...config.LOGGER,
        error: jest.fn(),
      },
    },
  }
})

jest.mock('ui/OnboardOrganizationWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="OnboardOrganizationWidget" />,
}))

jest.mock('ui/OnboardTeamWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="OnboardTeamWidget" />,
}))

jest.mock('ui/OnboardValueStreamWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="OnboardValueStreamWidget" />,
}))

jest.mock('ui/UploadEffortRate', () => ({
  __esModule: true,
  default: () => <div data-testid="UploadEffortRate" />,
}))

jest.mock('ui/ManageUsersTable', () => ({
  __esModule: true,
  default: () => <div data-testid="ManageUsersTable" />,
}))

jest.mock('ui/ConfigureCollectors', () => ({
  __esModule: true,
  default: () => <div data-testid="ConfigureCollectors" />,
}))

const useAPIContextMock = useAPIContext as jest.Mock
const useCollectorTargetsMock = useCollectorTargets as jest.Mock

describe('AdminPage', () => {
  const queryClient = new QueryClient()

  beforeEach(() => {
    jest.resetAllMocks()

    useAPIContextMock.mockReturnValue({
      featureFlags: {},
      currentUser: basicUser,
    })

    useCollectorTargetsMock.mockReturnValue({
      data: { ticketBoards: [], repositories: [], pipelines: [], projects: [] },
      isLoading: false,
      hasErrored: false,
    })
  })

  const renderAdminPage = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AdminPage />
      </QueryClientProvider>,
    )
  }

  it('should render with OnboardOrganizationWidget, OnboardValueStreamWidget, and OnboardTeamWidget', () => {
    renderAdminPage()

    expect(screen.getByTestId('OnboardOrganizationWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardValueStreamWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardTeamWidget')).toBeInTheDocument()
    expect(screen.queryByTestId('UploadEffortRate')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ManageUsersTable')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ConfigureCollectors')).not.toBeInTheDocument()
  })

  it('should render with effort rate if user is org leadership and FEATURE_COST_METRICS is on', () => {
    useAPIContextMock.mockReturnValue({
      featureFlags: { FEATURE_COST_METRICS: true },
      currentUser: leadershipUser,
    })
    renderAdminPage()

    expect(screen.getByTestId('OnboardOrganizationWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardValueStreamWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardTeamWidget')).toBeInTheDocument()
    expect(screen.getByTestId('UploadEffortRate')).toBeInTheDocument()
    expect(screen.queryByTestId('ManageUsersTable')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ConfigureCollectors')).not.toBeInTheDocument()
  })

  it('should render with ManageUsersTable if user is global admin', () => {
    useAPIContextMock.mockReturnValue({
      featureFlags: { FEATURE_COST_METRICS: true },
      currentUser: adminUser,
    })
    renderAdminPage()

    expect(screen.getByTestId('OnboardOrganizationWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardValueStreamWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardTeamWidget')).toBeInTheDocument()
    expect(screen.queryByTestId('UploadEffortRate')).not.toBeInTheDocument()
    expect(screen.getByTestId('ManageUsersTable')).toBeInTheDocument()
    expect(screen.queryByTestId('ConfigureCollectors')).not.toBeInTheDocument()
  })

  it('should render with ConfigureCollectors if user is global admin and FEATURE_COLLECTOR_CONFIGURATION is on', () => {
    useAPIContextMock.mockReturnValue({
      featureFlags: { FEATURE_COLLECTOR_CONFIGURATION: true },
      currentUser: adminUser,
    })
    renderAdminPage()

    expect(screen.getByTestId('OnboardOrganizationWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardValueStreamWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardTeamWidget')).toBeInTheDocument()
    expect(screen.getByTestId('ManageUsersTable')).toBeInTheDocument()
    expect(screen.getByTestId('ConfigureCollectors')).toBeInTheDocument()
  })

  it('should not render ConfigureCollectors if user is global admin but FEATURE_COLLECTOR_CONFIGURATION is off', () => {
    useAPIContextMock.mockReturnValue({
      featureFlags: { FEATURE_COLLECTOR_CONFIGURATION: false },
      currentUser: adminUser,
    })
    renderAdminPage()

    expect(screen.getByTestId('OnboardOrganizationWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardValueStreamWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OnboardTeamWidget')).toBeInTheDocument()
    expect(screen.getByTestId('ManageUsersTable')).toBeInTheDocument()
    expect(screen.queryByTestId('ConfigureCollectors')).not.toBeInTheDocument()
  })
})
