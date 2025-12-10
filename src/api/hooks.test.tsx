import { act, renderHook, waitFor } from '@testing-library/react'
import {
  QueryClient,
  QueryClientProvider,
  QueryObserverSuccessResult,
} from 'react-query'
import TicketBoards from '__mocks__/TicketBoards'
import MockOrganizations from '__mocks__/Organizations'
import Pipelines from '__mocks__/Pipelines'
import Repos from '__mocks__/Repos'
import * as reactQueryModule from 'react-query'
import reactQueryConfig from 'reactQueryConfig'
import {
  adminUser,
  allMockUsers,
  leadershipAndOrgAdminUser,
  leadershipUser,
  organizationAdmin,
  teamAdmin,
  valueStreamAdmin,
} from '__mocks__/Users'
import MockMetrics from '__mocks__/Metrics'
import { useParams } from 'react-router-dom'
import MockValueStreams from '__mocks__/ValueStreams'
import MockTeams from '__mocks__/Teams'
import MockTeamViews from '__mocks__/TeamViews'
import React, { useMemo } from 'react'
import MockCodeAnalysisProjects from '__mocks__/CodeAnalysisProjects'
import MockCollectors from '__mocks__/Collectors'
import { getCollectors } from 'api/api'
import {
  getOrganizations,
  getTeams,
  getValueStreams,
  getTicketBoards,
  getRepositories,
  getPipelines,
  getTeamViews,
  getFeatureFlags,
  getUsers,
  getOrganizationMetrics,
  METRICS_NOT_READY_ERROR,
  TeamMetrics,
  getProjects,
} from './api'
import {
  useCollectorTargets,
  useRequiredAPIData,
  useOnUserChangeAPIData,
  useMetrics,
  APIContext,
  useParamsBasedGroupEntities,
  useGroupEntityRouteParams,
  useCurrentUserPermissions,
  getImplementationFromFeatureFlags,
} from './hooks'

jest.mock('loglevel')

jest.mock('local-storage')

jest.mock('./api')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

jest.mock('reactQueryConfig', () => {
  const config = jest.requireActual('reactQueryConfig').default
  const { USE_QUERY_CONFIG } = config
  return {
    __esModule: true,
    default: {
      // keep everything in config
      ...config,
      // only change this
      USE_QUERY_CONFIG: {
        ...USE_QUERY_CONFIG,
        retry: 0,
      },
    },
  }
})

const getTeamsMock = getTeams as jest.Mock
const getValueStreamsMock = getValueStreams as jest.Mock
const getOrganizationsMock = getOrganizations as jest.Mock
const getTicketBoardsMock = getTicketBoards as jest.Mock
const getRepositoriesMock = getRepositories as jest.Mock
const getPipelinesMock = getPipelines as jest.Mock
const getTeamViewsMock = getTeamViews as jest.Mock
const getFeatureFlagsMock = getFeatureFlags as jest.Mock
const getUsersMock = getUsers as jest.Mock
const getOrganizationMetricsMock = getOrganizationMetrics as jest.Mock
const useParamsMock = useParams as jest.Mock
const getProjectsMock = getProjects as jest.Mock
const getCollectorsMock = getCollectors as jest.Mock

const mockClient = {
  invalidateQueries: jest.fn(),
  removeQueries: jest.fn(),
}

const [mockOrganization] = MockOrganizations.result
const [mockValueStream] = MockValueStreams.result
const [mockTeam] = MockTeams.result
const [mockTeamView] = MockTeamViews.result

const apiContextWrapper =
  ({
    currentUser = adminUser,
    featureFlags = {},
    teamList = MockTeams.result,
    valueStreamList = MockValueStreams.result,
    organizationList = MockOrganizations.result,
    teamViews = MockTeamViews.result,
    allUsers = allMockUsers.result,
    collectors = MockCollectors.result,
  }) =>
  ({ children }: { children: React.ReactNode }) => {
    const value = useMemo(
      () => ({
        valueStreamList,
        teamList,
        organizationList,
        currentUser,
        featureFlags,
        teamViews,
        collectors,
        allUsers,
      }),
      [],
    )
    return <APIContext.Provider value={value}>{children}</APIContext.Provider>
  }

const ClientWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('useOnUserChangeAPIData', () => {
  it('should update api data if updateAPIData function from the hook is called', async () => {
    const useQueryClientMock = jest
      .spyOn(reactQueryModule, 'useQueryClient')
      .mockReturnValue(mockClient as unknown as QueryClient)

    const { result } = renderHook(() => useOnUserChangeAPIData())

    act(() => {
      result.current()
    })

    await waitFor(() => {
      expect(mockClient.invalidateQueries).toHaveBeenCalledTimes(1)
      expect(mockClient.invalidateQueries).toHaveBeenCalledWith(
        reactQueryConfig.GROUP_ENTITIES,
      )
    })

    expect(mockClient.removeQueries).toHaveBeenCalledTimes(2)
    expect(mockClient.removeQueries).toHaveBeenCalledWith({
      queryKey: reactQueryConfig.METRICS,
    })
    expect(mockClient.removeQueries).toHaveBeenCalledWith(
      reactQueryConfig.COLLECTOR_TARGETS,
    )

    useQueryClientMock.mockRestore()
  })
})

describe('useRequiredAPIData', () => {
  beforeEach(() => {
    getTeamsMock.mockResolvedValue(MockTeams.result)
    getValueStreamsMock.mockResolvedValue(MockValueStreams.result)
    getOrganizationsMock.mockResolvedValue(MockOrganizations.result)
    getTeamViewsMock.mockResolvedValue(MockTeamViews.result)
    getCollectorsMock.mockResolvedValue(MockCollectors.result)
    getUsersMock.mockResolvedValue({
      currentUser: adminUser,
      allUsers: allMockUsers,
    })
    getFeatureFlagsMock.mockResolvedValue({
      FEATURE_TEAM_VIEWS: false,
      FEATURE_COLLECTOR_CONFIGURATION: false,
    })
  })

  afterEach(() => {
    getTeamsMock.mockReset()
    getValueStreamsMock.mockReset()
    getOrganizationsMock.mockReset()
    getTeamViewsMock.mockReset()
    getCollectorsMock.mockReset()
    getUsersMock.mockReset()
    getFeatureFlagsMock.mockReset()
  })

  it('should fetch required data', async () => {
    renderHook(() => useRequiredAPIData(), {
      wrapper: ClientWrapper,
    })

    await waitFor(() => {
      expect(getUsersMock).toHaveBeenCalledTimes(1)
      expect(getTeamsMock).toHaveBeenCalledTimes(1)
      expect(getValueStreamsMock).toHaveBeenCalledTimes(1)
      expect(getOrganizationsMock).toHaveBeenCalledTimes(1)
      expect(getFeatureFlagsMock).toHaveBeenCalledTimes(1)
    })

    expect(getCollectorsMock).toHaveBeenCalledTimes(0)
    expect(getTeamViewsMock).toHaveBeenCalledTimes(0)
  })

  it('should fetch with team views if FEATURE_TEAM_VIEWS is on', async () => {
    getFeatureFlagsMock.mockResolvedValue({ FEATURE_TEAM_VIEWS: true })

    renderHook(() => useRequiredAPIData(), {
      wrapper: ClientWrapper,
    })

    await waitFor(() => {
      expect(getUsersMock).toHaveBeenCalledTimes(1)
      expect(getTeamsMock).toHaveBeenCalledTimes(1)
      expect(getValueStreamsMock).toHaveBeenCalledTimes(1)
      expect(getOrganizationsMock).toHaveBeenCalledTimes(1)
      expect(getFeatureFlagsMock).toHaveBeenCalledTimes(1)
      expect(getTeamViewsMock).toHaveBeenCalledTimes(1)
    })
  })
  it('should fetch Collectors if FEATURE_COLLECTOR_CONFIGURATION is on', async () => {
    getFeatureFlagsMock.mockResolvedValue({
      FEATURE_COLLECTOR_CONFIGURATION: true,
    })

    renderHook(() => useRequiredAPIData(), {
      wrapper: ClientWrapper,
    })

    await waitFor(() => {
      expect(getUsersMock).toHaveBeenCalledTimes(1)
      expect(getTeamsMock).toHaveBeenCalledTimes(1)
      expect(getValueStreamsMock).toHaveBeenCalledTimes(1)
      expect(getOrganizationsMock).toHaveBeenCalledTimes(1)
      expect(getFeatureFlagsMock).toHaveBeenCalledTimes(1)
      expect(getCollectorsMock).toHaveBeenCalledTimes(1)
    })
  })
})

