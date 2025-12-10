import { screen, render } from '@testing-library/react'
import { useAPIContext, useCurrentUserPermissions } from 'api'
import Organizations from '__mocks__/Organizations'
import Teams from '__mocks__/Teams'
import ValueStreams from '__mocks__/ValueStreams'
import { DeliveryMetricsDashboard } from '.'

jest.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => (
    <div data-testid={`redirect-to-${to}`} />
  ),
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useCurrentUserPermissions: jest.fn(),
  useAPIContext: jest.fn(),
  withParamsBasedEntities: jest.fn(),
}))

jest.mock('./OrganizationAdminDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="OrganizationAdminDashboard" />,
}))

jest.mock('./ValueStreamAdminDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="ValueStreamAdminDashboard" />,
}))

jest.mock('./TeamAdminDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="TeamAdminDashboard" />,
}))

jest.mock('./DeliveryMetricsDashboardWidgets', () => ({
  __esModule: true,
  default: () => <div data-testid="DeliveryMetricsDashboardWidgets" />,
}))

const useAPIContextMock = useAPIContext as jest.Mock
const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock

describe('Dashboard', () => {
  beforeAll(() => {
    useAPIContextMock.mockReturnValue({
      teamList: Teams.result,
      valueStreamList: ValueStreams.result,
      organizationList: Organizations.result,
    })
  })

  describe('regular path rendering', () => {
    it('should render OrganizationAdminDashboard if user has access to view organization metrics', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationMetrics: jest.fn().mockReturnValue(true),
        canViewValueStreamMetrics: jest.fn().mockReturnValue(true),
        canViewTeamMetrics: jest.fn().mockReturnValue(true),
      })

      render(<DeliveryMetricsDashboard />)

      expect(
        screen.getByTestId('OrganizationAdminDashboard'),
      ).toBeInTheDocument()
    })

    it('should render ValueStreamAdminDashboard if user has access to view valuestream metrics', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamMetrics: jest.fn().mockReturnValue(true),
        canViewTeamMetrics: jest.fn().mockReturnValue(true),
      })

      render(<DeliveryMetricsDashboard />)

      expect(
        screen.getByTestId('ValueStreamAdminDashboard'),
      ).toBeInTheDocument()
    })

    it('should render TeamAdminDashboard if user has access to view team metrics', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamMetrics: jest.fn().mockReturnValue(false),
        canViewTeamMetrics: jest.fn().mockReturnValue(true),
      })

      render(<DeliveryMetricsDashboard />)

      expect(screen.getByTestId('TeamAdminDashboard')).toBeInTheDocument()
    })
  })

  describe('permission denied', () => {
    afterEach(() => {
      expect(screen.getByTestId('redirect-to-/401')).toBeInTheDocument()
    })

    it('should show access denied if user tried to access organization they do not have access to', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamMetrics: jest.fn(),
        canViewTeamMetrics: jest.fn(),
      })

      render(<DeliveryMetricsDashboard />)
    })

    it('should show access denied if user tried to access valuestream they do not have access to', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamMetrics: jest.fn().mockReturnValue(false),
        canViewTeamMetrics: jest.fn(),
      })

      render(<DeliveryMetricsDashboard />)
    })

    it('should show access denied if user tried to access team they do not have access to', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamMetrics: jest.fn().mockReturnValue(false),
        canViewTeamMetrics: jest.fn().mockReturnValue(false),
      })

      render(<DeliveryMetricsDashboard />)
    })
  })
})
