import { Navigate } from 'react-router-dom'
import { Alert, AlertTitle, Typography } from '@mui/material'
import { Organization, Team, ValueStream } from './api'
import {
  useAPIContext,
  useCurrentUserPermissions,
  useParamsBasedGroupEntities,
} from './hooks'
import HolocronLoadingScreen from './HolocronLoadingScreen'

const DefaultErrorUI = () => (
  <Alert severity="error" variant="outlined">
    <AlertTitle aria-label="error-title">Error</AlertTitle>
    <Typography aria-label="error-message">Error Fetching Data</Typography>
  </Alert>
)

export type useAPIDataType<APIData, Args = unknown> = (args?: Args) => {
  data: APIData
  isLoading: boolean
  hasErrored: boolean
  isRefetching: boolean
  hasErroredOnRefetch: boolean
}

export default function withAPIData<APIData extends object>({
  useAPIData,
  LoadingComponent = HolocronLoadingScreen,
  ErrorComponent = DefaultErrorUI,
}: {
  useAPIData: useAPIDataType<APIData>
  LoadingComponent?: React.ComponentType
  ErrorComponent?: React.ComponentType
}) {
  return <Props extends object>(
    WrappedComponent: React.ComponentType<APIData & Props>,
  ) => {
    const Component: React.ComponentType<Props> = (props?: Props) => {
      const { data, isLoading, hasErrored, isRefetching, hasErroredOnRefetch } =
        useAPIData(props)

      if (isLoading || isRefetching) {
        return <LoadingComponent />
      }

      if (hasErrored || hasErroredOnRefetch) {
        return <ErrorComponent />
      }

      return <WrappedComponent {...data} {...props} />
    }
    return Component
  }
}

const DefaultFeatureNotAllowedComponent = () => <Navigate to="/404" />

export const withFeatureFlag = <Props extends object>({
  featureFlagName,
  WrappedComponent,
  FeatureNotAllowedComponent = DefaultFeatureNotAllowedComponent,
}: {
  featureFlagName: string
  FeatureNotAllowedComponent?: React.ComponentType<Props>
  WrappedComponent: React.ComponentType<Props>
}) => {
  const FeatureFlaggedComponent = (props?: Props) => {
    const { featureFlags } = useAPIContext()
    if (featureFlagName in featureFlags && featureFlags[featureFlagName]) {
      return <WrappedComponent {...props} />
    }
    return <FeatureNotAllowedComponent {...props} />
  }
  return FeatureFlaggedComponent
}

export const withParamsBasedGroupEntities = <Props extends object>(
  WrappedComponent: React.ComponentType<
    Omit<ReturnType<typeof useParamsBasedGroupEntities>, 'routeNotFound'> &
      Props
  >,
) => {
  const Component = (props?: Props) => {
    const { routeNotFound, ...paramsBasedEntities } =
      useParamsBasedGroupEntities()
    if (routeNotFound) {
      return <Navigate to="/404" />
    }

    return <WrappedComponent {...paramsBasedEntities} {...props} />
  }
  return Component
}

export const withCurrentUserPermission =
  ({
    permission,
    permissionTarget,
  }: {
    permission: keyof ReturnType<typeof useCurrentUserPermissions>
    permissionTarget?: 'organization' | 'valueStream' | 'team'
  }) =>
  <
    Props extends {
      organization?: Organization
      valueStream?: ValueStream
      team?: Team
    },
  >(
    WrappedComponent: React.ComponentType<Props>,
  ) => {
    const Component = (props?: Props) => {
      const { [permission]: hasAccess } = useCurrentUserPermissions()
      if (typeof hasAccess === 'boolean' && hasAccess) {
        return <WrappedComponent {...props} />
      }

      if (
        typeof hasAccess !== 'boolean' &&
        !permissionTarget &&
        (hasAccess as () => boolean)()
      ) {
        return <WrappedComponent {...props} />
      }

      if (typeof hasAccess !== 'boolean' && !!permissionTarget && !!props) {
        const { [permissionTarget]: target } = props
        if (hasAccess(target?.id)) {
          return <WrappedComponent {...props} />
        }
      }

      return <Navigate to="/401" />
    }
    return Component
  }
