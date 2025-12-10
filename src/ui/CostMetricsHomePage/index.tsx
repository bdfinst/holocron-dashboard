import { withNoGroupEntitiesHandler, getUsersDashboardPath } from 'ui/HomePage'
import {
  useCurrentUserPermissions,
  useAPIContext,
  useGroupEntityRouteParams,
  OrganizationDetails,
  ValueStreamDetails,
  TeamDetails,
  withFeatureFlag,
} from 'api'
import { Navigate } from 'react-router-dom'
import localStorageConfig from 'localStorageConfig'

const COST_DASHBOARD_BASE_PATH = '/costs'

const CostMetricsHomePage = () => {
  const { organizationList, valueStreamList, teamList } = useAPIContext()
  const {
    getPathWithParams,
    getTeamParamsForTeamId,
    getVSParamsForVSId,
    getOrgParamsForOrgId,
  } = useGroupEntityRouteParams()
  const {
    isOrgLeadership,
    isGlobalAdmin,
    isOrgAdmin,
    isVSAdmin,
    isTeamAdmin,
    canViewOrganizationCostMetrics,
    canViewValueStreamCostMetrics,
    canViewTeamCostMetrics,
  } = useCurrentUserPermissions()

  if (isOrgLeadership && (isGlobalAdmin || isOrgAdmin)) {
    return (
      <Navigate
        to={getUsersDashboardPath(
          localStorageConfig.COST_ORGANIZATION_ID,
          organizationList,
          canViewOrganizationCostMetrics,
          getOrgParamsForOrgId,
          ({ organizationName }: OrganizationDetails) =>
            `${COST_DASHBOARD_BASE_PATH}/${organizationName}`,
          getPathWithParams,
        )}
      />
    )
  }

  if (isOrgLeadership && isVSAdmin) {
    return (
      <Navigate
        to={getUsersDashboardPath(
          localStorageConfig.COST_VALUESTREAM_ID,
          valueStreamList,
          canViewValueStreamCostMetrics,
          getVSParamsForVSId,
          ({ organizationName, valueStreamName }: ValueStreamDetails) =>
            `${COST_DASHBOARD_BASE_PATH}/${organizationName}/${valueStreamName}`,
          getPathWithParams,
        )}
      />
    )
  }

  if (isOrgLeadership && isTeamAdmin) {
    return (
      <Navigate
        to={getUsersDashboardPath(
          localStorageConfig.COST_TEAM_ID,
          teamList,
          canViewTeamCostMetrics,
          getTeamParamsForTeamId,
          ({ organizationName, valueStreamName, teamName }: TeamDetails) =>
            `${COST_DASHBOARD_BASE_PATH}/${organizationName}/${valueStreamName}/${teamName}`,
          getPathWithParams,
        )}
      />
    )
  }

  return <Navigate to="/401" />
}

export default withFeatureFlag({
  featureFlagName: 'FEATURE_COST_METRICS',
  WrappedComponent: withNoGroupEntitiesHandler(CostMetricsHomePage),
})
