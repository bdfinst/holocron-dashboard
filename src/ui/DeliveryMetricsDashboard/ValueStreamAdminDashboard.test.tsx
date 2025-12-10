import { renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  useCurrentUserPermissions,
  useGroupEntityRouteParams,
  getValueStreamMetrics,
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
import {
  withValueStreamAdminDashboard,
  useValueStreamMetrics,
} from './ValueStreamAdminDashboard'
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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // preserve other exports
  useNavigate: jest.fn(), // mock useNavigate
}))

jest.mock('loglevel')

jest.mock('local-storage')

const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock
const useAPIContextMock = useAPIContext as jest.Mock
const useGroupEntityRouteParamsMock = useGroupEntityRouteParams as jest.Mock
const localStorageMock = localStorage as unknown as {
  set: jest.Mock
  get: jest.Mock
}

const useMetricsMock = useMetrics as jest.Mock

const [organization] = Organizations.result
const [valueStream, anotherVS] = ValueStreams.result
const [team] = Teams.result
const [teamView] = TeamViews.result

const ValueStreamAdminDashboard = withValueStreamAdminDashboard({
  dashboardHomePagePath: '/delivery-metrics',
  permissionFunctionNames: {
    canViewValueStreamDashboardFunctionName: 'canViewValueStreamMetrics',
    canViewTeamDashboardFunctionName: 'canViewTeamMetrics',
  },
  valueStreamIDLocalStorageKey: 'id',
  DashboardWidgets,
})

describe('useValueStreamMetrics', () => {
  it('should call useMetrics hook', () => {
    useMetricsMock.mockReturnValue({})
    renderHook(() => {
      useValueStreamMetrics({ valueStream })
    })
    expect(useMetricsMock).toHaveBeenCalledWith(
      'VALUE_STREAM',
      getValueStreamMetrics,
      valueStream,
    )
  })
})

describe('ValueStreamAdminDashboard', () => {
  beforeAll(() => {
    useGroupEntityRouteParamsMock.mockReturnValue({
      getVSParamsForVSId: jest.fn().mockImplementation(vsId => {
        if (vsId === valueStream.id) {
          return {
            organizationName: organization.name,
            valueStreamName: valueStream.name,
          }
        }
        return {
          organizationName: organization.name,
          valueStreamName: anotherVS.name,
        }
      }),
      getTeamParamsForTeamId: jest.fn().mockReturnValue({
        organizationName: organization.name,
        valueStreamName: valueStream.name,
        teamName: team.name,
      }),
      getPathWithParams: jest
        .fn()
        .mockImplementation((pathMaker, params) =>
          params ? pathMaker(params) : `/404`,
        ),
    })
    useCurrentUserPermissionsMock.mockReturnValue({
      canViewTeamMetrics: jest.fn().mockReturnValue(true),
      canViewValueStreamMetrics: jest.fn().mockReturnValue(true),
    })
  })

  beforeEach(() => {
    useAPIContextMock.mockReturnValue({
      teamList: Teams.result,
      valueStreamList: ValueStreams.result,
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
    describe('valuestream selection', () => {
      it('should redirect to valuestream route and set local storage on valuestream change', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)

        RenderWithWrapper(
          <ValueStreamAdminDashboard
            organization={organization}
            valueStream={valueStream}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
          { initialEntries: [`/delivery-metrics/${organization.name}`] },
        )

        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', { name: 'Select a Value Stream' }),
          `${'{backspace}'.repeat(valueStream.name.length)}${
            anotherVS.name
          }{arrowdown}{enter}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${anotherVS.name}`,
        )
        expect(localStorageMock.set).toHaveBeenCalledTimes(1)
        expect(localStorageMock.set).toHaveBeenCalledWith('id', anotherVS.id)
      })
    })

    describe('team selection', () => {
      it('should redirect to team route if team field is selected', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
        RenderWithWrapper(
          <ValueStreamAdminDashboard
            organization={organization}
            valueStream={valueStream}
            apiMetrics={MockMetrics.result}
            apiMetricsNotReady={false}
          />,
          {
            initialEntries: [
              `/delivery-metrics/${organization.name}/${valueStream.name}`,
            ],
          },
        )

        await screen.findByTestId('DashboardWidgets')
        await userEvent.type(
          screen.getByRole('combobox', { name: 'Select a Team' }),
          `${team.name}{arrowdown}{enter}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${valueStream.name}/${team.name}`,
        )
      })

      it('should redirect to valuestream route if team field is cleared', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)

        RenderWithWrapper(
          <ValueStreamAdminDashboard
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

        await screen.findByTestId('DashboardWidgets')

        await userEvent.type(
          screen.getByRole('combobox', { name: 'Select a Team' }),
          `${'{backspace}'.repeat(team.name.length)}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${valueStream.name}`,
        )
      })
    })

    describe('FEATURE TEAM VIEWS team view selection', () => {
      beforeEach(() => {
        useAPIContextMock.mockReturnValue({
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
          <ValueStreamAdminDashboard
            organization={organization}
            valueStream={valueStream}
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
          `/delivery-metrics/${organization.name}/${valueStream.name}/${team.name}/${teamView.name}`,
        )
      })

      it('should redirect to valuestream path on team view being cleared', async () => {
        const mockNavigate = jest.fn()
        ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
        RenderWithWrapper(
          <ValueStreamAdminDashboard
            organization={organization}
            valueStream={valueStream}
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
          `${'{backspace}'.repeat(teamView.name.length)}`,
        )

        expect(mockNavigate).toHaveBeenCalledWith(
          `/delivery-metrics/${organization.name}/${valueStream.name}`,
        )
      })
    })
  })
})
