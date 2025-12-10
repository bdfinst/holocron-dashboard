import { CollectorTarget, Team, TeamView, useAPIContext } from 'api'
import { useMemo, useReducer } from 'react'
import { getUserInputValidaton, setEqual } from 'utils'

enum ActionTypes {
  SET_TEAM_VIEW_NAME = 'SET_TEAM_VIEW_NAME',
  SET_TICKET_BOARDS = 'SET_TICKET_BOARDS',
  SET_REPOSITORIES = 'SET_REPOSITORIES',
  SET_PIPELINES = 'SET_PIPELINES',
  SET_PROJECTS = 'SET_PROJECTS',
  SET_IS_SUBMITTING = 'SET_IS_SUBMITTING',
}

type State = {
  teamViewName: {
    value: string
    error: boolean
    helperText: string
  }
  ticketBoards: CollectorTarget[]
  repositories: CollectorTarget[]
  pipelines: CollectorTarget[]
  projects: CollectorTarget[]
  isSubmitting: boolean
  isSubmitDisabled: boolean
}

type SetTeamViewName = {
  type: ActionTypes.SET_TEAM_VIEW_NAME
  teamViewName: string
}

type SetTicketBoards = {
  type: ActionTypes.SET_TICKET_BOARDS
  ticketBoards: CollectorTarget[]
}

type SetRepositories = {
  type: ActionTypes.SET_REPOSITORIES
  repositories: CollectorTarget[]
}

type SetPipelines = {
  type: ActionTypes.SET_PIPELINES
  pipelines: CollectorTarget[]
}

type SetProjects = {
  type: ActionTypes.SET_PROJECTS
  projects: CollectorTarget[]
}

type SetIsSubmitting = {
  type: ActionTypes.SET_IS_SUBMITTING
  isSubmitting: boolean
}

type Action =
  | SetTeamViewName
  | SetTicketBoards
  | SetRepositories
  | SetPipelines
  | SetProjects
  | SetIsSubmitting

interface StateManager {
  getFinalState(state: State): State
  getStateOnSetTeamViewName(state: State, action: SetTeamViewName): State
}

const getCollectorTargetId = ({ id }: CollectorTarget) => id

const createFormStateManager = (
  teamViewTeam: Team,
  teamViews: TeamView[],
): StateManager => ({
  getFinalState(state) {
    const { isSubmitting, teamViewName } = state
    const formIsInvalid = teamViewName.error
    return {
      ...state,
      isSubmitDisabled: formIsInvalid || isSubmitting,
    }
  },
  getStateOnSetTeamViewName(state, action) {
    const { teamViewName } = action
    if (
      teamViews
        .filter(v => v.viewOwnerId === teamViewTeam.id)
        .some(v => v.name === teamViewName)
    ) {
      return {
        ...state,
        teamViewName: {
          value: teamViewName,
          error: true,
          helperText: `${teamViewName} already exists`,
        },
      }
    }
    const { isValid, errorMessage } = getUserInputValidaton(teamViewName)
    return {
      ...state,
      teamViewName: {
        value: teamViewName,
        error: !isValid,
        helperText: errorMessage,
      },
    }
  },
})

const updateFormStateManager = (
  previousTeamView: TeamView,
  teamViews: TeamView[],
  previousTeamViewTicketBoards: CollectorTarget[],
  previousTeamViewRepositories: CollectorTarget[],
  previousTeamViewPipelines: CollectorTarget[],
  previousTeamViewProjects: CollectorTarget[],
): StateManager => ({
  getFinalState(state) {
    const {
      teamViewName,
      isSubmitting,
      ticketBoards,
      repositories,
      pipelines,
      projects,
    } = state
    const teamViewNameHasChanged = previousTeamView.name !== teamViewName.value

    const ticketBoardsHaveChanged = !setEqual(
      previousTeamViewTicketBoards,
      ticketBoards,
      getCollectorTargetId,
    )
    const reposHaveChanged = !setEqual(
      previousTeamViewRepositories,
      repositories,
      getCollectorTargetId,
    )
    const pipelinesHaveChanged = !setEqual(
      previousTeamViewPipelines,
      pipelines,
      getCollectorTargetId,
    )
    const projectsHaveChanged = !setEqual(
      previousTeamViewProjects,
      projects,
      getCollectorTargetId,
    )

    const formHasChanged =
      teamViewNameHasChanged ||
      ticketBoardsHaveChanged ||
      reposHaveChanged ||
      pipelinesHaveChanged ||
      projectsHaveChanged

    const formIsInvalid = teamViewName.error

    return {
      ...state,
      isSubmitDisabled: formIsInvalid || isSubmitting || !formHasChanged,
    }
  },
  getStateOnSetTeamViewName(state, action) {
    const { teamViewName } = action
    const teamViewExists = teamViews
      .filter(v => v.viewOwnerId === previousTeamView.viewOwnerId)
      .some(v => v.name === teamViewName && v.name !== previousTeamView.name)
    if (teamViewExists) {
      return {
        ...state,
        teamViewName: {
          value: teamViewName,
          error: true,
          helperText: `${teamViewName} already exists`,
        },
      }
    }
    const { isValid, errorMessage } = getUserInputValidaton(teamViewName)
    return {
      ...state,
      teamViewName: {
        value: teamViewName,
        error: !isValid,
        helperText: errorMessage,
      },
    }
  },
})