describe('useCollectorTargets', () => {
  beforeEach(() => {
    getTicketBoardsMock.mockResolvedValue(TicketBoards.result)
    getRepositoriesMock.mockResolvedValue(Repos.result)
    getPipelinesMock.mockResolvedValue(Pipelines.result)
    getProjectsMock.mockResolvedValue(MockCodeAnalysisProjects.result)
    getCollectorsMock.mockResolvedValue(MockCollectors.result)
  })

  afterEach(() => {
    getTicketBoardsMock.mockReset()
    getRepositoriesMock.mockReset()
    getPipelinesMock.mockReset()
    getProjectsMock.mockReset()
    getCollectorsMock.mockReset()
  })

  it('should get collector targets data', async () => {
    renderHook(() => useCollectorTargets(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <APIContext.Provider
          value={{
            teamList: MockTeams.result,
            valueStreamList: MockValueStreams.result,
            organizationList: MockOrganizations.result,
            teamViews: MockTeamViews.result,
            currentUser: adminUser,
            collectors: MockCollectors.result,
            allUsers: allMockUsers.result,
            featureFlags: { FEATURE_COLLECTOR_CONFIGURATION: true },
          }}
        >
          <ClientWrapper>{children}</ClientWrapper>
        </APIContext.Provider>
      ),
    })

    await waitFor(() => {
      expect(getTicketBoardsMock).toHaveBeenCalledTimes(1)
      expect(getRepositoriesMock).toHaveBeenCalledTimes(1)
      expect(getPipelinesMock).toHaveBeenCalledTimes(1)
      expect(getProjectsMock).toHaveBeenCalledTimes(1)
    })
  })
})

