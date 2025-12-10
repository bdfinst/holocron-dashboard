import { Collector } from "api"

const Collectors: { result: Collector[] } = {
	result: [
		{
			collectorIntervalSeconds: 3000,
			collectorTargetsIntrvlSecs: null,
			createdAt: "2024-06-05T20:29:20.316892+00:00",
			id: 1,
			lookBackDays: 365,
			maxRequestsPerMinute: null,
			name: "sonarqube.project_analysis",
			target: "http://sonarqube:9000",
			updatedAt: "2024-06-05T20:29:20.316892+00:00",
		},
		{
			collectorIntervalSeconds: 3500,
			collectorTargetsIntrvlSecs: null,
			createdAt: "2024-06-06T20:32:11.608385+00:00",
			id: 2,
			lookBackDays: 5,
			maxRequestsPerMinute: null,
			name: "jira.workflow",
			target: "http://jira:8080",
			updatedAt: "2024-06-06T20:54:59.152901+00:00",
		},
		{
			collectorIntervalSeconds: 3200,
			collectorTargetsIntrvlSecs: null,
			createdAt: "2024-06-06T21:26:40.711147+00:00",
			id: 3,
			lookBackDays: 1,
			maxRequestsPerMinute: null,
			name: "repo1-build",
			target: "http://gitlab",
			updatedAt: "2024-06-06T21:26:40.711147+00:00",
		}
	]
}

export default Collectors