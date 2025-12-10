import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getUsersDashboardPath } from 'ui/HomePage'
import {
  useAPIContext,
  useGroupEntityRouteParams,
  useCurrentUserPermissions,
} from 'api'
import Organizations from '__mocks__/Organizations'
import Teams from '__mocks__/Teams'
import ValueStreams from '__mocks__/ValueStreams'
import CostMetricsHomePage from '.'

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
  useCurrentUserPermissions: jest.fn(),
  useGroupEntityRouteParams: jest.fn(),
  withFeatureFlag:
    ({
      featureFlagName: _,
      WrappedComponent,
      FeatureNotAllowedComponent: __,
    }) =>
    (props = undefined) => <WrappedComponent {...props} />,
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => <div data-testid={to} />,
}))

jest.mock('ui/HomePage', () => ({
  ...jest.requireActual('ui/HomePage'),
  getUsersDashboardPath: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock
const useGroupEntityRouteParamsMock = useGroupEntityRouteParams as jest.Mock
const getUsersDashboardPathMock = getUsersDashboardPath as jest.Mock

const [organization] = Organizations.result
const [valuestream] = ValueStreams.result
const [team] = Teams.result

describe('CostMetricsHomePage', () => {
  beforeAll(() => {
    useGroupEntityRouteParamsMock.mockReturnValue({
      getPathWithParams: jest.fn(),
      getOrgParamsForVSId: jest.fn(),
      getVSParamsForVSId: jest.fn(),
      getTeamParamsForTeamId: jest.fn(),
    })
    useAPIContextMock.mockReturnValue({
      organizationList: Organizations.result,
      valueStreamList: ValueStreams.result,
      teamList: Teams.result,
    })
  })

  describe('global admin redirects', () => {
    beforeEach(() => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isOrgLeadership: true,
        isGlobalAdmin: true,
        isOrgAdmin: false,
        isVSAdmin: false,
        isTeamAdmin: false,
        canViewOrganizationCostMetrics: jest.fn().mockReturnValue(true),
      })
    })

    it('should redirect to organization cost dashboard path', () => {
      getUsersDashboardPathMock.mockImplementation(
        (_, __, ___, ____, pathMaker, ______) =>
          pathMaker({ organizationName: organization.name }),
      )

      render(
        <MemoryRouter>
          <CostMetricsHomePage />
        </MemoryRouter>,
      )

      expect(
        screen.getByTestId(`/costs/${organization.name}`),
      ).toBeInTheDocument()
    })
  })

  describe('organization admin redirects', () => {
    beforeEach(() => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isOrgLeadership: true,
        isGlobalAdmin: false,
        isOrgAdmin: true,
        isVSAdmin: false,
        isTeamAdmin: false,
        canViewOrganizationCostMetrics: jest.fn().mockReturnValue(true),
      })
    })

    it('should redirect to organization cost dashboard path', () => {
      getUsersDashboardPathMock.mockImplementation(
        (_, __, ___, ____, pathMaker, ______) =>
          pathMaker({ organizationName: organization.name }),
      )

      render(
        <MemoryRouter>
          <CostMetricsHomePage />
        </MemoryRouter>,
      )

      expect(
        screen.getByTestId(`/costs/${organization.name}`),
      ).toBeInTheDocument()
    })
  })

  describe('valuestream admin redirects', () => {
    beforeEach(() => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isOrgLeadership: true,
        isGlobalAdmin: false,
        isOrgAdmin: false,
        isVSAdmin: true,
        isTeamAdmin: false,
        canViewValueStreamCostMetrics: jest.fn().mockReturnValue(true),
      })
    })

    it('should redirect to value stream cost dashboard path', () => {
      getUsersDashboardPathMock.mockImplementation(
        (_, __, ___, ____, pathMaker, ______) =>
          pathMaker({
            organizationName: organization.name,
            valueStreamName: valuestream.name,
          }),
      )

      render(
        <MemoryRouter>
          <CostMetricsHomePage />
        </MemoryRouter>,
      )

      expect(
        screen.getByTestId(`/costs/${organization.name}/${valuestream.name}`),
      ).toBeInTheDocument()
    })
  })

  describe('team admin redirects', () => {
    beforeEach(() => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isOrgLeadership: true,
        isGlobalAdmin: false,
        isOrgAdmin: false,
        isVSAdmin: false,
        isTeamAdmin: true,
        canViewTeamCostMetrics: jest.fn().mockReturnValue(true),
      })
    })

    it('should redirect to team cost dashboard path', () => {
      getUsersDashboardPathMock.mockImplementation(
        (_, __, ___, ____, pathMaker, ______) =>
          pathMaker({
            organizationName: organization.name,
            valueStreamName: valuestream.name,
            teamName: team.name,
          }),
      )

      render(
        <MemoryRouter>
          <CostMetricsHomePage />
        </MemoryRouter>,
      )

      expect(
        screen.getByTestId(
          `/costs/${organization.name}/${valuestream.name}/${team.name}`,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('random user view', () => {
    it('should redirect to /401', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isOrgLeadership: false,
        isGlobalAdmin: false,
        isOrgAdmin: false,
        isVSAdmin: false,
        isTeamAdmin: false,
      })

      render(
        <MemoryRouter>
          <CostMetricsHomePage />
        </MemoryRouter>,
      )

      expect(screen.getByTestId('/401')).toBeInTheDocument()
    })
  })
})
