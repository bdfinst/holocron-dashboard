import {
  GroupEntity,
  useCurrentUserPermissions,
  useAPIContext,
  useGroupEntityRouteParams,
  OrganizationDetails,
  ValueStreamDetails,
  TeamDetails,
  GroupEntityDetails,
} from 'api'
import { Navigate } from 'react-router-dom'
import * as localStorage from 'local-storage'
import localStorageConfig from 'localStorageConfig'
import HolocronWelcomeScreen from './HolocronWelcomeScreen'

const BASE_PATH_DASHBOARD = '/delivery-metrics'

const getLocalStorageGroupEntityId = (
  groupEntities: GroupEntity[],
  localStorageKey: string,
) => {
  const groupEntityId = localStorage.get<number>(localStorageKey)
  if (groupEntities.some(entity => entity.id === groupEntityId)) {
    return groupEntityId
  }
  return -1
}

export const getUsersDashboardPath = (
  localStorageGroupEntityIdKey: string,
  groupEntities: GroupEntity[],
  hasAccess: (groupEntityId: number) => boolean,
  getGroupEntityParamsForGroupEntityId: (
    groupEntityId: number,
  ) => GroupEntityDetails | undefined,
  pathMaker: (params: GroupEntityDetails) => string,
  getPathWithParams: (
    pathMaker: (params: GroupEntityDetails) => string,
    params?: GroupEntityDetails,
  ) => string,
) => {
  const localStorageGroupEntityId = getLocalStorageGroupEntityId(
    groupEntities,
    localStorageGroupEntityIdKey,
  )
  const localStorageGroupEntityParams = getGroupEntityParamsForGroupEntityId(
    localStorageGroupEntityId,
  )
  if (!localStorageGroupEntityParams || !hasAccess(localStorageGroupEntityId)) {
    const [firstGroupEntityTheyHaveAccessTo] = groupEntities.filter(entity =>
      hasAccess(entity.id),
    )
    const newParams = getGroupEntityParamsForGroupEntityId(
      firstGroupEntityTheyHaveAccessTo.id,
    )
    return getPathWithParams(pathMaker, newParams)
  }
  return getPathWithParams(pathMaker, localStorageGroupEntityParams)
}

export const withNoGroupEntitiesHandler = <Props extends object>(
  WrappedComponent: React.ComponentType<Props>,
) => {
  const NoGroupEntitiesHandler = (props?: Props) => {
    const { organizationList, valueStreamList, teamList } = useAPIContext()
    if (organizationList.length === 0) {
      return <Navigate to="/admin/add-organization" />
    }
    if (valueStreamList.length === 0) {
      return <Navigate to="/admin/add-valuestream" />
    }
    if (teamList.length === 0) {
      return <Navigate to="/admin/add-team" />
    }
    return <WrappedComponent {...props} />
  }
  return NoGroupEntitiesHandler
}

const HomePage = () => {
  const { organizationList, valueStreamList, teamList } = useAPIContext()
  const {
    getPathWithParams,
    getTeamParamsForTeamId,
    getVSParamsForVSId,
    getOrgParamsForOrgId,
  } = useGroupEntityRouteParams()
  const {
    isGlobalAdmin,
    isOrgAdmin,
    isVSAdmin,
    isTeamAdmin,
    canViewOrganizationMetrics,
    canViewValueStreamMetrics,
    canViewTeamMetrics,
  } = useCurrentUserPermissions()

  if (isGlobalAdmin || isOrgAdmin) {
    return (
      <Navigate
        to={getUsersDashboardPath(
          localStorageConfig.ORGANIZATION_ID,
          organizationList,
          canViewOrganizationMetrics,
          getOrgParamsForOrgId,
          ({ organizationName }: OrganizationDetails) =>
            `${BASE_PATH_DASHBOARD}/${organizationName}`,
          getPathWithParams,
        )}
      />
    )
  }

  if (isVSAdmin) {
    return (
      <Navigate
        to={getUsersDashboardPath(
          localStorageConfig.VALUESTREAM_ID,
          valueStreamList,
          canViewValueStreamMetrics,
          getVSParamsForVSId,
          ({ organizationName, valueStreamName }: ValueStreamDetails) =>
            `${BASE_PATH_DASHBOARD}/${organizationName}/${valueStreamName}`,
          getPathWithParams,
        )}
      />
    )
  }

  if (isTeamAdmin) {
    return (
      <Navigate
        to={getUsersDashboardPath(
          localStorageConfig.TEAM_ID,
          teamList,
          canViewTeamMetrics,
          getTeamParamsForTeamId,
          ({ organizationName, valueStreamName, teamName }: TeamDetails) =>
            `${BASE_PATH_DASHBOARD}/${organizationName}/${valueStreamName}/${teamName}`,
          getPathWithParams,
        )}
      />
    )
  }

  return <HolocronWelcomeScreen />
}

export default withNoGroupEntitiesHandler(HomePage)
