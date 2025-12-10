import { Branch } from "api"

const MockBranches: Branch[] = [
	{
		lastUpdated: "2022-05-04T17:32:08",
		name: "experimental",
		url: "https://gitlab.com/holocron-dashboard/-/tree/experimental",
	},
	{
		lastUpdated: "2022-08-04T13:37:43",
		name: "master",
		url: "https://gitlab.com/holocron-dashboard/-/tree/master",
	},
	{
		lastUpdated: "2022-08-04T14:08:42",
		name: "processors_remixx",
		url: "https://gitlab.com/holocron/holocron-dashboard/-/tree/processors_remixx",
	},
	{
		lastUpdated: "2022-08-03T21:58:45",
		name: "remix_onboard",
		url: "https://gitlab.com/holocron/holocron-dashboard/-/tree/_onboard",
	},
	{
		lastUpdated: "2022-07-20T20:41:02",
		name: "seq_unit_test",
		url: "https://gitlab.com/holocron/holocron-dashboard/-/tree/seq_unit_test",
	}
]

export default MockBranches
