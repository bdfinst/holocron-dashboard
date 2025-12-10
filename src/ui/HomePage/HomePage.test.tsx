import { screen } from '@testing-library/react'
import {
  useAPIContext,
  useCurrentUserPermissions,
  useGroupEntityRouteParams,
  GroupEntityDetails,
} from 'api'
import Organizations from '__mocks__/Organizations'
import Teams from '__mocks__/Teams'
import ValueStreams from '__mocks__/ValueStreams'
import * as localStorage from 'local-storage'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import HomePage from '.'

jest.mock('local-storage')

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
  useCurrentUserPermissions: jest.fn(),
  useGroupEntityRouteParams: jest.fn(),
  useViewTeamContextLocalStorage: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => <div data-testid={to} />,
}))

jest.mock('./HolocronWelcomeScreen', () => ({
  __esModule: true,
  default: () => <div data-testid="HolocronWelcomeScreen" />,
}))

const localStorageMock = localStorage as unknown as {
  set: jest.Mock
  get: jest.Mock
}

const useAPIContextMock = useAPIContext as jest.Mock
const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock
const useGroupEntityRouteParamsMock = useGroupEntityRouteParams as jest.Mock

const [organization] = Organizations.result
const [valuestream] = ValueStreams.result
const [team] = Teams.result

const getPathWithParams = jest
  .fn()
  .mockImplementation(
    (
      pathMaker: (params: GroupEntityDetails) => string,
      params?: GroupEntityDetails,
    ) => (params ? pathMaker(params) : '/404'),
  )

