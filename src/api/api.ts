import axios, { AxiosError, AxiosResponse } from 'axios'
import config from 'globalConfig'

enum HTTPMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type Options = {
  method: HTTPMethods
  headers: {
    [headerKey: string]: string
  }
  body?: unknown
}

type FetchHelpersParameters = {
  url: string
  acceptStatus: number
  options: Options
}

async function fetchHelper<T>({
  url,
  acceptStatus,
  options,
}: FetchHelpersParameters): Promise<AxiosResponse<T>> {
  return axios({
    url,
    method: options.method,
    headers: options.headers,
    data: options.body,
    validateStatus: status => status === acceptStatus,
  })
}

async function fetchJSON<T>({
  url,
  acceptStatus,
  options,
}: FetchHelpersParameters): Promise<T> {
  const { data } = await fetchHelper<T>({ url, acceptStatus, options })
  return data
}

async function fetchPaginatedJSON<T>({
  url,
  acceptStatus,
  options,
}: FetchHelpersParameters): Promise<T[]> {
  let nextUrl = url
  const data: T[] = []
  while (nextUrl !== 'None') {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetchHelper<{ result: T[] }>({
      url: nextUrl,
      acceptStatus,
      options,
    })
    data.push(...response.data.result)
    const [_, nextPath] = response.headers['x-next-page'].split('/api')
    nextUrl = nextPath ? `/api${nextPath}` : 'None'
  }
  return data
}

export type TeamCreateUpdatePayload = {
  id?: number
  name: string
  valueStreamId: number
  teamSize: number
  collectorTargetIds: number[]
  userIds?: number[]
}

export enum BuildStatus {
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  PASSED_WITH_WARNINGS = 'PASSED_WITH_WARNINGS',
}

/**
 * The user from the API data
 */
export type User = {
  id: number
  /**
   * whether user is global
   * admin
   */
  isAdmin: boolean
  /**
   * whether the user is
   * an organization leadreship
   * (can see/update cost data)
   */
  isOrgLeadership: boolean
  username: string
}

/**
 * the collector target
 * which users can select
 * to collect data from
 */
export type CollectorTarget = {
  id: number
  /**
   * team that owns
   * this collector target,
   * null if it is not owned
   * by anyone
   */
  teamId?: number
  name: string
  url: string
}

/**
 * Collector
 */
export type Collector = {
  collectorIntervalSeconds: number
  collectorTargetsIntrvlSecs: number
  createdAt: string
  id: number
  lookBackDays: number
  maxRequestsPerMinute: number
  name: string
  target: string
  updatedAt: string
}

/**
 * the Team Definition
 */
export type Team = {
  id: number
  name: string
  teamSize: number
  /**
   * collector target ids
   * representing the collector
   * targets owned by this team
   */
  collectorTargets: number[]
  valueStreamId: number
  /**
   * admins for this team
   */
  users: User[]
  isWorkflowOnly: boolean
}

/**
 * a Team View is just a
 * team in disguise; however, a
 * Team View does not aggreate in
 * metrics data like Team does.
 */
export type TeamView = {
  id: number
  name: string
  /**
   * collector target ids
   * representing the collector
   * targets owned by this team
   * view
   */
  collectorTargets: number[]
  /**
   * team owning this team view
   */
  viewOwnerId: number
  /**
   * whether the team view is workflow only
   */
  isWorkflowOnly: boolean
}

/**
 * the Valuestream definition
 */
export type ValueStream = {
  id: number
  name: string
  /**
   * organization that
   * owns this value stream
   */
  organizationId: number
  /**
   * the teams within this value stream
   */
  teams: Team[]
  /**
   * the admins for this value stream
   */
  users: User[]
}

/**
 * the Organization definition
 */
export type Organization = {
  id: number
  name: string
  /**
   * the value streams within this organization
   */
  valueStreams: ValueStream[]
  /**
   * the admins for this organization
   */
  users: User[]
}

export type PayRate = {
  email: string
  rate: number
}

export type FeatureFlags = {
  [flagName: string]: boolean
}

