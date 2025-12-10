import { useQueryClient, setLogger, useQuery, Query } from 'react-query'
import reactQueryConfig from 'reactQueryConfig'
import { useParams } from 'react-router-dom'
import { createContext, useContext, useMemo } from 'react'
import {
  User,
  Team,
  ValueStream,
  Organization,
  TeamView,
  FeatureFlags,
  CollectorTarget,
  Collector,
  getFeatureFlags,
  getOrganizations,
  getPipelines,
  getRepositories,
  getTeams,
  getTeamViews,
  getTicketBoards,
  getUsers,
  getValueStreams,
  getCollectors,
  METRICS_NOT_READY_ERROR,
  TeamMetrics,
  getProjects,
} from './api'
import { useAPIDataType } from './HigherOrderComponents'

/**
 * ignoring errors from react-query
 * since we handle them
 */
setLogger(reactQueryConfig.LOGGER)

export const useRequiredAPIData: useAPIDataType<{
  currentUser: User
  allUsers: User[]
  teamList: Team[]
  valueStreamList: ValueStream[]
  organizationList: Organization[]
  featureFlags: FeatureFlags
  teamViews?: TeamView[]
  collectors: Collector[]
}> = () => {
  const { data, isLoading, isError } = useQuery(
    [reactQueryConfig.GROUP_ENTITIES],
    async () => {
      const featureFlags = await getFeatureFlags()
      const requiredData = await Promise.all([
        getUsers(),
        getTeams(),
        getValueStreams(),
        getOrganizations(),
        featureFlags,
      ])

      const [
        { currentUser, allUsers },
        teamList,
        valueStreamList,
        organizationList,
      ] = requiredData

      let teamViews
      let collectors
      if (
        'FEATURE_TEAM_VIEWS' in featureFlags &&
        featureFlags.FEATURE_TEAM_VIEWS
      ) {
        teamViews = await getTeamViews()
      }
      if (
        'FEATURE_COLLECTOR_CONFIGURATION' in featureFlags &&
        featureFlags.FEATURE_COLLECTOR_CONFIGURATION
      ) {
        collectors = await getCollectors()
      }

      return {
        currentUser,
        allUsers,
        teamList,
        valueStreamList,
        organizationList,
        featureFlags,
        teamViews,
        collectors,
      }
    },
    {
      ...reactQueryConfig.USE_QUERY_CONFIG,
      // do not refetch this data, this will be manually updated on user change
      refetchInterval: false,
    },
  )

  return {
    data,
    isLoading,
    isRefetching: false,
    hasErrored: isError,
    hasErroredOnRefetch: false,
  }
}

export const APIContext = createContext<{
  currentUser: User
  allUsers: User[]
  teamList: Team[]
  valueStreamList: ValueStream[]
  organizationList: Organization[]
  featureFlags: FeatureFlags
  teamViews?: TeamView[]
  collectors: Collector[]
}>({
  currentUser: null,
  allUsers: [],
  teamList: [],
  valueStreamList: [],
  organizationList: [],
  featureFlags: {},
  teamViews: [],
  collectors: [],
})

export const useAPIContext = () => useContext(APIContext)

export const getImplementationFromFeatureFlags = <Args, Ret>(
  featureFlags: FeatureFlags,
  implementationsTable: {
    [flagName: string]: (args?: Args) => Ret
    default: (args?: Args) => Ret
  },
) => {
  const implementations = Object.entries(implementationsTable)
  for (const [flagName, implementation] of implementations) {
    if (featureFlags[flagName]) {
      return implementation
    }
  }
  return implementationsTable.default
}

export type OrganizationDetails = {
  currentUserIsAdmin: boolean
  organizationName: string
}

export type ValueStreamDetails = {
  currentUserIsAdmin: boolean
  organizationId: number
  organizationName: string
  valueStreamName: string
}

export type TeamDetails = {
  currentUserIsAdmin: boolean
  organizationId: number
  valueStreamId: number
  organizationName: string
  valueStreamName: string
  teamName: string
}

export type GroupEntityDetails =
  | TeamDetails
  | ValueStreamDetails
  | OrganizationDetails

