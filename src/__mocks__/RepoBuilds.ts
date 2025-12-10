import { Build } from "api"

const MockBuilds: Build[] = [
	{
		buildStatus: "FAILED",
		buildUrl: "https://gitlab.com/big-bang/-/pipelines/912950",
		endTime: "2022-08-02T23:30:18.662000+00:00",
		startTime: "2022-08-02T20:07:04.359000+00:00",
	},
	{
		buildStatus: "PASSED",
		buildUrl: "https://gitlab.com/big-bang/-/pipelines/912951",
		endTime: "2022-08-02T23:30:18.662000+00:00",
		startTime: "2022-08-02T20:07:04.359000+00:00",
	},
	{
		buildStatus: "PASSED_WITH_WARNINGS",
		buildUrl: "https://gitlab.com/big-bang/-/pipelines/912952",
		endTime: "2022-08-02T23:30:18.662000+00:00",
		startTime: "2022-08-02T20:07:04.359000+00:00",
	}
]

export default MockBuilds