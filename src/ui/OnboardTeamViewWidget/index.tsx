import {
  withAPIData,
  withCurrentUserPermission,
  withFeatureFlag,
  withParamsBasedGroupEntities,
  CollectorTargetsProvider,
  useCollectorTargetsContext,
} from 'api'
import OnboardTeamViewWidget from './OnboardTeamViewWidget'
import TeamViewForm, { usePreviousTeamViewData } from './TeamViewForm'

const CreateTeamViewFormWrapper = (props: any) => {
  const collectorTargets = useCollectorTargetsContext()
  return <TeamViewForm {...props} {...collectorTargets} />
}

const UpdateTeamViewFormWrapper = (props: any) => {
  const collectorTargets = useCollectorTargetsContext()
  return <TeamViewForm {...props} {...collectorTargets} />
}

const withPreviousTeamViewData = withAPIData({
  useAPIData: usePreviousTeamViewData,
})

const withUpdateTeamPermission = withCurrentUserPermission({
  permission: 'canUpdateTeam',
  permissionTarget: 'team',
})

export const CreateTeamViewForm = withFeatureFlag({
  featureFlagName: 'FEATURE_TEAM_VIEWS',
  WrappedComponent: withParamsBasedGroupEntities(
    withUpdateTeamPermission(props => (
      <CollectorTargetsProvider>
        <CreateTeamViewFormWrapper {...props} />
      </CollectorTargetsProvider>
    )),
  ),
})

export const UpdateTeamViewForm = withFeatureFlag({
  featureFlagName: 'FEATURE_TEAM_VIEWS',
  WrappedComponent: withParamsBasedGroupEntities(
    withUpdateTeamPermission(
      withPreviousTeamViewData(props => (
        <CollectorTargetsProvider>
          <UpdateTeamViewFormWrapper {...props} />
        </CollectorTargetsProvider>
      )),
    ),
  ),
})

export default withFeatureFlag({
  featureFlagName: 'FEATURE_TEAM_VIEWS',
  WrappedComponent: OnboardTeamViewWidget,
  FeatureNotAllowedComponent: () => null,
})