const useGroupEntityDetails = () => {
  const { organizationList, currentUser } = useAPIContext()

  const result = useMemo(() => {
    const computationResult: {
      isOrgAdmin: boolean
      isVSAdmin: boolean
      isTeamAdmin: boolean
      orgIdsToDetails: { [orgId: number]: OrganizationDetails }
      vsIdsToDetails: { [vsId: number]: ValueStreamDetails }
      teamIdsToDetails: { [teamId: number]: TeamDetails }
    } = {
      isOrgAdmin: false,
      isVSAdmin: false,
      isTeamAdmin: false,
      orgIdsToDetails: {},
      vsIdsToDetails: {},
      teamIdsToDetails: {},
    }

    const userIsAdminOfEntity = (entity: Team | Organization | ValueStream) =>
      entity.users.some(user => user.id === currentUser.id)

    for (const org of organizationList) {
      const userIsOrgAdmin = userIsAdminOfEntity(org)
      computationResult.isOrgAdmin =
        computationResult.isOrgAdmin || userIsOrgAdmin
      computationResult.orgIdsToDetails[org.id] = {
        currentUserIsAdmin: userIsOrgAdmin,
        organizationName: org.name,
      }

      for (const vs of org.valueStreams) {
        const userIsVSAdmin = userIsAdminOfEntity(vs)
        computationResult.isVSAdmin =
          computationResult.isVSAdmin || userIsVSAdmin
        computationResult.vsIdsToDetails[vs.id] = {
          currentUserIsAdmin: userIsVSAdmin,
          organizationId: org.id,
          organizationName: org.name,
          valueStreamName: vs.name,
        }

        for (const team of vs.teams) {
          const userIsTeamAdmin = userIsAdminOfEntity(team)
          computationResult.isTeamAdmin =
            computationResult.isTeamAdmin || userIsTeamAdmin
          computationResult.teamIdsToDetails[team.id] = {
            currentUserIsAdmin: userIsTeamAdmin,
            organizationId: org.id,
            valueStreamId: vs.id,
            organizationName: org.name,
            valueStreamName: vs.name,
            teamName: team.name,
          }
        }
      }
    }

    return computationResult
  }, [organizationList, currentUser])

  return {
    currentUserIsOrgAdmin: result.isOrgAdmin,
    currentUserIsVSAdmin: result.isVSAdmin,
    currentUserIsTeamAdmin: result.isTeamAdmin,
    orgIdsToDetails: result.orgIdsToDetails,
    vsIdsToDetails: result.vsIdsToDetails,
    teamIdsToDetails: result.teamIdsToDetails,
  }
}

export const useGroupEntityRouteParams = () => {
  const { orgIdsToDetails, vsIdsToDetails, teamIdsToDetails } =
    useGroupEntityDetails()

  return {
    getPathWithParams: (
      pathMaker: (params: GroupEntityDetails) => string,
      params?: GroupEntityDetails,
    ) => (params ? pathMaker(params) : '/404'),
    getOrgParamsForOrgId: (orgId: number) => orgIdsToDetails[orgId],
    getVSParamsForVSId: (vsId: number) => vsIdsToDetails[vsId],
    getTeamParamsForTeamId: (teamId: number) => teamIdsToDetails[teamId],
  }
}

type ParamsBasedGroupEntities =
  | {
      routeNotFound: true
      organization?: Organization
      valueStream?: ValueStream
      team?: Team
      teamView?: TeamView
    }
  | {
      routeNotFound: boolean
      organization: Organization
      valueStream?: ValueStream
      team?: Team
      teamView?: TeamView
    }
  | {
      routeNotFound: boolean
      organization: Organization
      valueStream: ValueStream
      team?: Team
      teamView?: TeamView
    }
  | {
      routeNotFound: boolean
      organization: Organization
      valueStream: ValueStream
      team: Team
      teamView?: TeamView
    }
  | {
      routeNotFound: boolean
      organization: Organization
      valueStream: ValueStream
      team: Team
      teamView: TeamView
    }