export type SystemConfig = {
  featureFlags: FeatureFlags
  version: string
  ssoEnabled: boolean
}

export type TeamMember = {
  endDate?: string // in ISO Format string
  member: {
    name: string
    username: string
  }
  startDate: string // in ISO Format string
}

/**
 * what a GroupEntity is
 */
export type GroupEntity = Organization | ValueStream | Team | TeamView

export type GitRequest = {
  title: string
  lastUpdated: string
  url: string
}

export type Branch = {
  name: string
  lastUpdated: string
  url: string
}

export type Build = {
  startTime: string
  endTime: string
  buildStatus: string
  buildUrl: string
}

export enum ProjectIssueType {
  MAINTAINABILITY = 'MAINTAINABILITY',
  POSSIBLE_BUG = 'POSSIBLE_BUG',
  VULNERABILITY = 'VULNERABILITY',
  UNKNOWN = 'UNKNOWN',
}

export enum ProjectIssueSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export type ProjectIssue = {
  severity: ProjectIssueSeverity
  issueUrl: string
  type: ProjectIssueType
}

export type TeamMetrics = {
  id: number
  name: string
  teamSize: number
  wipTickets: number
  isView: boolean
  organizationName: string
  organizationId: number
  valueStreamName: string
  valueStreamId: number
  staleGitRequests: GitRequest[]
  staleBranches: Branch[]
  latestBuilds: Build[]
  activeIssues: ProjectIssue[]
  historicalData: {
    week: string
    // effort chart data
    daysSpentOnFeatures: number
    daysSpentOnDefects: number
    daysSpentOnMaintenance: number
    daysSpentOnUnplanned: number
    // effort cost charts data
    amountSpentOnFeatures: number
    amountSpentOnDefects: number
    amountSpentOnMaintenance: number
    amountSpentOnUnplanned: number
    // ci activity data
    totalInternalIntegrations: number
    totalDirectIntegrations: number
    totalExternalIntegrations: number
    averageTeamSize: number
    // code review trend data
    averageAgeInDaysCodeReviewWasOpen: number
    // cumulative flow related data
    totalTicketsInBacklog: number
    totalTicketsInProgress: number
    // lead time graph data
    ticketLeadTimes: { days: number }[]
    // deploy frequency data
    totalDeploys: number
    // dev cycle time and defect data
    ticketDevelopmentCycleTimes: { days: number }[]
    totalThroughput: number
    defectsCreated: number
    highestPriorityDefectsCreated: number
    highPriorityDefectsCreated: number
    mediumPriorityDefectsCreated: number
    lowPriorityDefectsCreated: number
    maintainabilityIssues: number
    maintainabilityLowSeverityIssues: number
    maintainabilityMediumSeverityIssues: number
    maintainabilityHighSeverityIssues: number
    vulnerabilities: number
    highSeverityVulnerabilities: number
    mediumSeverityVulnerabilities: number
    lowSeverityVulnerabilities: number
    lowestPriorityDefectsCreated: number
  }[]
  // a map representing the data type for last
  // updated data type, and the number representing
  // the unix time since epoch in seconds.
  lastUpdated: { [dataType: string]: number }
  // more cumulative flow data
  staleBacklogTickets: number
  ageOfTicketsInBacklog: { days: number }[]
}

export const createTeam = async ({
  name,
  valueStreamId,
  teamSize,
  userIds: adminUserIds,
  collectorTargetIds,
}: TeamCreateUpdatePayload): Promise<AxiosResponse<Team>> => {
  const url = `/api/v3/teams`
  return fetchHelper<Team>({
    url,
    acceptStatus: 201,
    options: {
      method: HTTPMethods.POST,
      body: JSON.stringify({
        valueStreamId,
        name,
        teamSize,
        userIds: adminUserIds,
        collectorTargetIds,
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  })
}

export const getTeams = async (): Promise<Team[]> => {
  const url = `/api/v3/teams`
  const teams = await fetchPaginatedJSON<Team>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.GET,
      headers: {
        Accept: 'application/json',
      },
    },
  })

  return teams
}

