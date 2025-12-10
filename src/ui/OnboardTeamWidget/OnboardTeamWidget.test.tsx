import { screen } from '@testing-library/react'
import {
  useGroupEntityRouteParams,
  useCurrentUserPermissions,
  useAPIContext,
} from 'api'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import Teams from '__mocks__/Teams'
import OnboardTeamWidget from './OnboardTeamWidget'

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
  useCurrentUserPermissions: jest.fn(),
  useGroupEntityRouteParams: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock
const useGroupEntityRouteParamsMock = useGroupEntityRouteParams as jest.Mock

const mockOrgNameForAllTeams = 'foo'
const mockVSNameForAllTeams = 'bar'

describe('OnboardTeamWidget', () => {
  beforeAll(() => {
    useAPIContextMock.mockReturnValue({
      teamList: Teams.result,
      featureFlags: { FEATURE_COST_METRICS: true },
    })
    useGroupEntityRouteParamsMock.mockReturnValue({
      getTeamParamsForTeamId: jest.fn().mockReturnValue({
        organizationName: mockOrgNameForAllTeams,
        valueStreamName: mockVSNameForAllTeams,
      }),
    })
    useCurrentUserPermissionsMock.mockReturnValue({
      canCreateTeam: jest.fn().mockReturnValue(true),
      canUpdateTeam: jest.fn().mockReturnValue(true),
      canDeleteTeam: jest.fn().mockReturnValue(true),
      canViewTeamMetrics: jest.fn().mockReturnValue(true),
      canViewTeamCostMetrics: jest.fn().mockReturnValue(true),
    })
  })

  it('should render with the list and the action buttons for each team', () => {
    RenderWithWrapper(<OnboardTeamWidget />)

    expect(
      screen.getAllByRole('cell', { name: mockOrgNameForAllTeams }),
    ).toHaveLength(Teams.result.length)
    expect(
      screen.getAllByRole('cell', { name: mockVSNameForAllTeams }),
    ).toHaveLength(Teams.result.length)

    Teams.result.forEach(team => {
      expect(
        screen.getByLabelText(`delete-team-${team.name}`),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(`update-team-${team.name}`),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(`view-metrics-team-${team.name}`),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(`view-cost-metrics-team-${team.name}`),
      ).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Add team')).toBeInTheDocument()
  })
})
