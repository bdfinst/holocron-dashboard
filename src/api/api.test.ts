import axios, { AxiosError } from 'axios'
import Organizations from '__mocks__/Organizations'
import Teams from '__mocks__/Teams'
import ValueStreams from '__mocks__/ValueStreams'
import MockMetrics from '__mocks__/Metrics'
import { adminUser, allMockUsers } from '__mocks__/Users'
import config from 'globalConfig'
import Repos from '__mocks__/Repos'
import TicketBoards from '__mocks__/TicketBoards'
import Pipelines from '__mocks__/Pipelines'
import TeamViews from '__mocks__/TeamViews'
import MockCodeAnalysisProjects from '__mocks__/CodeAnalysisProjects'
import MockCollectors from '__mocks__/Collectors'
import {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
  createValueStream,
  getValueStreams,
  updateValueStream,
  deleteValueStream,
  createOrganization,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
  withMetricsNotReadyResponse,
  METRICS_NOT_READY_ERROR,
  getValueStreamMetrics,
  getOrganizationMetrics,
  getTeamMetrics,
  updatePayRates,
  deleteUser,
  getUsers,
  getTicketBoards,
  getRepositories,
  getPipelines,
  createTeamView,
  updateTeamView,
  getTeamViews,
  deleteTeamView,
  getFeatureFlags,
  updateTeamMembers,
  Team,
  ValueStream,
  Organization,
  TeamMetrics,
  TeamView,
  getProjects,
  getCollectors,
} from './api'

jest.mock('axios')

const axiosMock = axios as unknown as jest.Mock

type AxiosActualCall = {
  url: string
  method: string
  headers: {
    [headerKey: string]: string
  }
  data?: unknown
  validateStatus: (status: number) => boolean
}

type AxiosExpectedCall = {
  url: string
  method: string
  headers: {
    [headerKey: string]: string
  }
  data?: unknown
  acceptStatus: number
}

const mockAxiosCall = (
  expected: AxiosExpectedCall,
  response: unknown = undefined,
  headers: unknown = undefined,
) => {
  axiosMock.mockImplementation((actual: AxiosActualCall): Promise<unknown> => {
    expect(actual.url).toEqual(expected.url)
    expect(expected.method).toEqual(actual.method)
    expect(expected.headers).toEqual(actual.headers)
    if (expected.data) {
      expect(JSON.stringify(expected.data)).toEqual(actual.data)
    }
    expect(actual.validateStatus(expected.acceptStatus)).toBe(true)
    return Promise.resolve({ data: response, headers })
  })
}

const [mockTeam]: Team[] = Teams.result
const [mockValueStream]: ValueStream[] = ValueStreams.result
const [mockOrganization]: Organization[] = Organizations.result
const [mockTeamView]: TeamView[] = TeamViews.result