export const updateTeam = async (
  payload: TeamCreateUpdatePayload,
): Promise<AxiosResponse<Team>> => {
  const {
    id: teamId,
    name,
    valueStreamId,
    teamSize,
    userIds: adminUserIds,
    collectorTargetIds,
  } = payload
  const url = `/api/v3/teams/${teamId}`

  return fetchHelper<Team>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.PUT,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueStreamId,
        name,
        teamSize,
        userIds: adminUserIds,
        collectorTargetIds,
      }),
    },
  })
}

export const deleteTeam = async (team: Team): Promise<AxiosResponse<null>> => {
  const url = `/api/v3/teams/${team.id}`

  return fetchHelper({
    url,
    acceptStatus: 204,
    options: {
      method: HTTPMethods.DELETE,
      headers: {
        Accept: 'application/json',
      },
    },
  })
}

export type ValueStreamCreateUpdatePayload = {
  id?: number
  name: string
  organizationId: number
  userIds?: number[]
}

export const createValueStream = async ({
  name,
  organizationId,
  userIds,
}: ValueStreamCreateUpdatePayload): Promise<AxiosResponse<ValueStream>> => {
  const url = `/api/v3/value-streams`
  return fetchHelper<ValueStream>({
    url,
    acceptStatus: 201,
    options: {
      method: HTTPMethods.POST,
      body: JSON.stringify({ name, organizationId, userIds }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  })
}

export const getValueStreams = async (): Promise<ValueStream[]> => {
  const url = `/api/v3/value-streams`
  const valueStreams = await fetchPaginatedJSON<ValueStream>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.GET,
      headers: {
        Accept: 'application/json',
      },
    },
  })
  return valueStreams
}

export const updateValueStream = async ({
  id: valueStreamId,
  name,
  organizationId,
  userIds,
}: ValueStreamCreateUpdatePayload): Promise<AxiosResponse<ValueStream>> => {
  const url = `/api/v3/value-streams/${valueStreamId}`
  return fetchHelper<ValueStream>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.PUT,
      body: JSON.stringify({ name, organizationId, userIds }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  })
}

export const deleteValueStream = async (
  valueStream: ValueStream,
): Promise<AxiosResponse<null>> => {
  const url = `/api/v3/value-streams/${valueStream.id}`

  return fetchHelper({
    url,
    acceptStatus: 204,
    options: {
      method: HTTPMethods.DELETE,
      headers: {
        Accept: 'application/json',
      },
    },
  })
}

export type OrganizationCreateUpdatePayload = {
  id?: number
  name: string
  userIds?: number[]
}

