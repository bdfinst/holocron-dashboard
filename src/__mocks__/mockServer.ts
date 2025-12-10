import Teams from '__mocks__/Teams'
import ValueStreams from '__mocks__/ValueStreams'
import Metrics from '__mocks__/Metrics'
import { createServer, Response } from 'miragejs'
import Organizations from '__mocks__/Organizations'
import { allMockUsers, adminAndLeaderUser } from '__mocks__/Users'
import TicketBoards from '__mocks__/TicketBoards'
import Repos from '__mocks__/Repos'
import Pipelines from '__mocks__/Pipelines'
import TeamViews from './TeamViews'
import Collectors from './Collectors'
import MockCodeAnalysisProjects from './CodeAnalysisProjects'

export default function mockServer(environment = 'development') {
  const shouldCreateServer =
    process.env.NODE_ENV === environment && !process.env.REACT_APP_IN_DOCKER
  if (shouldCreateServer) {
    return createServer({
      routes() {
        this.namespace = 'api/v3'

        const addNextPageHeader = (response) => {
          response.headers['x-next-page'] = 'None'
          return response
        }

        this.get(
          '/users',
          () =>
            addNextPageHeader(new Response(
              200,
              { 'x-user': JSON.stringify(adminAndLeaderUser) },
              allMockUsers,
            )),
        )
        this.get('/teams', () => addNextPageHeader(new Response(200, {}, Teams)))
        this.get('/value-streams', () => addNextPageHeader(new Response(200, {}, ValueStreams)))
        this.get('/organizations', () => addNextPageHeader(new Response(200, {}, Organizations)))
        this.get('/metrics/organization/:id', () => addNextPageHeader(new Response(200, {}, Metrics)))
        this.get('/metrics/value-stream/:id', () => addNextPageHeader(new Response(200, {}, Metrics)))
        this.get('/metrics/team/:id', () => addNextPageHeader(new Response(200, {}, Metrics.result[0])))
        this.get('/ticket-boards', () => addNextPageHeader(new Response(200, {}, TicketBoards)))
        this.get('/repositories', () => addNextPageHeader(new Response(200, {}, Repos)))
        this.get('/pipelines', () => addNextPageHeader(new Response(200, {}, Pipelines)))
        this.get('/projects', () => addNextPageHeader(new Response(200, {}, MockCodeAnalysisProjects)))
        this.get('/system-config', () => addNextPageHeader(new Response(200, {}, {
          featureFlags: {
            FEATURE_TEAM_VIEWS: true,
            FEATURE_COST_METRICS: true,
            FEATURE_DEPLOY_FREQUENCY: true,
            FEATURE_EXTERNAL_CONTRIBUTORS: true,
            FEATURE_PROJECT_ANALYSIS: true,
          },
          ssoEnabled: true,
          version: '3.0.0',
        })))
        this.get('/collectors', () => addNextPageHeader(new Response(200, {}, Collectors)))
        this.put('/collectors/:id', (schema, request) => {
          const id = request.params.id
          const attrs = JSON.parse(request.requestBody)
          const collector = Collectors.result.find(c => c.id === parseInt(id))
          if (collector) {
            Object.assign(collector, attrs)
            return addNextPageHeader(new Response(200, {}, collector))
          } else {
            return addNextPageHeader(new Response(404, {}, { error: 'Collector not found' }))
          }
        })
        this.get('/teams/views', () => addNextPageHeader(new Response(200, {}, TeamViews)))
        // INSERT YOUR MOCKS FOR YOUR REST PATH HERE
      },
    })
  }
  return null
}