export const useParamsBasedGroupEntities = (): ParamsBasedGroupEntities => {
  const { organizationList, teamViews, featureFlags } = useAPIContext()
  const { organizationName, valueStreamName, teamName, teamViewName } =
    useParams()

  const baseImplementation = () => {
    const organization = organizationList.find(o => o.name === organizationName)
    const valueStream = organization?.valueStreams.find(
      v => v.name === valueStreamName,
    )
    const team = valueStream?.teams.find(t => t.name === teamName)

    if (!!organizationName && !!valueStreamName && !!teamName) {
      return {
        routeNotFound: !team,
        organization,
        valueStream,
        team,
      }
    }

    if (!!organizationName && !!valueStreamName) {
      return {
        routeNotFound: !valueStream,
        organization,
        valueStream,
        team,
      }
    }

    if (organizationName) {
      return {
        routeNotFound: !organization,
        organization,
        valueStream,
        team,
      }
    }

    return {
      routeNotFound: true,
      organization,
      valueStream,
      team,
    }
  }

  return getImplementationFromFeatureFlags(featureFlags, {
    FEATURE_TEAM_VIEWS: () => {
      const { routeNotFound, organization, valueStream, team } =
        baseImplementation()
      if (!routeNotFound && !!teamViewName) {
        const teamView = teamViews.find(t => t.name === teamViewName)
        return {
          routeNotFound: !teamView,
          organization,
          valueStream,
          team,
          teamView,
        }
      }
      return {
        routeNotFound,
        organization,
        valueStream,
        team,
        teamView: undefined,
      }
    },
    default: () => {
      const { routeNotFound, organization, valueStream, team } =
        baseImplementation()
      if (teamViewName) {
        return {
          routeNotFound: true,
          organization,
          valueStream,
          team,
          teamView: undefined,
        }
      }
      return {
        routeNotFound,
        organization,
        valueStream,
        team,
        teamView: undefined,
      }
    },
  })()
}

export const useCurrentUserPermissions = () => {
  const { currentUser } = useAPIContext()
  const {
    currentUserIsOrgAdmin,
    currentUserIsVSAdmin,
    currentUserIsTeamAdmin,
    orgIdsToDetails,
    vsIdsToDetails,
    teamIdsToDetails,
  } = useGroupEntityDetails()

  const isOrgAdminForOrg = (orgId: number) =>
    orgId in orgIdsToDetails && orgIdsToDetails[orgId].currentUserIsAdmin
  const isVSAdminForVS = (vsId: number) =>
    vsId in vsIdsToDetails && vsIdsToDetails[vsId].currentUserIsAdmin
  const isTeamAdminForTeam = (teamId: number) =>
    teamId in teamIdsToDetails && teamIdsToDetails[teamId].currentUserIsAdmin

  const canUpdateOrganization = (orgId: number) =>
    currentUser.isAdmin || isOrgAdminForOrg(orgId)

  const canUpdateValueStream = (vsId: number) => {
    const details = vsIdsToDetails[vsId]
    return (
      currentUser.isAdmin ||
      isVSAdminForVS(vsId) ||
      isOrgAdminForOrg(details?.organizationId)
    )
  }

  const canUpdateTeam = (teamId: number) => {
    const details = teamIdsToDetails[teamId]
    return (
      currentUser.isAdmin ||
      isTeamAdminForTeam(teamId) ||
      isVSAdminForVS(details?.valueStreamId) ||
      isOrgAdminForOrg(details?.organizationId)
    )
  }

  return {
    isOrgLeadership: currentUser.isOrgLeadership,
    isGlobalAdmin: currentUser.isAdmin,
    isOrgAdmin: currentUserIsOrgAdmin,
    isVSAdmin: currentUserIsVSAdmin,
    isTeamAdmin: currentUserIsTeamAdmin,
    canCreateOrganization: () => currentUser.isAdmin,
    canUpdateOrganization,
    canDeleteOrganization: canUpdateOrganization,
    canViewOrganizationMetrics: canUpdateOrganization,
    canViewOrganizationCostMetrics: (orgId: number) =>
      currentUser.isOrgLeadership && canUpdateOrganization(orgId),
    canCreateValueStream: () => currentUser.isAdmin || currentUserIsOrgAdmin,
    canUpdateValueStream,
    canDeleteValueStream: canUpdateValueStream,
    canViewValueStreamMetrics: canUpdateValueStream,
    canViewValueStreamCostMetrics: (vsId: number) =>
      currentUser.isOrgLeadership && canUpdateValueStream(vsId),
    canCreateTeam: () =>
      currentUser.isAdmin || currentUserIsOrgAdmin || currentUserIsVSAdmin,
    canUpdateTeam,
    canDeleteTeam: canUpdateTeam,
    canViewTeamMetrics: canUpdateTeam,
    canViewTeamCostMetrics: (teamId: number) =>
      currentUser.isOrgLeadership && canUpdateTeam(teamId),
  }
}

