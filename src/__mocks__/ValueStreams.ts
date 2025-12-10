import { ValueStream } from 'api'
import teams from './Teams'
import { adminUser, leadershipAndVSAdminUser, valueStreamAdmin } from './Users'

export const createValueStream = ({
  id = 1,
  name = 'Holocron',
  users = [valueStreamAdmin],
  teams = [],
  organizationId = 1,
}): ValueStream => ({
  id,
  name,
  organizationId,
  users,
  teams,
})

const MockValueStreams: { result: ValueStream[] } = {
  result: [
    {
      id: 1,
      name: 'Big Bang',
      organizationId: 1,
      teams: teams.result.filter(t => t.valueStreamId === 1),
      users: [valueStreamAdmin, adminUser],
    },
    {
      id: 2,
      name: 'Party Bus',
      organizationId: 1,
      teams: teams.result.filter(t => t.valueStreamId === 2),
      users: [adminUser, valueStreamAdmin, leadershipAndVSAdminUser],
    },
    {
      id: 3,
      name: 'CNAP',
      organizationId: 1,
      teams: teams.result.filter(t => t.valueStreamId === 3),
      users: [adminUser],
    },
    {
      id: 4,
      name: 'Another VS',
      organizationId: 2,
      teams: teams.result.filter(t => t.valueStreamId === 4),
      users: [adminUser],
    },
  ],
}

export default MockValueStreams
