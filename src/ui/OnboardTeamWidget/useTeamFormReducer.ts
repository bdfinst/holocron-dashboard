import { CollectorTarget, Organization, Team, User, ValueStream } from 'api'
import { useMemo, useReducer } from 'react'
import { isPosIntValidation, getUserInputValidaton, setEqual } from 'utils'

enum ActionTypes {
  SET_ORGANIZATION = 'SET_ORGANIZATION',
  SET_VALUE_STREAM = 'SET_VALUE_STREAM',
  SET_TEAM_NAME = 'SET_TEAM_NAME',
  SET_TEAM_SIZE = 'SET_TEAM_SIZE',
  SET_TEAM_ADMINS = 'SET_TEAM_ADMINS',
  SET_TICKET_BOARDS = 'SET_TICKET_BOARDS',
  SET_REPOSITORIES = 'SET_REPOSITORIES',
  SET_PIPELINES = 'SET_PIPELINES',
  SET_PROJECTS = 'SET_PROJECTS',
  SET_IS_SUBMITTING = 'SET_IS_SUBMITTING',
}

type State = {
  organization: {
    value: Organization | null
    error: boolean
    helperText: string
    disabled: boolean
  }
  valueStream: {
    value: ValueStream | null
    error: boolean
    helperText: string
    disabled: boolean
  }
  teamName: {
    value: string
    error: boolean
    helperText: string
    disabled: boolean
  }
  teamSize: {
    value: string
    error: boolean
    helperText: string
  }
  teamAdmins: {
    value: User[]
    error: boolean
    helperText: ''
  }
  ticketBoards: CollectorTarget[]
  repositories: CollectorTarget[]
  pipelines: CollectorTarget[]
  projects: CollectorTarget[]
  isSubmitting: boolean
  isSubmitDisabled: boolean
}

type SetOrganization = {
  type: ActionTypes.SET_ORGANIZATION
  organization: Organization | null
}

type SetValueStream = {
  type: ActionTypes.SET_VALUE_STREAM
  valueStream: ValueStream | null
}

type SetTeamName = {
  type: ActionTypes.SET_TEAM_NAME
  teamName: string
}

type SetTeamSize = {
  type: ActionTypes.SET_TEAM_SIZE
  teamSize: string
}