export const useCollectorTargets: useAPIDataType<{
  ticketBoards: CollectorTarget[]
  repositories: CollectorTarget[]
  pipelines: CollectorTarget[]
  projects: CollectorTarget[]
}> = () => {
  const { data, isLoading, isError } = useQuery(
    [reactQueryConfig.COLLECTOR_TARGETS],
    async () => {
      const [ticketBoards, repositories, pipelines, projects] =
        await Promise.all([
          getTicketBoards(),
          getRepositories(),
          getPipelines(),
          getProjects(),
        ])
      return {
        ticketBoards,
        repositories,
        pipelines,
        projects,
      }
    },
    {
      ...reactQueryConfig.USE_QUERY_CONFIG,
      // do not refetch this data, this will be manually updated on user change
      refetchInterval: false,
      // don't refetch on failure
      retry: 0,
      // avoid refetching when a new component uses this hook (use stored cache to avoid refetching)
      refetchOnMount: false,
    },
  )

  return {
    data,
    isLoading,
    isRefetching: false,
    hasErrored: isError,
    hasErroredOnRefetch: false,
  }
}

export const useMetrics = <GroupEntity extends { id: number }>(
  groupEntityType: string,
  getMetrics: (groupEntity: GroupEntity) => Promise<TeamMetrics[]>,
  groupEntity?: GroupEntity,
) => {
  const queryClient = useQueryClient()

  const removeUnusedCache = () =>
    queryClient.removeQueries({
      predicate: (query: Query<unknown, unknown, unknown, string[]>) => {
        const [metricsKey, metricsId] = query.queryKey
        return (
          metricsKey === reactQueryConfig.METRICS &&
          !!groupEntity &&
          `${groupEntityType}-${groupEntity.id}` !== metricsId
        )
      },
    })

  removeUnusedCache()

  const {
    data: apiMetrics,
    isIdle,
    isLoading,
    isRefetching,
    isLoadingError,
    isRefetchError,
    error,
  } = useQuery(
    [reactQueryConfig.METRICS, `${groupEntityType}-${groupEntity.id}`],
    () => getMetrics(groupEntity),
    {
      ...reactQueryConfig.USE_QUERY_CONFIG,
      // don't refetch on failure
      retry: 0,
      // avoid refetching when a new component uses this hook (use stored cache)
      refetchOnMount: false,
      // only enable this query if groupEntity is not null or undefined
      enabled: !!groupEntity,
    },
  )
  const apiMetricsNotReady =
    !!error &&
    error instanceof Error &&
    error.message === METRICS_NOT_READY_ERROR

  return {
    data: {
      apiMetrics,
      apiMetricsNotReady,
    },
    hasErrored: !apiMetricsNotReady && isLoadingError,
    isLoading: isIdle || isLoading,
    isRefetching,
    hasErroredOnRefetch: !apiMetricsNotReady && isRefetchError,
  }
}

export const useOnUserChangeAPIData = () => {
  const queryClient = useQueryClient()
  return async () => {
    // refetch data from the current use query
    await queryClient.invalidateQueries(reactQueryConfig.GROUP_ENTITIES)
    // remove the metrics cache, so that it will be refetched once teams provider updates
    // for all queries that begin with reactQueryConfig.METRICS
    queryClient.removeQueries({ queryKey: reactQueryConfig.METRICS })
    // remove collector targets cache, so that it will be refetched once user visits /admin
    queryClient.removeQueries(reactQueryConfig.COLLECTOR_TARGETS)
  }
}
