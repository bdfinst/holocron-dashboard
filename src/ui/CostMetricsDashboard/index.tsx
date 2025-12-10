import {
  useCurrentUserPermissions,
  withFeatureFlag,
  withParamsBasedGroupEntities,
  Organization,
  Team,
  TeamView,
  ValueStream,
} from 'api'
import { Navigate } from 'react-router-dom'
import {
  withOrganizationAdminDashboard,
  withOrganizationMetrics,
  withValueStreamAdminDashboard,
  withValueStreamMetrics,
  withTeamAdminDashboard,
  withTeamMetrics,
} from 'ui/DeliveryMetricsDashboard'
import localStorageConfig from 'localStorageConfig'
import CostDashboardWidgets from './CostDashboardWidgets'

const DASHBOARD_BASE_PATH = '/costs'

const OrganizationAdminCostDashboard = withOrganizationMetrics(
  withOrganizationAdminDashboard({
    dashboardHomePagePath: DASHBOARD_BASE_PATH,
    permissionFunctionNames: {
      canViewOrganizationDashboardFunctionName:
        'canViewOrganizationCostMetrics',
      canViewValueStreamDashboardFunctionName: 'canViewValueStreamCostMetrics',
      canViewTeamDashboardFunctionName: 'canViewTeamCostMetrics',
    },
    organizationIDLocalStorageKey: localStorageConfig.COST_ORGANIZATION_ID,
    DashboardWidgets: CostDashboardWidgets,
  }),
)

const ValueStreamAdminCostDashboard = withValueStreamMetrics(
  withValueStreamAdminDashboard({
    dashboardHomePagePath: DASHBOARD_BASE_PATH,
    permissionFunctionNames: {
      canViewValueStreamDashboardFunctionName: 'canViewValueStreamCostMetrics',
      canViewTeamDashboardFunctionName: 'canViewTeamCostMetrics',
    },
    valueStreamIDLocalStorageKey: localStorageConfig.COST_VALUESTREAM_ID,
    DashboardWidgets: CostDashboardWidgets,
  }),
)

const TeamAdminCostDashboard = withTeamMetrics(
  withTeamAdminDashboard({
    dashboardHomePagePath: DASHBOARD_BASE_PATH,
    permissionFunctionNames: {
      canViewTeamDashboardFunctionName: 'canViewTeamCostMetrics',
    },
    teamIDLocalStorageKey: localStorageConfig.COST_TEAM_ID,
    DashboardWidgets: CostDashboardWidgets,
  }),
)

type CostMetricsDashboardProps = {
  organization?: Organization
  valueStream?: ValueStream
  team?: Team
  teamView?: TeamView
}

export const CostMetricsDashboard = ({
  organization,
  valueStream,
  team,
  teamView,
}: CostMetricsDashboardProps) => {
  const {
    canViewOrganizationCostMetrics,
    canViewValueStreamCostMetrics,
    canViewTeamCostMetrics,
  } = useCurrentUserPermissions()

  if (canViewOrganizationCostMetrics(organization?.id)) {
    return (
      <OrganizationAdminCostDashboard
        organization={organization}
        valueStream={valueStream}
        team={team}
        teamView={teamView}
      />
    )
  }

  if (canViewValueStreamCostMetrics(valueStream?.id)) {
    return (
      <ValueStreamAdminCostDashboard
        organization={organization}
        valueStream={valueStream}
        team={team}
        teamView={teamView}
      />
    )
  }

  if (canViewTeamCostMetrics(team?.id)) {
    return (
      <TeamAdminCostDashboard
        organization={organization}
        valueStream={valueStream}
        team={team}
        teamView={teamView}
      />
    )
  }

  return <Navigate to="/401" />
}

export default withFeatureFlag({
  featureFlagName: 'FEATURE_COST_METRICS',
  WrappedComponent: withParamsBasedGroupEntities(CostMetricsDashboard),
})