const getReducer = (
  previousTeam: Team,
  teamViews: TeamView[],
  previousTeamView?: TeamView,
  previousTeamViewTicketBoards?: CollectorTarget[],
  previousTeamViewRepositories?: CollectorTarget[],
  previousTeamViewPipelines?: CollectorTarget[],
  previousTeamViewProjects?: CollectorTarget[],
) => {
  const stateManager = previousTeamView
    ? updateFormStateManager(
        previousTeamView,
        teamViews,
        previousTeamViewTicketBoards,
        previousTeamViewRepositories,
        previousTeamViewPipelines,
        previousTeamViewProjects,
      )
    : createFormStateManager(previousTeam, teamViews)
  return (state: State, action: Action) => {
    switch (action.type) {
      case ActionTypes.SET_TEAM_VIEW_NAME:
        return stateManager.getFinalState(
          stateManager.getStateOnSetTeamViewName(state, action),
        )
      case ActionTypes.SET_TICKET_BOARDS:
        return stateManager.getFinalState({
          ...state,
          ticketBoards: action.ticketBoards,
        })
      case ActionTypes.SET_REPOSITORIES:
        return stateManager.getFinalState({
          ...state,
          repositories: action.repositories,
        })
      case ActionTypes.SET_PIPELINES:
        return stateManager.getFinalState({
          ...state,
          pipelines: action.pipelines,
        })
      case ActionTypes.SET_PROJECTS:
        return stateManager.getFinalState({
          ...state,
          projects: action.projects,
        })
      default:
        return stateManager.getFinalState({
          ...state,
          isSubmitting: action.isSubmitting,
        })
    }
  }
}

const buildInitialState = (
  previousTeamView?: TeamView,
  previousTeamViewTicketBoards?: CollectorTarget[],
  previousTeamViewRepositories?: CollectorTarget[],
  previousTeamViewPipelines?: CollectorTarget[],
  previousTeamProjects?: CollectorTarget[],
): State => {
  const isUpdateForm = !!previousTeamView
  if (isUpdateForm) {
    return {
      teamViewName: {
        value: previousTeamView.name,
        helperText: '',
        error: false,
      },
      ticketBoards: previousTeamViewTicketBoards,
      repositories: previousTeamViewRepositories,
      pipelines: previousTeamViewPipelines,
      projects: previousTeamProjects,
      isSubmitting: false,
      isSubmitDisabled: true,
    }
  }
  return {
    teamViewName: {
      value: '',
      error: true,
      helperText: '',
    },
    ticketBoards: [],
    repositories: [],
    pipelines: [],
    projects: [],
    isSubmitting: false,
    isSubmitDisabled: true,
  }
}

const useTeamViewFormReducer = (
  previousTeam: Team,
  previousTeamView?: TeamView,
  previousTeamViewTicketBoards?: CollectorTarget[],
  previousTeamViewRepositories?: CollectorTarget[],
  previousTeamViewPipelines?: CollectorTarget[],
  previousTeamViewProjects?: CollectorTarget[],
) => {
  const { teamViews } = useAPIContext()
  const reducer = useMemo(
    () =>
      getReducer(
        previousTeam,
        teamViews,
        previousTeamView,
        previousTeamViewTicketBoards,
        previousTeamViewRepositories,
        previousTeamViewPipelines,
        previousTeamViewProjects,
      ),
    [
      previousTeam,
      teamViews,
      previousTeamView,
      previousTeamViewTicketBoards,
      previousTeamViewRepositories,
      previousTeamViewPipelines,
      previousTeamViewProjects,
    ],
  )

  const [state, dispatch] = useReducer(reducer, null, () =>
    buildInitialState(
      previousTeamView,
      previousTeamViewTicketBoards,
      previousTeamViewRepositories,
      previousTeamViewPipelines,
      previousTeamViewProjects,
    ),
  )

  return {
    state,
    setTeamViewName: (teamViewName: string) =>
      dispatch({ type: ActionTypes.SET_TEAM_VIEW_NAME, teamViewName }),
    setTicketBoards: (ticketBoards: CollectorTarget[]) =>
      dispatch({ type: ActionTypes.SET_TICKET_BOARDS, ticketBoards }),
    setRepositories: (repositories: CollectorTarget[]) =>
      dispatch({ type: ActionTypes.SET_REPOSITORIES, repositories }),
    setPipelines: (pipelines: CollectorTarget[]) =>
      dispatch({ type: ActionTypes.SET_PIPELINES, pipelines }),
    setProjects: (projects: CollectorTarget[]) =>
      dispatch({ type: ActionTypes.SET_PROJECTS, projects }),
    setIsSubmitting: (isSubmitting: boolean) =>
      dispatch({ type: ActionTypes.SET_IS_SUBMITTING, isSubmitting }),
  }
}

export default useTeamViewFormReducer
