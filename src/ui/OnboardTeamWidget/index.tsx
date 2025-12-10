import {
  withAPIData,
  withCurrentUserPermission,
  withParamsBasedGroupEntities,
  useCollectorTargetsContext,
} from 'api'
import OnboardTeamWidget from './OnboardTeamWidget'
import TeamForm, { usePreviousTeamData } from './TeamForm'

const withPreviousTeamData = withAPIData({
  useAPIData: usePreviousTeamData,
})

const CreateTeamFormWrapper = (props: any) => {
  const { ticketBoards, repositories, pipelines, projects, isLoading, error } =
    useCollectorTargetsContext() // Correct hook name

  return (
    <TeamForm
      {...props}
      ticketBoards={ticketBoards}
      repositories={repositories}
      pipelines={pipelines}
      projects={projects}
      isLoading={isLoading}
      error={error}
    />
  )
}

const withCreateTeamPermission = withCurrentUserPermission({
  permission: 'canCreateTeam',
})

const withUpdateTeamPermission = withCurrentUserPermission({
  permission: 'canUpdateTeam',
  permissionTarget: 'team',
})

export const CreateTeamForm = withCreateTeamPermission(CreateTeamFormWrapper)

export const UpdateTeamForm = withParamsBasedGroupEntities(
  withUpdateTeamPermission(withPreviousTeamData(TeamForm)),
)

export default OnboardTeamWidget
