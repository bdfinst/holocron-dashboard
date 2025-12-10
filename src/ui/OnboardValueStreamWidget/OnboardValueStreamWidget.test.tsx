import { screen } from '@testing-library/react'
import {
  useCurrentUserPermissions,
  useAPIContext,
  useGroupEntityRouteParams,
} from 'api'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import ValueStreams from '__mocks__/ValueStreams'
import OnboardValueStreamWidget from '.'

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
  useCurrentUserPermissions: jest.fn(),
  useGroupEntityRouteParams: jest.fn(),
}))

const mockOrgName = 'foo-bar'

const useAPIContextMock = useAPIContext as jest.Mock
const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock
const useGroupEntityRouteParamsMock = useGroupEntityRouteParams as jest.Mock

describe('OnboardValueStreamWidget', () => {
  beforeAll(() => {
    useGroupEntityRouteParamsMock.mockReturnValue({
      getVSParamsForVSId: jest.fn().mockReturnValue({
        organizationName: mockOrgName,
      }),
    })
    useAPIContextMock.mockReturnValue({
      valueStreamList: ValueStreams.result,
      featureFlags: { FEATURE_COST_METRICS: true },
    })
    useCurrentUserPermissionsMock.mockReturnValue({
      canCreateValueStream: jest.fn().mockReturnValue(true),
      canUpdateValueStream: jest.fn().mockReturnValue(true),
      canDeleteValueStream: jest.fn().mockReturnValue(true),
      canViewValueStreamMetrics: jest.fn().mockReturnValue(true),
      canViewValueStreamCostMetrics: jest.fn().mockReturnValue(true),
    })
  })

  it('should render with the list, organization name Column and the action buttons for each valuestream', () => {
    RenderWithWrapper(<OnboardValueStreamWidget />)

    // should render with the organization a valuestream belongs to
    expect(screen.getAllByRole('cell', { name: mockOrgName })).toHaveLength(
      ValueStreams.result.length,
    )

    ValueStreams.result.forEach(vs => {
      expect(
        screen.getByLabelText(`delete-value stream-${vs.name}`),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(`update-value stream-${vs.name}`),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(`view-metrics-value stream-${vs.name}`),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(`view-cost-metrics-value stream-${vs.name}`),
      ).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Add value stream')).toBeInTheDocument()
  })
})
