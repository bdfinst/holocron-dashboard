import { ProjectIssue, ProjectIssueSeverity, ProjectIssueType } from "api";

const MockProjectIssues: ProjectIssue[] = [
	{
		severity: ProjectIssueSeverity.HIGH,
		issueUrl: "https://project.issue.1",
		type: ProjectIssueType.MAINTAINABILITY,
	},
	{
		severity: ProjectIssueSeverity.MEDIUM,
		issueUrl: "https://project.issue.2",
		type: ProjectIssueType.MAINTAINABILITY,
	},
	{
		severity: ProjectIssueSeverity.LOW,
		issueUrl: "https://project.issue.3",
		type: ProjectIssueType.MAINTAINABILITY,
	},
	{
		severity: ProjectIssueSeverity.HIGH,
		issueUrl: "https://project.issue.4",
		type: ProjectIssueType.VULNERABILITY,
	},
	{
		severity: ProjectIssueSeverity.MEDIUM,
		issueUrl: "https://project.issue.5",
		type: ProjectIssueType.VULNERABILITY,
	},
	{
		severity: ProjectIssueSeverity.LOW,
		issueUrl: "https://project.issue.6",
		type: ProjectIssueType.VULNERABILITY,
	},
	{
		severity: ProjectIssueSeverity.HIGH,
		issueUrl: "https://project.issue.7",
		type: ProjectIssueType.POSSIBLE_BUG,
	},
	{
		severity: ProjectIssueSeverity.MEDIUM,
		issueUrl: "https://project.issue.8",
		type: ProjectIssueType.POSSIBLE_BUG,
	},
	{
		severity: ProjectIssueSeverity.LOW,
		issueUrl: "https://project.issue.9",
		type: ProjectIssueType.POSSIBLE_BUG,
	},
	{
		severity: ProjectIssueSeverity.HIGH,
		issueUrl: "https://project.issue.10",
		type: ProjectIssueType.UNKNOWN,
	},
	{
		severity: ProjectIssueSeverity.MEDIUM,
		issueUrl: "https://project.issue.11",
		type: ProjectIssueType.UNKNOWN,
	},
	{
		severity: ProjectIssueSeverity.LOW,
		issueUrl: "https://project.issue.12",
		type: ProjectIssueType.UNKNOWN,
	}
]

export default MockProjectIssues