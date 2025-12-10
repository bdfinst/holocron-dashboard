import { Organization } from 'api'
import {
  adminUser,
  leadershipAndOrgAdminUser,
  organizationAdmin,
} from './Users'
import valueStreams from './ValueStreams'

export const createOrganization = ({
  id = 1,
  name = 'foo-bar',
  valueStreams = [],
  users = [adminUser],
}): Organization => ({
  id,
  name,
  valueStreams,
  users,
})

const MockOrganizations: { result: Organization[] } = {
  result: [
    {
      id: 1,
      name: 'Platform One',
      valueStreams: valueStreams.result.filter(v => v.organizationId === 1),
      users: [adminUser, organizationAdmin, leadershipAndOrgAdminUser],
    },
    {
      id: 2,
      name: 'Another Organization',
      valueStreams: valueStreams.result.filter(v => v.organizationId === 2),
      users: [adminUser],
    },
  ],
}

export default MockOrganizations
