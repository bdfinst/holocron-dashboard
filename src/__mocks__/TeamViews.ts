import { TeamView } from "api"

export const createTeamView = ({
  id = 1,
  name = 'Holocron Team View',
  collectorTargets = [1],
  viewOwnerId = 1,
  isWorkflowOnly = false
}): TeamView => ({
  id,
  name,
  collectorTargets,
  viewOwnerId,
  isWorkflowOnly,
})

const MockTeamViews: { result: TeamView[] } =  {result: [
	{
    id: 24,
    name: "Holocron Team View",
    collectorTargets: [29],
		viewOwnerId: 1,
    isWorkflowOnly: false,
  }
]}

export default MockTeamViews