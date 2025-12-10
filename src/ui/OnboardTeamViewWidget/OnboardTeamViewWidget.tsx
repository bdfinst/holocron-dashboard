import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from '@mui/material'
import GroupEntityDeleteButton from 'utils/GroupEntityDeleteButton'
import {
  GroupEntityViewCostMetricsButton,
  GroupEntityViewMetricsButton,
  GroupEntityUpdateButton,
} from 'utils/GroupEntityLinkButtons'
import { AddCircleIcon } from 'utils/icons'
import {
  useCurrentUserPermissions,
  useGroupEntityRouteParams,
  useAPIContext,
  deleteTeamView,
  Team,
  TeamView,
} from 'api'
import { Link } from 'react-router-dom'

export type OnboardTeamViewWidgetProps = {
  team: Team
}

const OnboardTeamViewWidget = ({ team }: OnboardTeamViewWidgetProps) => {
  const { teamViews, featureFlags } = useAPIContext()
  const { canViewTeamCostMetrics } = useCurrentUserPermissions()
  const { getTeamParamsForTeamId } = useGroupEntityRouteParams()
  const { organizationName, valueStreamName } = getTeamParamsForTeamId(team.id)

  return (
    <Stack spacing={1}>
      <Link
        to={`/admin/add-team-view/${organizationName}/${valueStreamName}/${team.name}`}
        style={{ textDecoration: 'none' }}
      >
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          aria-label="Add team view"
          size="small"
        >
          Add team view
        </Button>
      </Link>
      <List>
        {teamViews
          .filter(teamView => teamView.viewOwnerId === team.id)
          .map(teamView => (
            <ListItem key={teamView.id}>
              <ListItemButton>
                <ListItemText primary={teamView.name} />
                <Stack
                  direction={{ sm: 'row', xs: 'column' }}
                  spacing={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  <GroupEntityDeleteButton<TeamView>
                    canDelete
                    apiDeleteFn={deleteTeamView}
                    groupEntityCategory="team view"
                    groupEntity={teamView}
                  />
                  <GroupEntityUpdateButton
                    hasAccess
                    groupEntityName={teamView.name}
                    groupEntityCategory="team view"
                    link={`/admin/update-team-view/${organizationName}/${valueStreamName}/${team.name}/${teamView.name}`}
                  />
                  <GroupEntityViewMetricsButton
                    hasAccess
                    groupEntityName={teamView.name}
                    groupEntityCategory="team view"
                    link={`/delivery-metrics/${organizationName}/${valueStreamName}/${team.name}/${teamView.name}`}
                  />
                  {featureFlags.FEATURE_COST_METRICS &&
                    canViewTeamCostMetrics(team.id) && (
                      <GroupEntityViewCostMetricsButton
                        hasAccess
                        groupEntityName={teamView.name}
                        groupEntityCategory="team view"
                        link={`/costs/${organizationName}/${valueStreamName}/${team.name}/${teamView.name}`}
                      />
                    )}
                </Stack>
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </Stack>
  )
}

export default OnboardTeamViewWidget
