import { screen } from '@testing-library/react'
import {
  useGroupEntityRouteParams,
  useCurrentUserPermissions,
  useAPIContext,
} from 'api'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import Teams from '__mocks__/Teams'
import TeamViews from '__mocks__/TeamViews'
import OnboardTeamViewWidget from './OnboardTeamViewWidget'

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
  useCurrentUserPermissions: jest.fn(),
  useGroupEntityRouteParams: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock
const useGroupEntityRouteParamsMock = useGroupEntityRouteParams as jest.Mock

describe('OnboardTeamViewWidget', () => {
  const [team] = Teams.result

  beforeAll(() => {
    useAPIContextMock.mockReturnValue({
      teamViews: TeamViews.result,
      featureFlags: { FEATURE_COST_METRICS: true },
    })
    useCurrentUserPermissionsMock.mockReturnValue({
      canViewTeamCostMetrics: jest.fn().mockReturnValue(true),
    })
    useGroupEntityRouteParamsMock.mockReturnValue({
      getTeamParamsForTeamId: jest.fn().mockReturnValue({
        organizationName: 'foo-bar',
        valueStreamName: 'biz-baz',
      }),
    })
  })

  it('should list all the team views the user has created with the option buttons', () => {
    RenderWithWrapper(<OnboardTeamViewWidget team={team} />)

    TeamViews.result
      .filter(teamView => teamView.viewOwnerId === team.id)
      .forEach(teamView => {
        expect(
          screen.getByLabelText(`delete-team view-${teamView.name}`),
        ).toBeInTheDocument()
        expect(
          screen.getByLabelText(`update-team view-${teamView.name}`),
        ).toBeInTheDocument()
        expect(
          screen.getByLabelText(`view-metrics-team view-${teamView.name}`),
        ).toBeInTheDocument()
        expect(
          screen.getByLabelText(`view-cost-metrics-team view-${teamView.name}`),
        ).toBeInTheDocument()
      })

    expect(screen.getByLabelText('Add team view')).toBeInTheDocument()
  })
})
