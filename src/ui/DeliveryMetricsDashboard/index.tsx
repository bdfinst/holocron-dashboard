import {
  useCurrentUserPermissions,
  withParamsBasedGroupEntities,
  Organization,
  Team,
  TeamView,
  ValueStream,
} from 'api'
import { Navigate } from 'react-router-dom'
import OrganizationAdminDashboard from './OrganizationAdminDashboard'
import TeamAdminDashboard from './TeamAdminDashboard'
import ValueStreamAdminDashboard from './ValueStreamAdminDashboard'

type DeliveryMetricsDashboardProps = {
  organization?: Organization
  valueStream?: ValueStream
  team?: Team
  teamView?: TeamView
}

export const DeliveryMetricsDashboard = ({
  organization,
  valueStream,
  team,
  teamView,
}: DeliveryMetricsDashboardProps) => {
  const {
    canViewOrganizationMetrics,
    canViewValueStreamMetrics,
    canViewTeamMetrics,
  } = useCurrentUserPermissions()

  if (canViewOrganizationMetrics(organization?.id)) {
    return (
      <OrganizationAdminDashboard
        organization={organization}
        valueStream={valueStream}
        team={team}
        teamView={teamView}
      />
    )
  }

  if (canViewValueStreamMetrics(valueStream?.id)) {
    return (
      <ValueStreamAdminDashboard
        organization={organization}
        valueStream={valueStream}
        team={team}
        teamView={teamView}
      />
    )
  }

  if (canViewTeamMetrics(team?.id)) {
    return (
      <TeamAdminDashboard
        organization={organization}
        valueStream={valueStream}
        team={team}
        teamView={teamView}
      />
    )
  }
  return <Navigate to="/401" />
}

export default withParamsBasedGroupEntities(DeliveryMetricsDashboard)

export { withTeamMetrics, withTeamAdminDashboard } from './TeamAdminDashboard'
export {
  withValueStreamMetrics,
  withValueStreamAdminDashboard,
} from './ValueStreamAdminDashboard'
export {
  withOrganizationMetrics,
  withOrganizationAdminDashboard,
} from './OrganizationAdminDashboard'
export { withDashboardNotReadyHandler } from './DeliveryMetricsDashboardWidgets'
