import MockBranches from "./Branches"
import MockBuilds from "./RepoBuilds"
import MockGitRequests from "./GitRequests"
import { mockRandDate, mockRandInt, mockUnixTimeSecs } from "./mockGenerator"
import { TeamMetrics } from "api"
import MockTeams from "./Teams"
import MockOrganizations from "./Organizations"
import MockValueStreams from "./ValueStreams"
import MockTeamViews from "./TeamViews"
import MockProjectIssues from "./ProjectIssues"

const mockDaysArray = () => {
	const ages = Array<{days: number}>(mockRandInt(1, 10))
	for (let i = 0; i < ages.length; i += 1) {
		ages[i] = { days: mockRandInt(1, 100)}
	}
	return ages
}

const mockHistoricalData = () => ({
	week: (() => {
		const d = mockRandDate()
		const month = d.getUTCMonth() + 1 >= 10 ? `${d.getUTCMonth() + 1}` : `0${d.getUTCMonth() + 1}`
		const day = d.getUTCDate() >= 10 ? `${d.getUTCDate()}` : `0${d.getUTCDate()}`
		return `${d.getUTCFullYear()}-${month}-${day}`
	})(),
	daysSpentOnFeatures: mockRandInt(1, 100),
	daysSpentOnDefects: mockRandInt(1, 100),
	daysSpentOnMaintenance: mockRandInt(1, 100),
	daysSpentOnUnplanned: mockRandInt(1, 100),
	amountSpentOnFeatures: mockRandInt(1, 100),
	amountSpentOnDefects: mockRandInt(1, 100),
	amountSpentOnMaintenance: mockRandInt(1, 100),
	amountSpentOnUnplanned: mockRandInt(1, 100),
	totalInternalIntegrations: mockRandInt(1, 100),
	totalDirectIntegrations: mockRandInt(1, 100),
	totalExternalIntegrations: mockRandInt(1, 100),
	averageTeamSize: mockRandInt(1, 20),
	averageAgeInDaysCodeReviewWasOpen: mockRandInt(1, 100),
	totalTicketsInBacklog: mockRandInt(1, 100),
	totalTicketsInProgress: mockRandInt(1, 100),
	ticketLeadTimes: mockDaysArray(),
	totalDeploys: mockRandInt(1, 100),
	ticketDevelopmentCycleTimes: mockDaysArray(),
	defectsCreated: mockRandInt(1, 100),
	highestPriorityDefectsCreated: mockRandInt(1, 100),
	highPriorityDefectsCreated: mockRandInt(1, 100),
	mediumPriorityDefectsCreated: mockRandInt(1, 100),
	lowPriorityDefectsCreated: mockRandInt(1, 100),
	lowestPriorityDefectsCreated: mockRandInt(1, 100),
	totalThroughput: mockRandInt(1, 5),
	maintainabilityIssues: mockRandInt(1, 100),
	maintainabilityLowSeverityIssues: mockRandInt(1, 100),
	maintainabilityMediumSeverityIssues: mockRandInt(1, 100),
	maintainabilityHighSeverityIssues: mockRandInt(1, 100),
	vulnerabilities: mockRandInt(1, 100),
	highSeverityVulnerabilities: mockRandInt(1, 100),
	mediumSeverityVulnerabilities: mockRandInt(1, 100),
	lowSeverityVulnerabilities: mockRandInt(1, 100)
})

const MockMetrics: {result: TeamMetrics[]} = {
	result: [
		{
			lastUpdated: {
				workflow: mockUnixTimeSecs(),
				scm: mockUnixTimeSecs(),
				build: mockUnixTimeSecs(),
				project_analysis: mockUnixTimeSecs(),
			},
			id: MockTeams.result[0].id,
			name: MockTeams.result[0].name,
			staleBacklogTickets: mockRandInt(1, 10),
			ageOfTicketsInBacklog: mockDaysArray(),
			teamSize: mockRandInt(1, 5),
			wipTickets: mockRandInt(1, 10),
			isView: false,
			organizationName: MockOrganizations.result[0].name,
			organizationId: MockOrganizations.result[0].id,
			valueStreamId: MockValueStreams.result[0].id,
			valueStreamName: MockValueStreams.result[0].name,
			staleGitRequests: MockGitRequests,
			staleBranches: MockBranches,
			latestBuilds: MockBuilds,
			activeIssues: MockProjectIssues,
			historicalData: (() => {
				const items = Array<ReturnType<typeof mockHistoricalData>>(1000)
				for (let i = 0; i < items.length; i += 1){
					items[i] = mockHistoricalData()
				}
				return items
			})(),
		},
		{
			lastUpdated: {
				workflow: mockUnixTimeSecs(),
				scm: mockUnixTimeSecs(),
				build: mockUnixTimeSecs(),
				project_analysis: mockUnixTimeSecs(),
			},
			id: MockTeamViews.result[0].id,
			name: MockTeamViews.result[0].name,
			staleBacklogTickets: mockRandInt(1, 10),
			ageOfTicketsInBacklog: mockDaysArray(),
			teamSize: mockRandInt(1, 5),
			wipTickets: mockRandInt(1, 10),
			isView: true,
			organizationName: MockOrganizations.result[0].name,
			organizationId: MockOrganizations.result[0].id,
			valueStreamId: MockValueStreams.result[0].id,
			valueStreamName: MockValueStreams.result[0].name,
			staleGitRequests: MockGitRequests,
			staleBranches: MockBranches,
			latestBuilds: MockBuilds,
			activeIssues: MockProjectIssues,
			historicalData: (() => {
				const items = Array<ReturnType<typeof mockHistoricalData>>(1000)
				for (let i = 0; i < items.length; i += 1){
					items[i] = mockHistoricalData()
				}
				return items
			})(),
		}
	]
}

export default MockMetrics