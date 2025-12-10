import { renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  useGroupEntityRouteParams,
  useCurrentUserPermissions,
  getTeamMetrics,
  useMetrics,
} from 'api'
import { useAPIContext } from 'api/hooks'
import Organizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import Teams from '__mocks__/Teams'
import TeamViews from '__mocks__/TeamViews'
import ValueStreams from '__mocks__/ValueStreams'
import * as localStorage from 'local-storage'
import MockMetrics from '__mocks__/Metrics'
import { useNavigate } from 'react-router-dom'
import DashboardWidgets from './DeliveryMetricsDashboardWidgets'
import { withTeamAdminDashboard, useTeamMetrics } from './TeamAdminDashboard'

jest.mock('./DeliveryMetricsDashboardWidgets', () => ({
  __esModule: true,
  default: () => <div data-testid="DashboardWidgets" />,
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useGroupEntityRouteParams: jest.fn(),
  useCurrentUserPermissions: jest.fn(),
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

const [organization] = Organizations.result
const [valueStream, anotherVS] = ValueStreams.result
const [team, anotherTeam] = Teams.result
const [teamView] = TeamViews.result

const useAPIContextMock = useAPIContext as jest.Mock
const useGroupEntityRouteParamsMock = useGroupEntityRouteParams as jest.Mock
const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock
const localStorageMock = localStorage as unknown as {
  set: jest.Mock
  get: jest.Mock
}
const useMetricsMock = useMetrics as jest.Mock

const TeamAdminDashboard = withTeamAdminDashboard({
  dashboardHomePagePath: '/delivery-metrics',
  permissionFunctionNames: {
    canViewTeamDashboardFunctionName: 'canViewTeamMetrics',
  },
  teamIDLocalStorageKey: 'id',
  DashboardWidgets,
})

describe('useTeamMetrics', () => {
  it('should call useMetrics with team when FEATURE_TEAM_VIEWS is disabled', () => {
    useMetricsMock.mockReturnValue({})
    useAPIContextMock.mockReturnValue({ featureFlags: {} })

    renderHook(() => useTeamMetrics({ team }))

    expect(useMetricsMock).toHaveBeenCalledWith('TEAM', getTeamMetrics, team)
  })

  it('should call useMetrics with team when FEATURE_TEAM_VIEWS is enabled, but team view is not being viewed', () => {
    useMetricsMock.mockReturnValue({})
    useAPIContextMock.mockReturnValue({
      featureFlags: { FEATURE_TEAM_VIEWS: true },
    })

    renderHook(() => useTeamMetrics({ team }))

    expect(useMetricsMock).toHaveBeenCalledWith('TEAM', getTeamMetrics, team)
  })

  it('should call useMetrics with team view if FEATURE_TEAM_VIEWS is enabled, and team view is being viewed', () => {
    useMetricsMock.mockReturnValue({})
    useAPIContextMock.mockReturnValue({
      featureFlags: { FEATURE_TEAM_VIEWS: true },
    })

    renderHook(() => useTeamMetrics({ team, teamView }))

    expect(useMetricsMock).toHaveBeenCalledWith(
      'TEAM',
      getTeamMetrics,
      teamView,
    )
  })
})

describe('TeamAdminDashboard', () => {
  beforeAll(() => {
    useGroupEntityRouteParamsMock.mockReturnValue({
      getTeamParamsForTeamId: jest.fn().mockImplementation(teamId => {
        if (teamId === team.id) {
          return {
            organizationName: organization.name,
            valueStreamName: valueStream.name,
            teamName: team.name,
          }
        }
        return {
          organizationName: organization.name,
          valueStreamName: anotherVS.name,
          teamName: anotherTeam.name,
        }
      }),
      getPathWithParams: jest
        .fn()
        .mockImplementation((pathMaker, params) =>
          params ? pathMaker(params) : `/404`,
        ),
    })
    useCurrentUserPermissionsMock.mockReturnValue({
      canViewTeamMetrics: jest.fn().mockReturnValue(true),
    })
  })

  beforeEach(() => {
    useAPIContextMock.mockReturnValue({
      teamList: Teams.result,
      featureFlags: {
        FEATURE_TEAM_VIEWS: false,
      },
    })
  })
  // Mock the useNavigate hook
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // preserve other exports
    useNavigate: jest.fn(), // mock useNavigate
  }))

  describe('selecting each metrics category', () => {
    describe('selecting team', () => {
      it('should redirect to team route and set local storage on team change', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
        RenderWithWrapper(
          <TeamAdminDashboard
            organization={organization}
            valueStream={valueStream}
            team={team}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
          {
            initialEntries: [
              `/delivery-metrics/${organization.name}/${valueStream.name}/${team.name}`,
            ],
          },
        )

        await userEvent.type(
          screen.getByRole('combobox', { name: 'Select a Team' }),
          `${'{backspace}'.repeat(team.name.length)}${
            anotherTeam.name
          }{arrowdown}{enter}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${anotherVS.name}/${anotherTeam.name}`,
        )
        expect(localStorageMock.set).toHaveBeenCalledTimes(1)
        expect(localStorageMock.set).toHaveBeenCalledWith('id', anotherTeam.id)
      })
    })

    describe('FEATURE TEAM VIEWS team view selection', () => {
      beforeEach(() => {
        useAPIContextMock.mockReturnValue({
          teamViews: TeamViews.result,
          featureFlags: {
            FEATURE_TEAM_VIEWS: true,
          },
          teamList: Teams.result,
        })
      })

      it('should redirect to new team view path on team view change', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
        RenderWithWrapper(
          <TeamAdminDashboard
            organization={organization}
            valueStream={valueStream}
            team={team}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
        )

        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', {
            name: 'Select a Team or a Team View',
          }),
          `${'{backspace}'.repeat(team.name.length)}${
            teamView.name
          }{arrowdown}{enter}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${valueStream.name}/${team.name}/${teamView.name}`,
        )
      })
    })
  })
})
