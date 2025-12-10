import { render, screen } from '@testing-library/react'
import MockOrganizations from '__mocks__/Organizations'
import {
  useAPIContext,
  useCurrentUserPermissions,
  useParamsBasedGroupEntities,
} from './hooks'
import withAPIData, {
  withCurrentUserPermission,
  withFeatureFlag,
  withParamsBasedGroupEntities,
} from './HigherOrderComponents'

jest.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid={to} />,
}))

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useAPIContext: jest.fn(),
  useCurrentUserPermissions: jest.fn(),
  useParamsBasedGroupEntities: jest.fn(),
}))

const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock
const useParamsBasedGroupEntitiesMock = useParamsBasedGroupEntities as jest.Mock
const useAPIContextMock = useAPIContext as jest.Mock

const useAPIData = jest.fn()

const [mockOrganization] = MockOrganizations.result

describe('withAPIData', () => {
  afterEach(() => {
    useAPIData.mockReset()
  })

  it('should show loading screen if it is initially loading', async () => {
    useAPIData.mockReturnValue({
      isLoading: true,
      isRefetching: false,
      hasErrored: false,
      hasErroredOnRefetch: false,
      data: null,
    })

    const MockComponent = withAPIData({
      useAPIData,
    })(() => <div data-testid="foo-bar" />)

    render(<MockComponent />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should show loading screen if it is refetch loading and needsToLoadOnRefetch is true', () => {
    useAPIData.mockReturnValue({
      isLoading: false,
      isRefetching: true,
      hasErrored: false,
      hasErroredOnRefetch: false,
      data: null,
    })

    const MockComponent = withAPIData({
      useAPIData,
    })(() => <div data-testid="foo-bar" />)

    render(<MockComponent />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should allow the overriding of loading component', () => {
    useAPIData.mockReturnValue({
      isLoading: true,
      isRefetching: false,
      hasErrored: false,
      hasErroredOnRefetch: false,
      data: null,
    })

    const MockComponent = withAPIData({
      useAPIData,
      LoadingComponent: () => <div data-testid="LoadingComponent" />,
    })(() => <div data-testid="foo-bar" />)

    render(<MockComponent />)

    expect(screen.getByTestId('LoadingComponent')).toBeInTheDocument()
  })

  it('should show error screen if the fetch errored and is not a refetch error', () => {
    useAPIData.mockReturnValue({
      isLoading: false,
      isRefetching: false,
      hasErrored: true,
      hasErroredOnRefetch: false,
      data: null,
    })

    const MockComponent = withAPIData({
      useAPIData,
    })(() => <div data-testid="foo-bar" />)

    render(<MockComponent />)

    expect(screen.getByLabelText('error-title')).toHaveTextContent('Error')
    expect(screen.getByLabelText('error-message')).toHaveTextContent(
      'Error Fetching Data',
    )
  })

  it('should show error on the screen if the fetch errored and it is a refetch error where needsToLoadOnRefetch is true', () => {
    useAPIData.mockReturnValue({
      isLoading: false,
      isRefetching: false,
      hasErrored: false,
      hasErroredOnRefetch: true,
      data: null,
    })

    const MockComponent = withAPIData({
      useAPIData,
    })(() => <div data-testid="foo-bar" />)

    render(<MockComponent />)

    expect(screen.getByLabelText('error-title')).toHaveTextContent('Error')
    expect(screen.getByLabelText('error-message')).toHaveTextContent(
      'Error Fetching Data',
    )
  })

  it('should allow the overriding of error component', () => {
    useAPIData.mockReturnValue({
      isLoading: false,
      isRefetching: false,
      hasErrored: true,
      hasErroredOnRefetch: false,
      data: null,
    })

    const MockComponent = withAPIData({
      useAPIData,
      ErrorComponent: () => <div data-testid="ErrorComponent" />,
    })(() => <div data-testid="foo-bar" />)

    render(<MockComponent />)

    expect(screen.getByTestId('ErrorComponent')).toBeInTheDocument()
  })

  it('should otherwise show the component to render', () => {
    useAPIData.mockReturnValue({
      isLoading: false,
      isRefetching: false,
      hasErrored: false,
      hasErroredOnRefetch: false,
      data: 'foo-bar',
    })

    const MockComponent = withAPIData({
      useAPIData,
    })(() => <div data-testid="foo-bar" />)

    render(<MockComponent />)

    expect(screen.getByTestId('foo-bar')).toBeInTheDocument()
  })
})

describe('withFeatureFlag', () => {
  const WrappedComponent = () => <div data-testid="WrappedComponent" />

  afterEach(() => {
    useAPIContextMock.mockRestore()
  })

  it('should show the FeatureNotFoundComponent if feature is disabled', () => {
    useAPIContextMock.mockReturnValue({
      featureFlags: { FEATURE: false },
    } as unknown as ReturnType<typeof useAPIContext>)

    const MockComponent = withFeatureFlag({
      featureFlagName: 'FEATURE',
      WrappedComponent,
    })

    render(<MockComponent />)

    expect(screen.getByTestId('/404')).toBeInTheDocument()
  })

  it('should otherwise show the component', () => {
    useAPIContextMock.mockReturnValue({
      featureFlags: { FEATURE: true },
    } as unknown as ReturnType<typeof useAPIContext>)

    const MockComponent = withFeatureFlag({
      featureFlagName: 'FEATURE',
      WrappedComponent,
    })

    render(<MockComponent />)

    expect(screen.getByTestId('WrappedComponent')).toBeInTheDocument()
  })

  it('should allow default feature not allowed component to be able to be modified', () => {
    useAPIContextMock.mockReturnValue({
      featureFlags: { FEATURE: false },
    } as unknown as ReturnType<typeof useAPIContext>)

    const MockComponent = withFeatureFlag({
      featureFlagName: 'FEATURE',
      WrappedComponent,
      FeatureNotAllowedComponent: () => <div data-testid="FooBar" />,
    })

    render(<MockComponent />)

    expect(screen.getByTestId('FooBar')).toBeInTheDocument()
  })
})

describe('withCurrentUserPermission', () => {
  describe('permission as property', () => {
    it('should render the component if permission as property is satisfied', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        isGlobalAdmin: true,
      })

      const withGlobalAdminPermission = withCurrentUserPermission({
        permission: 'isGlobalAdmin',
      })

      const Component = withGlobalAdminPermission(() => (
        <div data-testid="Component" />
      ))
      render(<Component />)
      expect(screen.getByTestId('Component')).toBeInTheDocument()
    })
  })

  describe('permission as function with no arguments', () => {
    useCurrentUserPermissionsMock.mockReturnValue({
      canCreateOrganization: jest.fn().mockReturnValue(true),
    })

    const withCreateOrganizationPermission = withCurrentUserPermission({
      permission: 'canCreateOrganization',
    })
    const Component = withCreateOrganizationPermission(() => (
      <div data-testid="Component" />
    ))

    render(<Component />)
    expect(screen.getByTestId('Component')).toBeInTheDocument()
  })

  describe('permission to a permission target', () => {
    it('should render component if user has permission to a permission target', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canUpdateOrganization: jest.fn().mockReturnValue(true),
      })

      const withUpdateOrganizationPermission = withCurrentUserPermission({
        permission: 'canUpdateOrganization',
        permissionTarget: 'organization',
      })

      const Component = withUpdateOrganizationPermission(() => (
        <div data-testid="Component" />
      ))
      render(<Component organization={mockOrganization} />)
      expect(screen.getByTestId('Component')).toBeInTheDocument()
    })
  })

  describe('permission denied case', () => {
    it('should otherwise redirect to /401', () => {
      useCurrentUserPermissionsMock.mockReturnValue({
        canUpdateOrganization: jest.fn().mockReturnValue(false),
      })

      const withCreateOrganizationPermission = withCurrentUserPermission({
        permission: 'canUpdateOrganization',
        permissionTarget: 'organization',
      })

      const Component = withCreateOrganizationPermission(() => (
        <div data-testid="Component" />
      ))
      render(<Component organization={mockOrganization} />)
      expect(screen.getByTestId('/401')).toBeInTheDocument()
    })
  })
})

describe('withParamsBasedEntities', () => {
  it('should redirect to 404 if route is not found', () => {
    useParamsBasedGroupEntitiesMock.mockReturnValue({ routeNotFound: true })

    const Component = withParamsBasedGroupEntities(() => (
      <div data-testid="Component" />
    ))
    render(<Component />)
    expect(screen.getByTestId('/404')).toBeInTheDocument()
  })

  it('should otherwise render the component', () => {
    useParamsBasedGroupEntitiesMock.mockReturnValue({
      routeNotFound: false,
      organization: mockOrganization,
    })

    const Component = withParamsBasedGroupEntities(() => (
      <div data-testid="Component" />
    ))
    render(<Component />)
    expect(screen.queryByTestId('/404')).not.toBeInTheDocument()
    expect(screen.getByTestId('Component')).toBeInTheDocument()
  })
})