describe('api', () => {
  afterEach(() => {
    axiosMock.mockReset()
  })

  beforeAll(() => {
    jest.useFakeTimers({ now: new Date('2021-06-14') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-14').getTime())
  })

  describe('teams crud', () => {
    it('should send request to create team', async () => {
      const createTeamPayload = {
        valueStreamId: 1,
        name: 'foo-bar',
        teamSize: 5,
        userIds: [1],
        collectorTargetIds: [1],
      }

      mockAxiosCall({
        url: '/api/v3/teams',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: createTeamPayload,
        acceptStatus: 201,
      })

      await createTeam(createTeamPayload)
    })

    it('should send request to get teams', async () => {
      mockAxiosCall(
        {
          url: '/api/v3/teams',
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        { result: Teams.result },
        { 'x-next-page': 'None' },
      )

      await expect(getTeams()).resolves.toEqual(Teams.result)
    })

    it('should send request to update team', async () => {
      const updateTeamPayload = {
        id: 1,
        valueStreamId: 1,
        name: 'foo-bar',
        teamSize: 5,
        userIds: [1],
        collectorTargetIds: [1],
      }
      const { id, ...data } = updateTeamPayload

      mockAxiosCall({
        url: `/api/v3/teams/${id}`,
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data,
        acceptStatus: 200,
      })

      await updateTeam(updateTeamPayload)
    })

    it('should send request to delete team', async () => {
      mockAxiosCall({
        url: `/api/v3/teams/${mockTeam.id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
        acceptStatus: 204,
      })

      await deleteTeam(mockTeam)
    })
  })

  describe('value streams crud', () => {
    it('should send request to create value stream', async () => {
      const createValueStreamData = {
        name: 'foo-bar',
        organizationId: 1,
        userIds: [1],
      }

      mockAxiosCall({
        url: '/api/v3/value-streams',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: createValueStreamData,
        acceptStatus: 201,
      })

      await createValueStream(createValueStreamData)
    })

    it('should send request to get value streams', async () => {
      mockAxiosCall(
        {
          url: '/api/v3/value-streams',
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        { result: ValueStreams.result },
        { 'x-next-page': 'None' },
      )

      await expect(getValueStreams()).resolves.toEqual(ValueStreams.result)
    })

    it('should send request to update value stream', async () => {
      const updateValueStreamPayload = {
        id: 1,
        name: 'foo-bar',
        organizationId: 1,
        userIds: [1],
      }
      const { id, ...data } = updateValueStreamPayload

      mockAxiosCall({
        url: `/api/v3/value-streams/${id}`,
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data,
        acceptStatus: 200,
      })

      await updateValueStream(updateValueStreamPayload)
    })

    it('should send request to delete value stream', async () => {
      mockAxiosCall({
        url: `/api/v3/value-streams/${mockValueStream.id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
        acceptStatus: 204,
      })

      await deleteValueStream(mockValueStream)
    })
  })

  describe('organizations crud', () => {
    it('should send request to create organization', async () => {
      const createOrganizationPayload = {
        name: 'foo-bar',
        userIds: [1],
      }

      mockAxiosCall({
        url: '/api/v3/organizations',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: createOrganizationPayload,
        acceptStatus: 201,
      })

      await createOrganization(createOrganizationPayload)
    })

    it('should send request to get organizations', async () => {
      mockAxiosCall(
        {
          url: '/api/v3/organizations',
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        { result: Organizations.result },
        { 'x-next-page': 'None' },
      )

      await expect(getOrganizations()).resolves.toEqual(Organizations.result)
    })

    it('should send request to update organization', async () => {
      const updateOrganizationPayload = {
        id: 1,
        name: 'foo-bar',
        userIds: [1],
      }
      const { id, ...data } = updateOrganizationPayload

      mockAxiosCall({
        url: `/api/v3/organizations/${id}`,
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data,
        acceptStatus: 200,
      })

      await updateOrganization(updateOrganizationPayload)
    })

    it('should send request to delete organization', async () => {
      mockAxiosCall({
        url: `/api/v3/organizations/${mockOrganization.id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
        acceptStatus: 204,
      })

      await deleteOrganization(mockOrganization)
    })
  })

  describe('withMetricsNotReadyResponse', () => {
    it('should throw metrics not ready error if that is the case', async () => {
      const metricsNotReadyErrorFunction = withMetricsNotReadyResponse(
        async (_: Organization): Promise<TeamMetrics[]> => {
          const error = new AxiosError()
          error.response = {
            status: 202,
            data: undefined,
            headers: undefined,
            statusText: undefined,
            config: undefined,
          }
          throw error
        },
      )

      await expect(
        metricsNotReadyErrorFunction(mockOrganization),
      ).rejects.toThrow(METRICS_NOT_READY_ERROR)
    })

    it('should throw regular error if that is the case', async () => {
      const metricsErrorFunction = withMetricsNotReadyResponse(
        async (_: Organization): Promise<TeamMetrics[]> => {
          throw new Error('oops.')
        },
      )
      await expect(metricsErrorFunction(mockOrganization)).rejects.toThrow(
        'oops.',
      )
    })
  })

  describe('getOrganizationMetrics', () => {
    it('should send request to get organization metrics', async () => {
      mockAxiosCall(
        {
          url: `/api/v3/metrics/organization/${mockOrganization.id}`,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        MockMetrics,
      )

      await expect(getOrganizationMetrics(mockOrganization)).resolves.toEqual(
        MockMetrics.result,
      )
    })
  })

  describe('getValueStreamMetrics', () => {
    it('should send request to get value stream metrics', async () => {
      mockAxiosCall(
        {
          url: `/api/v3/metrics/value-stream/${mockValueStream.id}`,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        MockMetrics,
      )

      await expect(getValueStreamMetrics(mockValueStream)).resolves.toEqual(
        MockMetrics.result,
      )
    })
  })

  describe('getTeamMetrics', () => {
    it('should send request to get team metrics', async () => {
      mockAxiosCall(
        {
          url: `/api/v3/metrics/team/${mockTeam.id}`,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        MockMetrics.result[0],
      )

      await expect(getTeamMetrics(mockTeam)).resolves.toEqual([
        MockMetrics.result[0],
      ])
    })
  })

  describe('updatePayRates', () => {
    it('should send request to update pay rates', async () => {
      const payRates = {
        rates: [
          { email: 'foo', rate: 1 },
          { email: 'bar', rate: 2 },
        ],
      }
      mockAxiosCall({
        url: `/api/v3/pay-rates`,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: payRates,
        acceptStatus: 201,
      })

      await updatePayRates(payRates)
    })
  })

  describe('users crud', () => {
    describe('getting users', () => {
      it('should send request to get users', async () => {
        mockAxiosCall(
          {
            url: `/api/v3/users`,
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            acceptStatus: 200,
          },
          { result: allMockUsers.result },
          { 'x-user': JSON.stringify(adminUser), 'x-next-page': 'None' },
        )
        await expect(getUsers()).resolves.toEqual({
          currentUser: adminUser,
          allUsers: allMockUsers.result,
        })
      })

      it('should throw an error for app not setup properly if current user is not in the header', async () => {
        mockAxiosCall(
          {
            url: `/api/v3/users`,
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            acceptStatus: 200,
          },
          allMockUsers.result,
          {},
        )

        await expect(getUsers()).rejects.toThrow(
          config.UI_SETTINGS.APP_NOT_SETUP_PROPERLY,
        )
      })
    })

    describe('deleting a user', () => {
      it('should send a request to deleting the given user', async () => {
        mockAxiosCall({
          url: `/api/v3/users/${adminUser.id}`,
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 204,
        })

        await deleteUser(adminUser)
      })
    })
  })

  describe('getTicketBoards', () => {
    it('should send request to get ticket boards', async () => {
      mockAxiosCall(
        {
          url: `/api/v3/ticket-boards?per_page=1000`,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        { result: TicketBoards.result },
        { 'x-next-page': 'None' },
      )

      await expect(getTicketBoards()).resolves.toEqual(TicketBoards.result)
    })
  })

  describe('getRepositories', () => {
    it('should send request to get repositories', async () => {
      mockAxiosCall(
        {
          url: `/api/v3/repositories?per_page=1000`,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        { result: Repos.result },
        { 'x-next-page': 'None' },
      )

      await expect(getRepositories()).resolves.toEqual(Repos.result)
    })
  })

  describe('getPipelines', () => {
    it('should send request to get pipelines', async () => {
      mockAxiosCall(
        {
          url: `/api/v3/pipelines?per_page=1000`,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        { result: Pipelines.result },
        { 'x-next-page': 'None' },
      )

      await expect(getPipelines()).resolves.toEqual(Pipelines.result)
    })
  })

  describe('team views crud', () => {
    it('should send request to create team view', async () => {
      const createTeamViewPayload = {
        name: 'foo-bar',
        collectorTargetIds: [1],
        viewOwnerId: 1,
      }

      mockAxiosCall({
        url: '/api/v3/teams/views',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: createTeamViewPayload,
        acceptStatus: 201,
      })

      await createTeamView(createTeamViewPayload)
    })

    it('should send request to get team views', async () => {
      mockAxiosCall(
        {
          url: '/api/v3/teams/views',
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        { result: TeamViews.result },
        { 'x-next-page': 'None' },
      )

      await expect(getTeamViews()).resolves.toEqual(TeamViews.result)
    })

    it('should send request to update team view', async () => {
      const updateTeamViewPayload = {
        id: 1,
        name: 'foo-bar',
        viewOwnerId: 1,
        collectorTargetIds: [1],
      }
      const { id, ...data } = updateTeamViewPayload

      mockAxiosCall({
        url: `/api/v3/teams/views/${id}`,
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data,
        acceptStatus: 200,
      })

      await updateTeamView(updateTeamViewPayload)
    })

    it('should send request to delete team view', async () => {
      mockAxiosCall({
        url: `/api/v3/teams/views/${mockTeamView.id}`,
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
        acceptStatus: 204,
      })

      await deleteTeamView(mockTeamView)
    })
  })

  describe('getFeatureFlags', () => {
    it('should send a request to get feature flags', async () => {
      mockAxiosCall(
        {
          url: '/api/v3/system-config',
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        { featureFlags: { foo: 'bar' }, ssoEnabled: true },
      )

      await expect(getFeatureFlags()).resolves.toEqual({
        foo: 'bar',
        ssoEnabled: true,
      })
    })
  })

  describe('updateTeamMembers', () => {
    it('should send a request to update contributors', async () => {
      mockAxiosCall({
        url: '/api/v3/members/team/1',
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          teamMembers: [
            {
              endDate: new Date().toISOString(),
              member: { name: 'foo', username: 'bar' },
              startDate: new Date().toISOString(),
            },
          ],
        },
        acceptStatus: 200,
      })

      await updateTeamMembers({
        id: 1,
        teamMembers: [
          {
            endDate: new Date().toISOString(),
            member: { name: 'foo', username: 'bar' },
            startDate: new Date().toISOString(),
          },
        ],
      })
    })
  })

  describe('getProjects', () => {
    it('should send request to get projects', async () => {
      mockAxiosCall(
        {
          url: `/api/v3/projects?per_page=1000`,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          acceptStatus: 200,
        },
        MockCodeAnalysisProjects,
        { 'x-next-page': 'None' },
      )

      await expect(getProjects()).resolves.toEqual(
        MockCodeAnalysisProjects.result,
      )
    })
  })
})

describe('getCollectors', () => {
  it('should send request to get collectors', async () => {
    mockAxiosCall(
      {
        url: '/api/v3/collectors',
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        acceptStatus: 200,
      },
      { result: MockCollectors.result },
      { 'x-next-page': 'None' },
    )

    await expect(getCollectors()).resolves.toEqual(MockCollectors.result)
  })
})
