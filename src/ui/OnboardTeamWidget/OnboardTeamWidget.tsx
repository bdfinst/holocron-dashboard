import { Stack, TableCell, TableRow } from '@mui/material'
import {
  useGroupEntityRouteParams,
  useCurrentUserPermissions,
  useAPIContext,
  Team,
  deleteTeam,
} from 'api'
import { useCallback } from 'react'
import GroupEntityDeleteButton from 'utils/GroupEntityDeleteButton'
import GroupEntityTable from 'utils/GroupEntityTable'
import {
  GroupEntityUpdateButton,
  GroupEntityViewCostMetricsButton,
  GroupEntityViewMetricsButton,
} from 'utils/GroupEntityLinkButtons'

const OnboardTeamWidget = () => {
  const { teamList, featureFlags } = useAPIContext()
  const {
    canCreateTeam,
    canUpdateTeam,
    canDeleteTeam,
    canViewTeamMetrics,
    canViewTeamCostMetrics,
  } = useCurrentUserPermissions()
  const { getTeamParamsForTeamId } = useGroupEntityRouteParams()

  const renderRow = useCallback(
    (team: Team) => {
      const { organizationName, valueStreamName } = getTeamParamsForTeamId(
        team.id,
      )
      return (
        <TableRow key={team.id}>
          <TableCell>{organizationName}</TableCell>
          <TableCell>{valueStreamName}</TableCell>
          <TableCell>{team.name}</TableCell>
          <TableCell>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="center"
              alignItems="center"
            >
              <GroupEntityDeleteButton<Team>
                canDelete={canDeleteTeam(team.id)}
                apiDeleteFn={deleteTeam}
                groupEntityCategory="team"
                groupEntity={team}
              />
              <GroupEntityUpdateButton
                hasAccess={canUpdateTeam(team.id)}
                groupEntityName={team.name}
                groupEntityCategory="team"
                link={`/admin/update-team/${organizationName}/${valueStreamName}/${team.name}`}
              />
              <GroupEntityViewMetricsButton
                hasAccess={canViewTeamMetrics(team.id)}
                groupEntityName={team.name}
                groupEntityCategory="team"
                link={`/delivery-metrics/${organizationName}/${valueStreamName}/${team.name}`}
              />
              {featureFlags.FEATURE_COST_METRICS &&
                canViewTeamCostMetrics(team.id) && (
                  <GroupEntityViewCostMetricsButton
                    hasAccess
                    groupEntityName={team.name}
                    groupEntityCategory="team"
                    link={`/costs/${organizationName}/${valueStreamName}/${team.name}`}
                  />
                )}
            </Stack>
          </TableCell>
        </TableRow>
      )
    },
    [
      canUpdateTeam,
      canDeleteTeam,
      getTeamParamsForTeamId,
      canViewTeamMetrics,
      canViewTeamCostMetrics,
      featureFlags.FEATURE_COST_METRICS,
    ],
  )

  return (
    <GroupEntityTable<Team>
      canCreate={canCreateTeam()}
      columns={[
        {
          title: 'Organization',
          tipText: 'Group of related Value Streams',
          align: 'left',
        },
        {
          title: 'Value Stream',
          tipText: 'Collection of related products',
          align: 'left',
        },
        {
          title: 'Team',
          tipText: 'Responsible for one or more products',
          align: 'left',
        },
        {
          title: 'Actions',
          align: 'center',
        },
      ]}
      entities={teamList}
      groupEntityCategory="team"
      addGroupEntityLink="/admin/add-team"
      renderRow={renderRow}
    />
  )
}

export default OnboardTeamWidget
