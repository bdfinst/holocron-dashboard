import { CollectorTarget } from "api"

const MockCodeAnalysisProjects: { result: CollectorTarget[] } = {result: [
	{
		id: 200,
		name: 'Holocron Code Analysis Project',
		teamId: 1,
		url: "https://holocron.code.analysis.project.com"
	},
	{
		id: 201,
		name: 'Code Analysis Project 1',
		teamId: null,
		url: "https://code.analysis.project.1.com"
	}
]}

export default MockCodeAnalysisProjects