export const createOrganization = async ({
  name,
  userIds,
}: OrganizationCreateUpdatePayload): Promise<AxiosResponse<Organization>> => {
  const url = `/api/v3/organizations`
  return fetchHelper<Organization>({
    url,
    acceptStatus: 201,
    options: {
      method: HTTPMethods.POST,
      body: JSON.stringify({ name, userIds }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  })
}

export const getOrganizations = async (): Promise<Organization[]> => {
  const url = `/api/v3/organizations`

  const organizations = await fetchPaginatedJSON<Organization>({
    url,
    acceptStatus: 200,
    options: {
      headers: {
        Accept: 'application/json',
      },
      method: HTTPMethods.GET,
    },
  })
  return organizations.map(org => ({
    id: org.id,
    name: org.name,
    users: org.users,
    valueStreams: org.valueStreams,
  }))
}

export const updateOrganization = async ({
  id: organizationId,
  name,
  userIds,
}: OrganizationCreateUpdatePayload): Promise<AxiosResponse<Organization>> => {
  const url = `/api/v3/organizations/${organizationId}`

  return fetchHelper<Organization>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.PUT,
      body: JSON.stringify({ name, userIds }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  })
}

export const deleteOrganization = (
  organization: Organization,
): Promise<AxiosResponse<null>> => {
  const url = `/api/v3/organizations/${organization.id}`

  return fetchHelper({
    url,
    acceptStatus: 204,
    options: {
      method: HTTPMethods.DELETE,
      headers: {
        Accept: 'application/json',
      },
    },
  })
}

export const METRICS_NOT_READY_ERROR = 'Metrics have not been processed yet.'

export const withMetricsNotReadyResponse =
  (
    getGroupEntityMetricsFunction: (
      groupEntity: GroupEntity,
    ) => Promise<TeamMetrics[]>,
  ): ((groupEntity: GroupEntity) => Promise<TeamMetrics[]>) =>
  async (groupEntity: GroupEntity): Promise<TeamMetrics[]> => {
    try {
      return await getGroupEntityMetricsFunction(groupEntity)
    } catch (err: unknown) {
      if (
        err instanceof AxiosError &&
        !!err.response &&
        err.response.status === 202
      ) {
        throw new Error(METRICS_NOT_READY_ERROR)
      }

      throw err
    }
  }

export const getOrganizationMetrics = withMetricsNotReadyResponse(
  async (organization: Organization): Promise<TeamMetrics[]> => {
    const url = `/api/v3/metrics/organization/${organization.id}`

    const { result } = await fetchJSON<{ result: TeamMetrics[] }>({
      url,
      acceptStatus: 200,
      options: {
        headers: {
          Accept: 'application/json',
        },
        method: HTTPMethods.GET,
      },
    })
    return result
  },
)

export const getValueStreamMetrics = withMetricsNotReadyResponse(
  async (valueStream: ValueStream): Promise<TeamMetrics[]> => {
    const url = `/api/v3/metrics/value-stream/${valueStream.id}`

    const { result } = await fetchJSON<{ result: TeamMetrics[] }>({
      url,
      acceptStatus: 200,
      options: {
        headers: {
          Accept: 'application/json',
        },
        method: HTTPMethods.GET,
      },
    })
    return result
  },
)

export const getTeamMetrics = withMetricsNotReadyResponse(
  async (team: Team): Promise<TeamMetrics[]> => {
    const url = `/api/v3/metrics/team/${team.id}`

    const teamMetrics = await fetchJSON<TeamMetrics>({
      url,
      acceptStatus: 200,
      options: {
        headers: {
          Accept: 'application/json',
        },
        method: HTTPMethods.GET,
      },
    })
    return [teamMetrics]
  },
)

type PayRates = {
  rates: PayRate[]
}

export const updatePayRates = async (
  payRates: PayRates,
): Promise<AxiosResponse<PayRates>> => {
  const url = `/api/v3/pay-rates`
  return fetchHelper<PayRates>({
    url,
    acceptStatus: 201,
    options: {
      method: HTTPMethods.POST,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payRates),
    },
  })
}

export const getUsers = async (): Promise<{
  currentUser: User
  allUsers: User[]
}> => {
  const url = `/api/v3/users`
  const { headers, data } = await fetchHelper<{ result: User[] }>({
    url,
    acceptStatus: 200,
    options: {
      headers: {
        Accept: 'application/json',
      },
      method: HTTPMethods.GET,
    },
  })
  const { result: allUsers } = data
  if (!headers['x-user']) {
    throw new Error(config.UI_SETTINGS.APP_NOT_SETUP_PROPERLY)
  }

  return { currentUser: JSON.parse(headers['x-user']), allUsers }
}

export const deleteUser = async (user: User): Promise<AxiosResponse<null>> => {
  const url = `/api/v3/users/${user.id}`

  return fetchHelper({
    url,
    acceptStatus: 204,
    options: {
      method: HTTPMethods.DELETE,
      headers: {
        Accept: 'application/json',
      },
    },
  })
}

export const getTicketBoards = async (): Promise<CollectorTarget[]> => {
  const url = `/api/v3/ticket-boards?per_page=1000`

  const ticketBoards = await fetchPaginatedJSON<CollectorTarget>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.GET,
      headers: { Accept: 'application/json' },
    },
  })
  return ticketBoards
}

export const getRepositories = async (): Promise<CollectorTarget[]> => {
  const url = `/api/v3/repositories?per_page=1000`

  const repositories = await fetchPaginatedJSON<CollectorTarget>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.GET,
      headers: { Accept: 'application/json' },
    },
  })
  return repositories
}