type SetTeamAdmins = {
  type: ActionTypes.SET_TEAM_ADMINS
  teamAdmins: User[]
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
  | SetOrganization
  | SetValueStream
  | SetTeamName
  | SetTeamSize
  | SetTeamAdmins
  | SetTicketBoards
  | SetRepositories
  | SetPipelines
  | SetProjects
  | SetIsSubmitting

interface StateManager {
  getFinalState(state: State): State
  getStateOnSetOrganization(state: State, action: SetOrganization): State
  getStateOnSetValueStream(state: State, action: SetValueStream): State
  getStateOnSetTeamName(state: State, action: SetTeamName): State
}

const getCollectorTargetId = ({ id }: CollectorTarget) => id

const createFormStateManager = (ssoEnabled: boolean): StateManager => ({
  getFinalState(state) {
    const {
      organization,
      valueStream,
      teamName,
      teamSize,
      teamAdmins,
      isSubmitting,
    } = state
    return {
      ...state,
      isSubmitDisabled:
        !organization ||
        !valueStream ||
        teamName.error ||
        teamSize.error ||
        (teamAdmins.value.length === 0 && ssoEnabled) ||
        isSubmitting,
    }
  },
  getStateOnSetOrganization(state, action) {
    return {
      ...state,
      organization: {
        value: action.organization,
        error: !action.organization,
        helperText: !action.organization ? 'Organization is required' : '',
        disabled: false,
      },
      valueStream: {
        value: null,
        error: false,
        helperText: '',
        disabled: false,
      },
      teamName: {
        value: '',
        error: false,
        helperText: '',
        disabled: true,
      },
      teamSize: {
        value: '',
        error: false,
        helperText: '',
      },
      teamAdmins: {
        value: [],
        error: false,
        helperText: '',
      },
      ticketBoards: [],
      repositories: [],
      pipelines: [],
      projects: [],
    }
  },
  getStateOnSetValueStream(state, action) {
    return {
      ...state,
      valueStream: {
        value: action.valueStream,
        error: !action.valueStream,
        helperText: !action.valueStream ? 'Value Stream is required' : '',
        disabled: false,
      },
      teamName: {
        value: '',
        error: false,
        helperText: '',
        disabled: !action.valueStream,
      },
      teamSize: {
        value: '',
        error: false,
        helperText: '',
      },
      teamAdmins: {
        value: [],
        error: false,
        helperText: '',
      },
      ticketBoards: [],
      repositories: [],
      pipelines: [],
      projects: [],
    }
  },
  getStateOnSetTeamName(state, action) {
    const { valueStream } = state
    const { teamName } = action
    if (valueStream?.value.teams.some(t => t.name === teamName)) {
      return {
        ...state,
        teamName: {
          value: teamName,
          error: true,
          helperText: `${teamName} already exists`,
          disabled: false,
        },
      }
    }
    const { isValid, errorMessage } = getUserInputValidaton(teamName)
    return {
      ...state,
      teamName: {
        value: teamName,
        error: !isValid,
        helperText: errorMessage,
        disabled: false,
      },
    }
  },
})

const updateFormStateManager = (
  ssoEnabled: boolean,
  previousValueStream: ValueStream,
  previousTeam: Team,
  previousTeamTicketBoards: CollectorTarget[],
  previousTeamRepositories: CollectorTarget[],
  previousTeamPipelines: CollectorTarget[],
  previousTeamProjects: CollectorTarget[],
): StateManager => ({
  getFinalState(state) {
    const {
      organization,
      valueStream,
      teamName,
      teamSize,
      teamAdmins,
      ticketBoards,
      repositories,
      pipelines,
      projects,
      isSubmitting,
    } = state
    const organizationHasChanged =
      !!organization.value &&
      previousValueStream.organizationId !== organization.value.id
    const valueStreamHasChanged =
      !!valueStream.value && previousTeam.valueStreamId !== valueStream.value.id
    const teamNameHasChanged = teamName.value !== previousTeam.name
    const teamSizeHasChanged =
      !teamSize.error && Number(teamSize.value) !== previousTeam.teamSize
    const teamAdminsHaveChanged = !setEqual(
      previousTeam.users,
      teamAdmins.value,
      u => u.id,
    )
    const ticketBoardsHaveChanged = !setEqual(
      ticketBoards,
      previousTeamTicketBoards,
      getCollectorTargetId,
    )
    const repositoriesHaveChanged = !setEqual(
      repositories,
      previousTeamRepositories,
      getCollectorTargetId,
    )
    const pipelinesHaveChanged = !setEqual(
      pipelines,
      previousTeamPipelines,
      getCollectorTargetId,
    )
    const projectsHaveChanged = !setEqual(
      projects,
      previousTeamProjects,
      getCollectorTargetId,
    )

    const formHasChanged =
      organizationHasChanged ||
      valueStreamHasChanged ||
      teamNameHasChanged ||
      teamSizeHasChanged ||
      teamAdminsHaveChanged ||
      ticketBoardsHaveChanged ||
      repositoriesHaveChanged ||
      pipelinesHaveChanged ||
      projectsHaveChanged

    const formIsInvalid =
      !organization.value ||
      valueStream.error ||
      teamName.error ||
      teamSize.error ||
      (!teamAdmins.value && ssoEnabled)

    return {
      ...state,
      isSubmitDisabled: formIsInvalid || isSubmitting || !formHasChanged,
    }
  },
  getStateOnSetOrganization(state, action) {
    return {
      ...state,
      organization: {
        value: action.organization,
        error: !action.organization,
        helperText: !action.organization ? 'Organization is required' : '',
        disabled: false,
      },
      valueStream: {
        value: null,
        error: false,
        helperText: '',
        disabled: false,
      },
      teamName: {
        value: '',
        error: false,
        helperText: '',
        disabled: false,
      },
    }
  },
  getStateOnSetValueStream(state, action) {
    return {
      ...state,
      valueStream: {
        value: action.valueStream,
        error: !action.valueStream,
        helperText: !action.valueStream ? 'Value Stream is required' : '',
        disabled: false,
      },
      teamName: {
        value: '',
        error: false,
        helperText: '',
        disabled: false,
      },
    }
  },
  getStateOnSetTeamName(state, action) {
    const { valueStream } = state
    const { teamName } = action
    const teamAlreadyExists =
      valueStream?.value.id === previousTeam.valueStreamId
        ? valueStream?.value.teams.some(
            t => t.name === teamName && teamName !== previousTeam.name,
          )
        : valueStream?.value.teams.some(t => t.name === teamName)
    if (teamAlreadyExists) {
      return {
        ...state,
        teamName: {
          value: teamName,
          error: true,
          helperText: `${teamName} already exists`,
          disabled: false,
        },
      }
    }
    const { isValid, errorMessage } = getUserInputValidaton(teamName)
    return {
      ...state,
      teamName: {
        value: teamName,
        error: !isValid,
        helperText: errorMessage,
        disabled: false,
      },
    }
  },
})

interface ReducerProps {
  ssoEnabled: boolean
  previousOrganization?: Organization
  previousValueStream?: ValueStream
  previousTeam?: Team
  previousTeamTicketBoards?: CollectorTarget[]
  previousTeamRepositories?: CollectorTarget[]
  previousTeamPipelines?: CollectorTarget[]
  previousTeamProjects?: CollectorTarget[]
}

const getReducer = ({
  ssoEnabled,
  previousValueStream,
  previousTeam,
  previousTeamTicketBoards,
  previousTeamRepositories,
  previousTeamPipelines,
  previousTeamProjects,
}: ReducerProps) => {
  const stateManager = previousTeam
    ? updateFormStateManager(
        ssoEnabled,
        previousValueStream,
        previousTeam,
        previousTeamTicketBoards,
        previousTeamRepositories,
        previousTeamPipelines,
        previousTeamProjects,
      )
    : createFormStateManager(ssoEnabled)
  return (state: State, action: Action) => {
    switch (action.type) {
      case ActionTypes.SET_ORGANIZATION:
        return stateManager.getFinalState(
          stateManager.getStateOnSetOrganization(state, action),
        )
      case ActionTypes.SET_VALUE_STREAM:
        return stateManager.getFinalState(
          stateManager.getStateOnSetValueStream(state, action),
        )
      case ActionTypes.SET_TEAM_NAME:
        return stateManager.getFinalState(
          stateManager.getStateOnSetTeamName(state, action),
        )
      case ActionTypes.SET_TEAM_SIZE:
        const { isValid, errorMessage } = isPosIntValidation(action.teamSize)
        return stateManager.getFinalState({
          ...state,
          teamSize: {
            value: action.teamSize,
            error: !isValid,
            helperText: errorMessage,
          },
        })
      case ActionTypes.SET_TEAM_ADMINS:
        return stateManager.getFinalState({
          ...state,
          teamAdmins: {
            value: action.teamAdmins,
            error: false,
            helperText: '',
          },
        })
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

const buildInitialState = ({
  previousOrganization,
  previousValueStream,
  previousTeam,
  previousTeamTicketBoards,
  previousTeamRepositories,
  previousTeamPipelines,
  previousTeamProjects,
}: ReducerProps): State => {
  const isUpdateForm = !!previousTeam
  if (isUpdateForm) {
    return {
      organization: {
        value: previousOrganization,
        error: false,
        helperText: '',
        disabled: false,
      },
      valueStream: {
        value: previousValueStream,
        error: false,
        helperText: '',
        disabled: false,
      },
      teamAdmins: {
        value: previousTeam.users,
        error: false,
        helperText: '',
      },
      teamName: {
        value: previousTeam.name,
        helperText: '',
        error: false,
        disabled: false,
      },
      teamSize: {
        value: String(previousTeam.teamSize),
        error: false,
        helperText: '',
      },
      ticketBoards: previousTeamTicketBoards,
      repositories: previousTeamRepositories,
      pipelines: previousTeamPipelines,
      projects: previousTeamProjects,
      isSubmitting: false,
      isSubmitDisabled: true,
    }
  }
  return {
    organization: {
      value: null,
      error: false,
      helperText: '',
      disabled: false,
    },
    valueStream: {
      value: null,
      error: false,
      helperText: '',
      disabled: false,
    },
    teamName: {
      value: '',
      helperText: '',
      error: false,
      disabled: true,
    },
    teamSize: {
      value: '',
      error: false,
      helperText: '',
    },
    teamAdmins: {
      value: [],
      error: false,
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

const useTeamFormReducer = ({
  ssoEnabled,
  previousOrganization,
  previousValueStream,
  previousTeam,
  previousTeamTicketBoards,
  previousTeamRepositories,
  previousTeamPipelines,
  previousTeamProjects,
}: ReducerProps) => {
  const reducer = useMemo(
    () =>
      getReducer({
        ssoEnabled,
        previousValueStream,
        previousTeam,
        previousTeamTicketBoards,
        previousTeamRepositories,
        previousTeamPipelines,
        previousTeamProjects,
      }),
    [
      ssoEnabled,
      previousValueStream,
      previousTeam,
      previousTeamTicketBoards,
      previousTeamRepositories,
      previousTeamPipelines,
      previousTeamProjects,
    ],
  )
  const [state, dispatch] = useReducer(reducer, null, () =>
    buildInitialState({
      ssoEnabled,
      previousOrganization,
      previousValueStream,
      previousTeam,
      previousTeamTicketBoards,
      previousTeamRepositories,
      previousTeamPipelines,
      previousTeamProjects,
    }),
  )

  return {
    state,
    setOrganization: (organization: Organization | null) =>
      dispatch({
        type: ActionTypes.SET_ORGANIZATION,
        organization,
      }),
    setValueStream: (valueStream: ValueStream | null) =>
      dispatch({
        type: ActionTypes.SET_VALUE_STREAM,
        valueStream,
      }),
    setTeamName: (teamName: string) =>
      dispatch({
        type: ActionTypes.SET_TEAM_NAME,
        teamName,
      }),
    setTeamSize: (teamSize: string) =>
      dispatch({
        type: ActionTypes.SET_TEAM_SIZE,
        teamSize,
      }),
    setTeamAdmins: (teamAdmins: User[]) =>
      dispatch({
        type: ActionTypes.SET_TEAM_ADMINS,
        teamAdmins,
      }),
    setTicketBoards: (ticketBoards: CollectorTarget[]) =>
      dispatch({
        type: ActionTypes.SET_TICKET_BOARDS,
        ticketBoards,
      }),
    setRepositories: (repositories: CollectorTarget[]) =>
      dispatch({
        type: ActionTypes.SET_REPOSITORIES,
        repositories,
      }),
    setPipelines: (pipelines: CollectorTarget[]) =>
      dispatch({
        type: ActionTypes.SET_PIPELINES,
        pipelines,
      }),
    setProjects: (projects: CollectorTarget[]) =>
      dispatch({
        type: ActionTypes.SET_PROJECTS,
        projects,
      }),
    setIsSubmitting: (isSubmitting: boolean) =>
      dispatch({
        type: ActionTypes.SET_IS_SUBMITTING,
        isSubmitting,
      }),
  }
}

export default useTeamFormReducer
