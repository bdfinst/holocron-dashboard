import { withFeatureFlag } from 'api'
import UploadTeamMembersFile from './UploadTeamMembersFile'

export default withFeatureFlag({
  featureFlagName: 'FEATURE_EXTERNAL_CONTRIBUTORS',
  WrappedComponent: UploadTeamMembersFile,
  FeatureNotAllowedComponent: () => null,
})