export const getPipelines = async (): Promise<CollectorTarget[]> => {
  const url = `/api/v3/pipelines?per_page=1000`

  const pipelines = await fetchPaginatedJSON<CollectorTarget>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.GET,
      headers: { Accept: 'application/json' },
    },
  })
  return pipelines
}

type TeamViewCreateUpdatePayload = {
  id?: number
  name: string
  viewOwnerId: number
  collectorTargetIds: number[]
}

export const createTeamView = async ({
  name,
  viewOwnerId,
  collectorTargetIds,
}: TeamViewCreateUpdatePayload): Promise<AxiosResponse<TeamView>> => {
  const url = `/api/v3/teams/views`
  return fetchHelper<TeamView>({
    url,
    acceptStatus: 201,
    options: {
      method: HTTPMethods.POST,
      body: JSON.stringify({ name, collectorTargetIds, viewOwnerId }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  })
}

export const getTeamViews = async (): Promise<TeamView[]> => {
  const url = `/api/v3/teams/views`
  const teamViews = await fetchPaginatedJSON<TeamView>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.GET,
      headers: {
        Accept: 'application/json',
      },
    },
  })
  return teamViews
}

export const updateTeamView = async ({
  id: teamViewId,
  name,
  collectorTargetIds,
  viewOwnerId,
}: TeamViewCreateUpdatePayload): Promise<AxiosResponse<TeamView>> => {
  const url = `/api/v3/teams/views/${teamViewId}`

  return fetchHelper<TeamView>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.PUT,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        viewOwnerId,
        collectorTargetIds,
      }),
    },
  })
}

export const deleteTeamView = async (
  teamView: TeamView,
): Promise<AxiosResponse<null>> => {
  const url = `/api/v3/teams/views/${teamView.id}`

  return fetchHelper({
    url,
    acceptStatus: 204,
    options: {
      method: HTTPMethods.DELETE,
      headers: {
        Accept: 'application/json',
      },
    },
  })
}

export const getFeatureFlags = async (): Promise<FeatureFlags> => {
  const systemConfig = await fetchJSON<SystemConfig>({
    url: '/api/v3/system-config',
    acceptStatus: 200,
    options: {
      method: HTTPMethods.GET,
      headers: { Accept: 'application/json' },
    },
  })
  const { featureFlags } = systemConfig
  featureFlags.ssoEnabled = systemConfig.ssoEnabled
  return featureFlags
}

export const updateTeamMembers = async ({
  id: teamId,
  teamMembers,
}: {
  id: number
  teamMembers: TeamMember[]
}): Promise<AxiosResponse<TeamMember[]>> => {
  const url = `/api/v3/members/team/${teamId}`

  return fetchHelper<TeamMember[]>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.PUT,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teamMembers,
      }),
    },
  })
}

export const getProjects = async (): Promise<CollectorTarget[]> => {
  const url = '/api/v3/projects?per_page=1000'
  const projects = await fetchPaginatedJSON<CollectorTarget>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.GET,
      headers: { Accept: 'application/json' },
    },
  })
  return projects
}

export const getCollectors = async (): Promise<Collector[]> => {
  const url = '/api/v3/collectors'
  const collectors = await fetchPaginatedJSON<Collector>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.GET,
      headers: {
        Accept: 'application/json',
      },
    },
  })

  return collectors
}

type CollectorUpdatePayload = {
  collectorIntervalSeconds?: number
  collectorTargetsIntrvlSecs?: number
  lookBackDays?: number
  maxRequestsPerMinute?: number
  name?: string
  target?: string
}

export const updateCollector = async (
  collectorId: number,
  payload: CollectorUpdatePayload,
): Promise<AxiosResponse<Collector>> => {
  const url = `/api/v3/collectors/${collectorId}`

  return fetchHelper<Collector>({
    url,
    acceptStatus: 200,
    options: {
      method: HTTPMethods.PUT,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  })
}
