import { render, screen } from '@testing-library/react'
import { useCurrentUserPermissions } from 'api'
import Organizations from '__mocks__/Organizations'
import Teams from '__mocks__/Teams'
import ValueStreams from '__mocks__/ValueStreams'
import { CostMetricsDashboard } from '.'

jest.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => (
    <div data-testid={`redirect-to-${to}`} />
  ),
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useCurrentUserPermissions: jest.fn(),
  useAPIContext: jest.fn(),
  withParamsBasedGroupEntities: jest.fn(),
  withFeatureFlag: jest
    .fn()
    .mockImplementation(
      ({
        featureFlagName: _,
        WrappedComponent,
        FeatureNotAllowedComponent: __,
      }) =>
        (props = undefined) => <WrappedComponent {...props} />,
    ),
}))

jest.mock('ui/DeliveryMetricsDashboard', () => ({
  withOrganizationMetrics: jest
    .fn()
    .mockReturnValue(() => <div data-testid="OrganizationAdminDashboard" />),
  withOrganizationAdminDashboard: jest.fn(),
  withValueStreamMetrics: jest
    .fn()
    .mockReturnValue(() => <div data-testid="ValueStreamAdminDashboard" />),
  withValueStreamAdminDashboard: jest.fn(),
  withTeamMetrics: jest
    .fn()
    .mockReturnValue(() => <div data-testid="TeamAdminDashboard" />),
  withTeamAdminDashboard: jest.fn(),
}))

jest.mock('./CostDashboardWidgets', () => ({
  __esModule: true,
  default: () => <div data-testid="CostDashboardWidgets" />,
}))

const [organization] = Organizations.result
const [valueStream] = ValueStreams.result
const [team] = Teams.result

const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock

describe('CostMetricsDashboard', () => {
  describe('regular path rendering', () => {
    it('should render OrganizationAdminDashboard if user has access to view organization cost metrics', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationCostMetrics: jest.fn().mockReturnValue(true),
        canViewValueStreamCostMetrics: jest.fn().mockReturnValue(true),
        canViewTeamCostMetrics: jest.fn().mockReturnValue(true),
      })

      render(
        <CostMetricsDashboard
          organization={organization}
          valueStream={valueStream}
          team={team}
        />,
      )

      expect(
        screen.getByTestId('OrganizationAdminDashboard'),
      ).toBeInTheDocument()
    })

    it('should render ValueStreamAdminDashboard if user has access to view valuestream cost metrics', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationCostMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamCostMetrics: jest.fn().mockReturnValue(true),
        canViewTeamCostMetrics: jest.fn().mockReturnValue(true),
      })

      render(
        <CostMetricsDashboard
          organization={organization}
          valueStream={valueStream}
          team={team}
        />,
      )

      expect(
        screen.getByTestId('ValueStreamAdminDashboard'),
      ).toBeInTheDocument()
    })

    it('should render TeamAdminDashboard if user has access to view team cost metrics', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationCostMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamCostMetrics: jest.fn().mockReturnValue(false),
        canViewTeamCostMetrics: jest.fn().mockReturnValue(true),
      })

      render(
        <CostMetricsDashboard
          organization={organization}
          valueStream={valueStream}
          team={team}
        />,
      )

      expect(screen.getByTestId('TeamAdminDashboard')).toBeInTheDocument()
    })
  })

  describe('permission denied', () => {
    afterEach(() => {
      expect(screen.getByTestId('redirect-to-/401')).toBeInTheDocument()
    })

    it('should show access denied if user tried to access organization they do not have access to', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationCostMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamCostMetrics: jest.fn(),
        canViewTeamCostMetrics: jest.fn(),
      })

      render(
        <CostMetricsDashboard
          organization={organization}
          valueStream={valueStream}
          team={team}
        />,
      )
    })

    it('should show access denied if user tried to access valuestream they do not have access to', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationCostMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamCostMetrics: jest.fn().mockReturnValue(false),
        canViewTeamCostMetrics: jest.fn(),
      })

      render(
        <CostMetricsDashboard
          organization={organization}
          valueStream={valueStream}
          team={team}
        />,
      )
    })

    it('should show access denied if user tried to access team they do not have access to', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canViewOrganizationCostMetrics: jest.fn().mockReturnValue(false),
        canViewValueStreamCostMetrics: jest.fn().mockReturnValue(false),
        canViewTeamCostMetrics: jest.fn().mockReturnValue(false),
      })

      render(
        <CostMetricsDashboard
          organization={organization}
          valueStream={valueStream}
          team={team}
        />,
      )
    })
  })
})
