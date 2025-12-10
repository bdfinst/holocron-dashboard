import { withCurrentUserPermission, withParamsBasedGroupEntities } from 'api'
import OnboardOrganizationWidget from './OnboardOrganizationWidget'

import OrganizationForm from './OrganizationForm'

const withCreateOrganizationPermission = withCurrentUserPermission({
  permission: 'canCreateOrganization',
})

const withUpdateOrganizationPermission = withCurrentUserPermission({
  permission: 'canUpdateOrganization',
  permissionTarget: 'organization',
})

export const CreateOrganizationForm =
  withCreateOrganizationPermission(OrganizationForm)

export const UpdateOrganizationForm = withParamsBasedGroupEntities(
  withUpdateOrganizationPermission(OrganizationForm),
)

export default OnboardOrganizationWidget
