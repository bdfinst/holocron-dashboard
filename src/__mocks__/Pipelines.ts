import { CollectorTarget } from "api";

const Pipelines: { result: CollectorTarget[] } = {result: [
	{
		id: 1,
		name: "Big Bang",
		teamId: 1,
		url: "https://gitlab.com/big-bang"
	},
	{
		id: 2,
		name: "Repo 1",
		teamId: null,
		url: "https://gitlab.com/repo-1"
	},
	{
		id: 3,
		name: "Repo 2",
		teamId: null,
		url: "https://gitlab.com/repo-2"
	},
	{
		id: 4,
		name: "Repo 3",
		teamId: null,
		url: "https://gitlab.com/repo-3"
	},
	{
		id: 5,
		name: "Repo 4",
		teamId: null,
		url: "https://gitlab.com/repo-4"
	},
]}

export default Pipelines