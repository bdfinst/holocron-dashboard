import { withParamsBasedGroupEntities, withCurrentUserPermission } from 'api'
import OnboardValueStreamWidget from './OnboardValueStreamWidget'

import ValueStreamForm from './ValueStreamForm'

const withCreateValueStreamPermission = withCurrentUserPermission({
  permission: 'canCreateValueStream',
})

const withUpdateValueStreamPermission = withCurrentUserPermission({
  permission: 'canUpdateValueStream',
  permissionTarget: 'valueStream',
})

export const CreateValueStreamForm =
  withCreateValueStreamPermission(ValueStreamForm)

export const UpdateValueStreamForm = withParamsBasedGroupEntities(
  withUpdateValueStreamPermission(ValueStreamForm),
)

export default OnboardValueStreamWidget