describe('HomePage', () => {
  beforeEach(() => {
    useCurrentUserPermissionsMock.mockReturnValue({
      isGlobalAdmin: false,
      isOrgAdmin: false,
      isVSAdmin: false,
      isTeamAdmin: false,
      canViewTeamMetrics: jest.fn(),
      canViewValueStreamMetrics: jest.fn(),
      canViewOrganizationMetrics: jest.fn(),
    })
    useGroupEntityRouteParamsMock.mockReturnValue({
      getPathWithParams,
      getOrgParamsForVSId: jest.fn(),
      getVSParamsForVSId: jest.fn(),
      getTeamParamsForTeamId: jest.fn(),
    })
  })

  describe('redirects for no entities found', () => {
    it('should redirect to create organization if there are currently no organizations', () => {
      useAPIContextMock.mockReturnValue({
        organizationList: [],
        valueStreamList: [],
        teamList: [],
      })
      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(screen.getByTestId('/admin/add-organization')).toBeInTheDocument()
    })

    it('should redirect to create valuestream if there are currently no valuestreams', () => {
      useAPIContextMock.mockReturnValue({
        organizationList: Organizations.result,
        valueStreamList: [],
        teamList: [],
      })

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(screen.getByTestId('/admin/add-valuestream')).toBeInTheDocument()
    })

    it('should redirect to create team if there are currently no teams', () => {
      useAPIContextMock.mockReturnValue({
        organizationList: Organizations.result,
        valueStreamList: ValueStreams.result,
        teamList: [],
      })

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(screen.getByTestId('/admin/add-team')).toBeInTheDocument()
    })
  })

  describe('global admin redirects', () => {
    beforeEach(() => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isGlobalAdmin: true,
        isOrgAdmin: false,
        isVSAdmin: false,
        isTeamAdmin: false,
        canViewOrganizationMetrics: jest.fn().mockReturnValue(true),
      })
      useAPIContextMock.mockReturnValue({
        organizationList: Organizations.result,
        valueStreamList: ValueStreams.result,
        teamList: Teams.result,
      })
    })

    it('should redirect to local storage redirect if they have access to the entity in local storage', () => {
      useGroupEntityRouteParamsMock.mockReturnValue({
        getPathWithParams,
        getOrgParamsForOrgId: jest
          .fn()
          .mockReturnValue({ organizationName: organization.name }),
        getVSParamsForVSId: jest.fn(),
        getTeamParamsForTeamId: jest.fn(),
      })
      localStorageMock.get.mockReturnValue(organization.id)

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(
        screen.getByTestId(`/delivery-metrics/${organization.name}`),
      ).toBeInTheDocument()
    })

    it('in case of no local storage, it should redirect to first organization dashboard they have access to', () => {
      useGroupEntityRouteParamsMock.mockReturnValue({
        getPathWithParams,
        getOrgParamsForOrgId: jest.fn().mockImplementation((orgId: number) => {
          if (orgId === organization.id)
            return {
              organizationName: organization.name,
            }
          return undefined
        }),
        getVSParamsForVSId: jest.fn(),
        getTeamParamsForTeamId: jest.fn(),
      })
      localStorageMock.get.mockReturnValue(-1)

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(
        screen.getByTestId(`/delivery-metrics/${organization.name}`),
      ).toBeInTheDocument()
    })
  })

  describe('organization admin redirects', () => {
    beforeEach(() => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isGlobalAdmin: false,
        isOrgAdmin: true,
        isVSAdmin: false,
        isTeamAdmin: false,
        canViewOrganizationMetrics: jest.fn().mockReturnValue(true),
      })
      useAPIContextMock.mockReturnValue({
        organizationList: Organizations.result,
        valueStreamList: ValueStreams.result,
        teamList: Teams.result,
      })
    })

    it('should redirect to local storage redirect if they have access to the entity in local storage', () => {
      useGroupEntityRouteParamsMock.mockReturnValue({
        getPathWithParams,
        getOrgParamsForOrgId: jest
          .fn()
          .mockReturnValue({ organizationName: organization.name }),
        getVSParamsForVSId: jest.fn(),
        getTeamParamsForTeamId: jest.fn(),
      })
      localStorageMock.get.mockReturnValue(organization.id)

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(
        screen.getByTestId(`/delivery-metrics/${organization.name}`),
      ).toBeInTheDocument()
    })

    it('in case of no local storage, it should redirect to first dashboard they have access to', () => {
      useGroupEntityRouteParamsMock.mockReturnValue({
        getPathWithParams,
        getOrgParamsForOrgId: jest.fn().mockImplementation((orgId: number) => {
          if (orgId === organization.id)
            return {
              organizationName: organization.name,
            }
          return undefined
        }),
        getVSParamsForVSId: jest.fn(),
        getTeamParamsForTeamId: jest.fn(),
      })
      localStorageMock.get.mockReturnValue(-1)

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(
        screen.getByTestId(`/delivery-metrics/${organization.name}`),
      ).toBeInTheDocument()
    })
  })

  describe('valuestream admin redirects', () => {
    beforeEach(() => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isGlobalAdmin: false,
        isOrgAdmin: false,
        isVSAdmin: true,
        isTeamAdmin: false,
        canViewValueStreamMetrics: jest.fn().mockReturnValue(true),
      })
      useAPIContextMock.mockReturnValue({
        organizationList: Organizations.result,
        valueStreamList: ValueStreams.result,
        teamList: Teams.result,
      })
    })

    it('should redirect to local storage redirect if they have access to the entity in local storage', () => {
      useGroupEntityRouteParamsMock.mockReturnValue({
        getPathWithParams,
        getOrgParamsForOrgId: jest.fn(),
        getVSParamsForVSId: jest.fn().mockReturnValue({
          organizationName: organization.name,
          valueStreamName: valuestream.name,
        }),
        getTeamParamsForTeamId: jest.fn(),
      })
      localStorageMock.get.mockReturnValue(valuestream.id)

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(
        screen.getByTestId(
          `/delivery-metrics/${organization.name}/${valuestream.name}`,
        ),
      ).toBeInTheDocument()
    })

    it('in case of no local storage, it should redirect to first dashboard they have access to', () => {
      useGroupEntityRouteParamsMock.mockReturnValue({
        getPathWithParams,
        getOrgParamsForOrgId: jest.fn(),
        getVSParamsForVSId: jest.fn().mockImplementation(vsId => {
          if (vsId === valuestream.id)
            return {
              organizationName: organization.name,
              valueStreamName: valuestream.name,
            }
          return undefined
        }),
        getTeamParamsForTeamId: jest.fn(),
      })
      localStorageMock.get.mockReturnValue(-1)

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(
        screen.getByTestId(
          `/delivery-metrics/${organization.name}/${valuestream.name}`,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('team admin redirects', () => {
    beforeEach(() => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isGlobalAdmin: false,
        isOrgAdmin: false,
        isVSAdmin: false,
        isTeamAdmin: true,
        canViewTeamMetrics: jest.fn().mockReturnValue(true),
      })
      useAPIContextMock.mockReturnValue({
        organizationList: Organizations.result,
        valueStreamList: ValueStreams.result,
        teamList: Teams.result,
      })
    })

    it('should redirect to local storage redirect if they have access to the entity in local storage', () => {
      useGroupEntityRouteParamsMock.mockReturnValue({
        getPathWithParams,
        getOrgParamsForOrgId: jest.fn(),
        getVSParamsForVSId: jest.fn(),
        getTeamParamsForTeamId: jest.fn().mockReturnValue({
          organizationName: organization.name,
          valueStreamName: valuestream.name,
          teamName: team.name,
        }),
      })
      localStorageMock.get.mockReturnValue(team.id)

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(
        screen.getByTestId(
          `/delivery-metrics/${organization.name}/${valuestream.name}/${team.name}`,
        ),
      ).toBeInTheDocument()
    })

    it('in case of no local storage, it should redirect to first dashboard they have access to', () => {
      useGroupEntityRouteParamsMock.mockReturnValue({
        getPathWithParams,
        getOrgParamsForOrgId: jest.fn(),
        getVSParamsForVSId: jest.fn(),
        getTeamParamsForTeamId: jest.fn().mockImplementation(teamId => {
          if (teamId === team.id)
            return {
              organizationName: organization.name,
              valueStreamName: valuestream.name,
              teamName: team.name,
            }
          return undefined
        }),
      })
      localStorageMock.get.mockReturnValue(-1)

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(
        screen.getByTestId(
          `/delivery-metrics/${organization.name}/${valuestream.name}/${team.name}`,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('random user view', () => {
    it('should render HolocronWelcomeScreen', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isGlobalAdmin: false,
        isOrgAdmin: false,
        isVSAdmin: false,
        isTeamAdmin: false,
      })
      useAPIContextMock.mockReturnValue({
        organizationList: Organizations.result,
        valueStreamList: ValueStreams.result,
        teamList: Teams.result,
      })

      RenderWithWrapper(<HomePage />, { initialEntries: ['/'] })

      expect(screen.getByTestId('HolocronWelcomeScreen')).toBeInTheDocument()
    })
  })
})
