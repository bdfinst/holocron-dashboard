import { Team } from 'api'
import { adminUser, leadershipAndTeamAdminUser, teamAdmin } from './Users'

export const createTeam = ({
  id = 1,
  name = 'Holocron',
  collectorTargets = [],
  teamSize = 6,
  users = [teamAdmin],
  valueStreamId = 1,
  isWorkflowOnly = false,
}): Team => ({
  id,
  name,
  collectorTargets,
  teamSize,
  users,
  valueStreamId,
  isWorkflowOnly,
})

const MockTeams: { result: Team[] } = {
  result: [
    {
      id: 1,
      name: 'Holocron',
      collectorTargets: [1, 4429, 130],
      teamSize: 6,
      users: [teamAdmin, adminUser],
      valueStreamId: 1,
      isWorkflowOnly: false,
    },
    {
      id: 2,
      name: 'Mission DevOps',
      collectorTargets: [244],
      teamSize: 6,
      users: [adminUser, teamAdmin, leadershipAndTeamAdminUser],
      valueStreamId: 2,
      isWorkflowOnly: true,
    },
    {
      id: 3,
      name: 'CNAP Operations',
      collectorTargets: [132],
      teamSize: 6,
      users: [adminUser],
      valueStreamId: 3,
      isWorkflowOnly: false,
    },
    {
      id: 4,
      name: 'Bullhorn',
      collectorTargets: [133],
      teamSize: 6,
      users: [adminUser],
      valueStreamId: 2,
      isWorkflowOnly: false,
    },
    {
      id: 5,
      name: 'Another Team',
      collectorTargets: [],
      teamSize: 6,
      users: [adminUser],
      valueStreamId: 4,
      isWorkflowOnly: true,
    },
  ],
}

export default MockTeams
