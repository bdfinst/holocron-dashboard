import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import {
  useCurrentUserPermissions,
  useGroupEntityRouteParams,
  getOrganizationMetrics,
  useMetrics,
} from 'api'
import { useAPIContext } from 'api/hooks'
import Organizations from '__mocks__/Organizations'
import ValueStreams from '__mocks__/ValueStreams'
import Teams from '__mocks__/Teams'
import { renderHook, screen } from '@testing-library/react'
import MockMetrics from '__mocks__/Metrics'
import userEvent from '@testing-library/user-event'
import TeamViews from '__mocks__/TeamViews'
import * as localStorage from 'local-storage'
import { useNavigate } from 'react-router-dom'
import {
  useOrganizationMetrics,
  withOrganizationAdminDashboard,
} from './OrganizationAdminDashboard'
import DashboardWidgets from './DeliveryMetricsDashboardWidgets'

jest.mock('./DeliveryMetricsDashboardWidgets', () => ({
  __esModule: true,
  default: () => <div data-testid="DashboardWidgets" />,
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useCurrentUserPermissions: jest.fn(),
  useGroupEntityRouteParams: jest.fn(),
  useMetrics: jest.fn(),
}))

jest.mock('api/hooks', () => ({
  ...jest.requireActual('api/hooks'),
  useAPIContext: jest.fn(),
}))

jest.mock('loglevel')

jest.mock('local-storage')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock
const useAPIContextMock = useAPIContext as jest.Mock
const useGroupEntityRouteParamsMock = useGroupEntityRouteParams as jest.Mock
const localStorageMock = localStorage as unknown as {
  set: jest.Mock
  get: jest.Mock
}
const useMetricsMock = useMetrics as jest.Mock

const [organization, anotherOrg] = Organizations.result
const [valuestream] = ValueStreams.result
const [team] = Teams.result
const [teamView] = TeamViews.result

const OrganizationAdminDashboard = withOrganizationAdminDashboard({
  dashboardHomePagePath: '/delivery-metrics',
  permissionFunctionNames: {
    canViewOrganizationDashboardFunctionName: 'canViewOrganizationMetrics',
    canViewValueStreamDashboardFunctionName: 'canViewValueStreamMetrics',
    canViewTeamDashboardFunctionName: 'canViewTeamMetrics',
  },
  organizationIDLocalStorageKey: 'id',
  DashboardWidgets,
})

describe('useOrganizationMetrics', () => {
  it('should call the useMetrics hook', () => {
    useMetricsMock.mockReturnValue({})
    renderHook(() => {
      useOrganizationMetrics({ organization })
    })
    expect(useMetricsMock).toHaveBeenCalledWith(
      'ORGANIZATION',
      getOrganizationMetrics,
      organization,
    )
  })
})

describe('OrganizationAdminDashboard', () => {
  beforeAll(() => {
    useGroupEntityRouteParamsMock.mockReturnValue({
      getOrgParamsForOrgId: jest.fn().mockImplementation(orgId => {
        if (orgId === organization.id) {
          return { organizationName: organization.name }
        }
        return { organizationName: anotherOrg.name }
      }),
      getVSParamsForVSId: jest.fn().mockReturnValue({
        organizationName: organization.name,
        valueStreamName: valuestream.name,
      }),
      getTeamParamsForTeamId: jest.fn().mockReturnValue({
        organizationName: organization.name,
        valueStreamName: valuestream.name,
        teamName: team.name,
      }),
      getPathWithParams: jest
        .fn()
        .mockImplementation((pathMaker, params) =>
          params ? pathMaker(params) : `/404`,
        ),
    })
    useCurrentUserPermissionsMock.mockReturnValue({
      canViewOrganizationMetrics: jest.fn().mockReturnValue(true),
      canViewTeamMetrics: jest.fn().mockReturnValue(true),
      canViewValueStreamMetrics: jest.fn().mockReturnValue(true),
    })
  })

  beforeEach(() => {
    useAPIContextMock.mockReturnValue({
      organizationList: Organizations.result,
      valueStreamList: ValueStreams.result,
      teamList: Teams.result,
      featureFlags: {
        FEATURE_TEAM_VIEWS: false,
      },
    })
  })

  describe('selecting each metrics category', () => {
    describe('organization selection', () => {
      it('should redirect to a new organization path and set local storage on organization change', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
        RenderWithWrapper(
          <OrganizationAdminDashboard
            organization={organization}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
          { initialEntries: [`/delivery-metrics/${organization.name}`] },
        )
        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', { name: 'Select an Organization' }),
          `${'{backspace}'.repeat(organization.name.length)}${
            anotherOrg.name
          }{arrowdown}{enter}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${anotherOrg.name}`,
        )
        expect(localStorageMock.set).toHaveBeenCalledTimes(1)
        expect(localStorageMock.set).toHaveBeenCalledWith('id', anotherOrg.id)
      })
    })

    describe('valueStream selection', () => {
      it('should redirect to new valuestream path on valuestream change', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
        RenderWithWrapper(
          <OrganizationAdminDashboard
            organization={organization}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
          {
            initialEntries: [
              `/delivery-metrics/${organization.name}/${valuestream.name}`,
            ],
          },
        )

        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', { name: 'Select a Value Stream' }),
          `${valuestream.name}{arrowdown}{enter}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${valuestream.name}`,
        )
      })

      it('should redirect to organization path on valuestream being cleared', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
        RenderWithWrapper(
          <OrganizationAdminDashboard
            organization={organization}
            valueStream={valuestream}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
          {
            initialEntries: [
              `/delivery-metrics/${organization.name}/${valuestream.name}`,
            ],
          },
        )

        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', { name: 'Select a Value Stream' }),
          `${'{backspace}'.repeat(valuestream.name.length)}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}`,
        )
      })
    })

    describe('team selection', () => {
      it('should redirect to new team path on team change', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
        RenderWithWrapper(
          <OrganizationAdminDashboard
            organization={organization}
            valueStream={valuestream}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
        )

        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', { name: 'Select a Team' }),
          `${team.name}{arrowdown}{enter}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${valuestream.name}/${team.name}`,
        )
      })

      it('should redirect to valuestream path on team being cleared', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
        RenderWithWrapper(
          <OrganizationAdminDashboard
            organization={organization}
            valueStream={valuestream}
            team={team}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
        )

        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', { name: 'Select a Team' }),
          `${'{backspace}'.repeat(team.name.length)}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${valuestream.name}`,
        )
      })
    })

    describe('FEATURE TEAM VIEWS team view selection', () => {
      beforeEach(() => {
        useAPIContextMock.mockReturnValue({
          organizationList: Organizations.result,
          valueStreamList: ValueStreams.result,
          teamList: Teams.result,
          teamViews: TeamViews.result,
          featureFlags: {
            FEATURE_TEAM_VIEWS: true,
          },
        })
      })

      it('should redirect to new team view path on team view change', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
        RenderWithWrapper(
          <OrganizationAdminDashboard
            organization={organization}
            valueStream={valuestream}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
        )

        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', {
            name: 'Select a Team or a Team View',
          }),
          `${teamView.name}{arrowdown}{enter}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${valuestream.name}/${team.name}/${teamView.name}`,
        )
      })

      it('should redirect to valuestream path on team view being cleared', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
        RenderWithWrapper(
          <OrganizationAdminDashboard
            organization={organization}
            valueStream={valuestream}
            team={team}
            teamView={teamView}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
        )

        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', {
            name: 'Select a Team or a Team View',
          }),
          `${'{backspace}'.repeat(teamView.name.length)}{backspace}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${valuestream.name}`,
        )
      })
    })
  })
})