describe('useMetrics', () => {
  const useQuerySpy = jest.spyOn(reactQueryModule, 'useQuery')

  afterEach(() => {
    useQuerySpy.mockReset()
  })

  describe('loading state', () => {
    it('should report with loading if query is idle', () => {
      useQuerySpy.mockReturnValue({
        data: MockMetrics.result,
        isIdle: true,
        isLoading: false,
        isRefetching: false,
        isLoadingError: false,
        isRefetchError: false,
        error: undefined,
      } as unknown as QueryObserverSuccessResult<TeamMetrics[]>)

      const { result } = renderHook(
        () =>
          useMetrics('ORGANIZATION', getOrganizationMetrics, mockOrganization),
        {
          wrapper: ClientWrapper,
        },
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should report with loading if query is loading', () => {
      useQuerySpy.mockReturnValue({
        data: MockMetrics.result,
        isIdle: false,
        isLoading: true,
        isRefetching: false,
        isLoadingError: false,
        isRefetchError: false,
        error: undefined,
      } as unknown as QueryObserverSuccessResult<TeamMetrics[]>)

      const { result } = renderHook(
        () =>
          useMetrics('ORGANIZATION', getOrganizationMetrics, mockOrganization),
        {
          wrapper: ClientWrapper,
        },
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should report with refetching is query is refetching', () => {
      useQuerySpy.mockReturnValue({
        data: MockMetrics.result,
        isIdle: false,
        isLoading: false,
        isRefetching: true,
        isLoadingError: false,
        isRefetchError: false,
        error: undefined,
      } as unknown as QueryObserverSuccessResult<TeamMetrics[]>)

      const { result } = renderHook(
        () =>
          useMetrics('ORGANIZATION', getOrganizationMetrics, mockOrganization),
        {
          wrapper: ClientWrapper,
        },
      )

      expect(result.current.isRefetching).toBe(true)
    })
  })

  describe('error state', () => {
    it('should report with error if something unexpected happens on fetch', async () => {
      useQuerySpy.mockReturnValue({
        data: MockMetrics.result,
        isIdle: false,
        isLoading: false,
        isRefetching: false,
        isLoadingError: true,
        isRefetchError: false,
        error: new Error('oops.'),
      } as unknown as QueryObserverSuccessResult<TeamMetrics[]>)

      const { result } = renderHook(
        () =>
          useMetrics('ORGANIZATION', getOrganizationMetrics, mockOrganization),
        {
          wrapper: ClientWrapper,
        },
      )

      expect(result.current.hasErrored).toBe(true)
    })

    it('should report with error if something unexpected happens on refetch', async () => {
      useQuerySpy.mockReturnValue({
        data: MockMetrics.result,
        isIdle: false,
        isLoading: false,
        isRefetching: false,
        isLoadingError: false,
        isRefetchError: true,
        error: new Error('oops.'),
      } as unknown as QueryObserverSuccessResult<TeamMetrics[]>)

      const { result } = renderHook(
        () =>
          useMetrics('ORGANIZATION', getOrganizationMetrics, mockOrganization),
        {
          wrapper: ClientWrapper,
        },
      )

      expect(result.current.hasErroredOnRefetch).toBe(true)
    })

    it('should report apiMetricsNotReady if error due to metrics not being ready', async () => {
      useQuerySpy.mockReturnValue({
        data: MockMetrics.result,
        isIdle: false,
        isLoading: false,
        isRefetching: false,
        isLoadingError: true,
        isRefetchError: false,
        error: new Error(METRICS_NOT_READY_ERROR),
      } as unknown as QueryObserverSuccessResult<TeamMetrics[]>)

      const { result } = renderHook(
        () =>
          useMetrics('ORGANIZATION', getOrganizationMetrics, mockOrganization),
        {
          wrapper: ClientWrapper,
        },
      )

      expect(result.current.hasErrored).toBe(false)
      expect(result.current.data.apiMetricsNotReady).toBe(true)
    })
  })

  describe('getting data', () => {
    beforeAll(() => {
      useQuerySpy.mockRestore()
    })

    it('should call the getMetrics function', async () => {
      getOrganizationMetricsMock.mockResolvedValue(MockMetrics.result)

      const { result } = renderHook(
        () =>
          useMetrics(
            'ORGANIZATION',
            getOrganizationMetricsMock,
            mockOrganization,
          ),
        {
          wrapper: ClientWrapper,
        },
      )

      await waitFor(() => {
        expect(getOrganizationMetricsMock).toHaveBeenCalledTimes(1)
        expect(result.current.data.apiMetrics).toEqual(MockMetrics.result)
      })
    })
  })
})

describe('useParamsBasedGroupEntities', () => {
  describe('useParamsBasedGroupEntities FEATURE_TEAM_VIEWS', () => {
    const featureTeamViewsHookWrapper = apiContextWrapper({
      featureFlags: { FEATURE_TEAM_VIEWS: true },
    })

    it('should return route not found if organizationName, valueStreamName, teamName, and teamViewName are specified but teamViewName could not be found', () => {
      useParamsMock.mockReturnValue({
        organizationName: mockOrganization.name,
        valueStreamName: mockValueStream.name,
        teamName: mockTeam.name,
        teamViewName: 'nonexistent',
      })

      const { result } = renderHook(() => useParamsBasedGroupEntities(), {
        wrapper: featureTeamViewsHookWrapper,
      })

      const {
        routeNotFound,
        organization: org,
        valueStream: vs,
        team: t,
        teamView: tv,
      } = result.current
      expect(routeNotFound).toBe(true)
      expect(org).toEqual(mockOrganization)
      expect(vs).toEqual(mockValueStream)
      expect(t).toEqual(mockTeam)
      expect(tv).toBeUndefined()
    })

    it('should return with team view if route not found is false', () => {
      useParamsMock.mockReturnValue({
        organizationName: mockOrganization.name,
        valueStreamName: mockValueStream.name,
        teamName: mockTeam.name,
        teamViewName: mockTeamView.name,
      })

      const { result } = renderHook(() => useParamsBasedGroupEntities(), {
        wrapper: featureTeamViewsHookWrapper,
      })

      const {
        routeNotFound,
        organization: org,
        valueStream: vs,
        team: t,
        teamView: tv,
      } = result.current
      expect(routeNotFound).toBe(false)
      expect(org).toEqual(mockOrganization)
      expect(vs).toEqual(mockValueStream)
      expect(t).toEqual(mockTeam)
      expect(tv).toEqual(mockTeamView)
    })

    it('should return with the entity from parameters using base implementation if team view name is not specified', () => {
      useParamsMock.mockReturnValue({
        organizationName: mockOrganization.name,
        valueStreamName: mockValueStream.name,
        teamName: mockTeam.name,
      })

      const { result } = renderHook(() => useParamsBasedGroupEntities(), {
        wrapper: featureTeamViewsHookWrapper,
      })

      const {
        routeNotFound,
        organization: org,
        valueStream: vs,
        team: t,
      } = result.current
      expect(routeNotFound).toBe(false)
      expect(org).toEqual(mockOrganization)
      expect(vs).toEqual(mockValueStream)
      expect(t).toEqual(mockTeam)
    })
  })

  it('should return route not found if organizationName, valueStreamName, teamName, and teamViewName are specified since teamView feature is not enabled yet', () => {
    useParamsMock.mockReturnValue({
      organizationName: mockOrganization.name,
      valueStreamName: mockValueStream.name,
      teamName: mockTeam.name,
      teamViewName: mockTeamView.name,
    })

    const { result } = renderHook(() => useParamsBasedGroupEntities(), {
      wrapper: apiContextWrapper({}),
    })

    const { routeNotFound } = result.current
    expect(routeNotFound).toBe(true)
  })

  it('should return route not found if organizationName, valueStreamName, and teamName are specified but team could not be found', () => {
    useParamsMock.mockReturnValue({
      organizationName: mockOrganization.name,
      valueStreamName: mockValueStream.name,
      teamName: 'nonexistant',
    })

    const { result } = renderHook(() => useParamsBasedGroupEntities(), {
      wrapper: apiContextWrapper({}),
    })

    const {
      routeNotFound,
      organization: org,
      valueStream: vs,
      team: t,
    } = result.current
    expect(routeNotFound).toBe(true)
    expect(org).toEqual(mockOrganization)
    expect(vs).toEqual(mockValueStream)
    expect(t).toBeUndefined()
  })

  it('should return route not found if organizationName and valueStreamName are specified, but valueStream Could not be found', () => {
    useParamsMock.mockReturnValue({
      organizationName: mockOrganization.name,
      valueStreamName: 'nonexistant',
    })

    const { result } = renderHook(() => useParamsBasedGroupEntities(), {
      wrapper: apiContextWrapper({}),
    })

    const {
      routeNotFound,
      organization: org,
      valueStream: vs,
      team: t,
    } = result.current
    expect(routeNotFound).toBe(true)
    expect(org).toEqual(mockOrganization)
    expect(vs).toBeUndefined()
    expect(t).toBeUndefined()
  })

  it('should return route not found if organizationName is specified, but organization could not be found', () => {
    useParamsMock.mockReturnValue({
      organizationName: 'nonexistant',
    })

    const { result } = renderHook(() => useParamsBasedGroupEntities(), {
      wrapper: apiContextWrapper({}),
    })

    const {
      routeNotFound,
      organization: org,
      valueStream: vs,
      team: t,
    } = result.current
    expect(routeNotFound).toBe(true)
    expect(org).toBeUndefined()
    expect(vs).toBeUndefined()
    expect(t).toBeUndefined()
  })

  it('should return with all parameters if route not found is false', () => {
    useParamsMock.mockReturnValue({
      organizationName: mockOrganization.name,
      valueStreamName: mockValueStream.name,
      teamName: mockTeam.name,
    })

    const { result } = renderHook(() => useParamsBasedGroupEntities(), {
      wrapper: apiContextWrapper({}),
    })

    const {
      routeNotFound,
      organization: org,
      valueStream: vs,
      team: t,
    } = result.current
    expect(routeNotFound).toBe(false)
    expect(org).toEqual(mockOrganization)
    expect(vs).toEqual(mockValueStream)
    expect(t).toEqual(mockTeam)
  })

  it('otherwise returns route not found since there are no other parameters', () => {
    useParamsMock.mockReturnValue({})

    const { result } = renderHook(() => useParamsBasedGroupEntities(), {
      wrapper: apiContextWrapper({}),
    })

    const {
      routeNotFound,
      organization: org,
      valueStream: vs,
      team: t,
    } = result.current
    expect(routeNotFound).toBe(true)
    expect(org).toBeUndefined()
    expect(vs).toBeUndefined()
    expect(t).toBeUndefined()
  })
})

describe('useGroupEntityRouteParams', () => {
  it('getPathWithParams should return /404 if params is not valid', () => {
    const { result } = renderHook(() => useGroupEntityRouteParams(), {
      wrapper: apiContextWrapper({}),
    })

    const { getPathWithParams, getOrgParamsForOrgId } = result.current
    expect(
      getPathWithParams(
        params => `/${params.organizationName}`,
        getOrgParamsForOrgId(null),
      ),
    ).toEqual('/404')
  })

  it('getPathWithParams should return the path if params is valid', () => {
    const { result } = renderHook(() => useGroupEntityRouteParams(), {
      wrapper: apiContextWrapper({}),
    })

    const { getPathWithParams, getOrgParamsForOrgId } = result.current
    expect(
      getPathWithParams(
        params => `/${params.organizationName}`,
        getOrgParamsForOrgId(mockOrganization.id),
      ),
    ).toEqual(`/${mockOrganization.name}`)
  })

  it('getOrgParamsForOrgId should return org params', () => {
    const { result } = renderHook(() => useGroupEntityRouteParams(), {
      wrapper: apiContextWrapper({}),
    })

    const { getOrgParamsForOrgId } = result.current
    expect(getOrgParamsForOrgId(mockOrganization.id)).toEqual(
      expect.objectContaining({
        organizationName: mockOrganization.name,
      }),
    )
  })

  it('getVSParamsForVSId should return org params', () => {
    const { result } = renderHook(() => useGroupEntityRouteParams(), {
      wrapper: apiContextWrapper({}),
    })

    const { getVSParamsForVSId } = result.current
    expect(getVSParamsForVSId(mockValueStream.id)).toEqual(
      expect.objectContaining({
        organizationName: mockOrganization.name,
        valueStreamName: mockValueStream.name,
      }),
    )
  })

  it('getTeamParamsForTeamId should return org params', () => {
    const { result } = renderHook(() => useGroupEntityRouteParams(), {
      wrapper: apiContextWrapper({}),
    })

    const { getTeamParamsForTeamId } = result.current
    expect(getTeamParamsForTeamId(mockTeam.id)).toEqual(
      expect.objectContaining({
        organizationName: mockOrganization.name,
        valueStreamName: mockValueStream.name,
        teamName: mockTeam.name,
      }),
    )
  })
})

describe('useCurrentUserPermissions', () => {
  describe('Basic Permissions', () => {
    it('should return true user is org leadership', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: leadershipUser }),
      })

      expect(result.current.isOrgLeadership).toBe(true)
    })

    it('should return true if user is global admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })

      expect(result.current.isGlobalAdmin).toBe(true)
    })

    it('should return true if user is value stream admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: valueStreamAdmin }),
      })

      expect(result.current.isVSAdmin).toBe(true)
    })

    it('should return true if user is team admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: teamAdmin }),
      })

      expect(result.current.isTeamAdmin).toBe(true)
    })
  })

  describe('Organization Permissions', () => {
    it('canViewOrganizationCostMetrics should return true if user is organization leader and canUpdateOrganization', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: leadershipAndOrgAdminUser }),
      })
      const { canViewOrganizationCostMetrics } = result.current
      expect(canViewOrganizationCostMetrics(mockOrganization.id)).toBe(true)
    })

    it('canViewOrganizationMetrics should return true if user is global admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })
      const { canViewOrganizationMetrics } = result.current
      expect(canViewOrganizationMetrics(mockOrganization.id)).toBe(true)
    })

    it('canViewOrganizationMetrics should return true if user is organization admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: organizationAdmin }),
      })
      const { canViewOrganizationMetrics } = result.current
      expect(canViewOrganizationMetrics(mockOrganization.id)).toBe(true)
    })

    it('canCreateOrganization should return true if user is global admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })
      const { canCreateOrganization } = result.current
      expect(canCreateOrganization()).toBe(true)
    })

    it('canUpdateOrganization/canDeleteOrganization should return true if user is global admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })
      const { canUpdateOrganization, canDeleteOrganization } = result.current
      expect(canUpdateOrganization(mockOrganization.id)).toBe(true)
      expect(canDeleteOrganization(mockOrganization.id)).toBe(true)
    })

    it('canUpdateOrganization/canDeleteOrganization should return true if user is org admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: organizationAdmin }),
      })
      const { canUpdateOrganization, canDeleteOrganization } = result.current
      expect(canUpdateOrganization(mockOrganization.id)).toBe(true)
      expect(canDeleteOrganization(mockOrganization.id)).toBe(true)
    })
  })

  describe('Value Stream Permissions', () => {
    it('canViewValueStreamCostMetrics should return true if user is organization leader and canUpdateValueStream', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: leadershipAndOrgAdminUser }),
      })
      const { canViewValueStreamCostMetrics } = result.current
      expect(canViewValueStreamCostMetrics(mockValueStream.id)).toBe(true)
    })

    it('canViewValueStreamMetrics should return true if user is global admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })
      const { canViewValueStreamMetrics } = result.current
      expect(canViewValueStreamMetrics(mockValueStream.id)).toBe(true)
    })

    it('canViewValueStreamMetrics should return true if user is organization admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: organizationAdmin }),
      })
      const { canViewValueStreamMetrics } = result.current
      expect(canViewValueStreamMetrics(mockValueStream.id)).toBe(true)
    })

    it('canViewValueStreamMetrics should return true if user is valuestream admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: valueStreamAdmin }),
      })
      const { canViewValueStreamMetrics } = result.current
      expect(canViewValueStreamMetrics(mockValueStream.id)).toBe(true)
    })

    it('canCreateValueStream should return true if user is global admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })
      const { canCreateValueStream } = result.current
      expect(canCreateValueStream()).toBe(true)
    })

    it('canCreateValueStream should return true if user is organization admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: organizationAdmin }),
      })
      const { canCreateValueStream } = result.current
      expect(canCreateValueStream()).toBe(true)
    })

    it(`canUpdateValueStream/canDeleteValueStream
		 should return true if user is global admin`, () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })
      const { canUpdateValueStream, canDeleteValueStream } = result.current
      expect(canUpdateValueStream(mockValueStream.id)).toBe(true)
      expect(canDeleteValueStream(mockValueStream.id)).toBe(true)
    })

    it(`canUpdateValueStream/canDeleteValueStream should
		return true if user is organization admin`, () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: organizationAdmin }),
      })
      const { canUpdateValueStream, canDeleteValueStream } = result.current
      expect(canUpdateValueStream(mockValueStream.id)).toBe(true)
      expect(canDeleteValueStream(mockValueStream.id)).toBe(true)
    })

    it(`canUpdateValueStream/canDeleteValueStream should
		return true if user is valuestream admin`, () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: valueStreamAdmin }),
      })
      const { canUpdateValueStream, canDeleteValueStream } = result.current
      expect(canUpdateValueStream(mockValueStream.id)).toBe(true)
      expect(canDeleteValueStream(mockValueStream.id)).toBe(true)
    })
  })

  describe('Team Permissions', () => {
    it('canViewTeamCostMetrics should return true if user is organization leader and canUpdateTeam', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: leadershipAndOrgAdminUser }),
      })
      const { canViewTeamCostMetrics } = result.current
      expect(canViewTeamCostMetrics(mockTeam.id)).toBe(true)
    })

    it('canViewTeamMetrics should return true if user is global admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })
      const { canViewTeamMetrics } = result.current
      expect(canViewTeamMetrics(mockTeam.id)).toBe(true)
    })

    it('canViewTeamMetrics should return true if user is organization admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: organizationAdmin }),
      })
      const { canViewTeamMetrics } = result.current
      expect(canViewTeamMetrics(mockTeam.id)).toBe(true)
    })

    it('canViewTeamMetrics should return true if user is valuestream admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: valueStreamAdmin }),
      })
      const { canViewTeamMetrics } = result.current
      expect(canViewTeamMetrics(mockTeam.id)).toBe(true)
    })

    it('canViewTeamMetrics should return true if user is team admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: teamAdmin }),
      })
      const { canViewTeamMetrics } = result.current
      expect(canViewTeamMetrics(mockTeam.id)).toBe(true)
    })

    it('canCreateTeam should return true if user is global admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })
      const { canCreateTeam } = result.current
      expect(canCreateTeam()).toBe(true)
    })

    it('canCreateTeam should return true if user is organization admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: organizationAdmin }),
      })
      const { canCreateTeam } = result.current
      expect(canCreateTeam()).toBe(true)
    })

    it('canCreateTeam should return true if user is valuestream admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: valueStreamAdmin }),
      })
      const { canCreateTeam } = result.current
      expect(canCreateTeam()).toBe(true)
    })

    it('canUpdateTeam/canDeleteTeam should return true if user is global admin', () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: adminUser }),
      })
      const { canUpdateTeam, canDeleteTeam } = result.current
      expect(canUpdateTeam(mockTeam.id)).toBe(true)
      expect(canDeleteTeam(mockTeam.id)).toBe(true)
    })

    it(`canUpdateTeam/canDeleteTeam should return
			true if user is organization admin`, () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: organizationAdmin }),
      })
      const { canUpdateTeam, canDeleteTeam } = result.current
      expect(canUpdateTeam(mockTeam.id)).toBe(true)
      expect(canDeleteTeam(mockTeam.id)).toBe(true)
    })

    it(`canUpdateTeam/canDeleteTeam should return true
		if user is valuestream admin`, () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: valueStreamAdmin }),
      })
      const { canUpdateTeam, canDeleteTeam } = result.current
      expect(canUpdateTeam(mockTeam.id)).toBe(true)
      expect(canDeleteTeam(mockTeam.id)).toBe(true)
    })

    it(`canUpdateTeam/canDeleteTeam should return true
		if user is team admin`, () => {
      const { result } = renderHook(() => useCurrentUserPermissions(), {
        wrapper: apiContextWrapper({ currentUser: teamAdmin }),
      })
      const { canUpdateTeam, canDeleteTeam } = result.current
      expect(canUpdateTeam(mockTeam.id)).toBe(true)
      expect(canDeleteTeam(mockTeam.id)).toBe(true)
    })
  })
})

describe('getImplementationFromFeatureFlags', () => {
  it('should call default if none of the feature flags are true', () => {
    const defaultImplementation = jest.fn()
    const implementation = getImplementationFromFeatureFlags(
      {},
      {
        FEATURE_FOO_BAR: jest.fn(),
        default: defaultImplementation,
      },
    )

    implementation()
    expect(defaultImplementation).toHaveBeenCalledTimes(1)
  })

  it('should call the flagged implementation if the feature flag is true', () => {
    const fooBarImplementation = jest.fn()
    const implementation = getImplementationFromFeatureFlags(
      { FEATURE_FOO_BAR: true },
      {
        FEATURE_FOO_BAR: fooBarImplementation,
        default: jest.fn(),
      },
    )

    implementation()
    expect(fooBarImplementation).toHaveBeenCalledTimes(1)
  })
})
