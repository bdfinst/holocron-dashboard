import { Organization, ValueStream, User } from 'api'
import { useMemo, useReducer } from 'react'
import { getUserInputValidaton, setEqual } from 'utils'

enum ActionTypes {
  SET_VALUE_STREAM_NAME = 'SET_VALUE_STREAM_NAME',
  SET_ORGANIZATION = 'SET_ORGANIZATION',
  SET_IS_SUBMITTING = 'SET_IS_SUBMITTING',
  SET_VALUE_STREAM_ADMINS = 'SET_VALUE_STREAM_ADMINS',
}

type State = {
  organization: {
    value: Organization | null
    error: boolean
    helperText: string
    disabled: boolean
  }
  valueStreamName: {
    value: string
    error: boolean
    helperText: string
    disabled: boolean
  }
  valueStreamAdmins: {
    value: User[]
    error: boolean
    helperText: ''
  }
  isSubmitting: boolean
  isSubmitDisabled: boolean
}

type SetOrganization = {
  type: ActionTypes.SET_ORGANIZATION
  organization: Organization | null
}

type SetValueStreamName = {
  type: ActionTypes.SET_VALUE_STREAM_NAME
  valueStreamName: string
}

type SetValueStreamAdmins = {
  type: ActionTypes.SET_VALUE_STREAM_ADMINS
  valueStreamAdmins: User[]
}

type SetIsSubmitting = {
  type: ActionTypes.SET_IS_SUBMITTING
  isSubmitting: boolean
}

type Action =
  | SetOrganization
  | SetValueStreamName
  | SetValueStreamAdmins
  | SetIsSubmitting

interface StateManager {
  getFinalState(state: State): State
  getStateOnSetOrganization(state: State, action: SetOrganization): State
  getStateOnSetValueStreamName(state: State, action: SetValueStreamName): State
}

const createFormStateManager = (ssoEnabled: boolean): StateManager => ({
  getFinalState(state) {
    const { valueStreamName, valueStreamAdmins, organization, isSubmitting } =
      state
    const organizationFieldIsInvalid = organization.error
    const valueStreamNameIsInvalid = valueStreamName.error
    const hasNoValueStreamAdmins =
      valueStreamAdmins.value.length === 0 && ssoEnabled

    return {
      ...state,
      isSubmitDisabled:
        organizationFieldIsInvalid ||
        valueStreamNameIsInvalid ||
        hasNoValueStreamAdmins ||
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
      valueStreamName: {
        error: true,
        value: '',
        helperText: '',
        disabled: !action.organization,
      },
      valueStreamAdmins: {
        value: [],
        error: false,
        helperText: '',
      },
    }
  },
  getStateOnSetValueStreamName(state, action) {
    const { organization } = state
    const { valueStreamName } = action
    if (
      organization.value?.valueStreams.some(v => v.name === valueStreamName)
    ) {
      return {
        ...state,
        valueStreamName: {
          value: valueStreamName,
          error: true,
          helperText: `${valueStreamName} already exists`,
          disabled: false,
        },
      }
    }
    const { isValid, errorMessage } = getUserInputValidaton(valueStreamName)
    return {
      ...state,
      valueStreamName: {
        value: valueStreamName,
        error: !isValid,
        helperText: errorMessage,
        disabled: false,
      },
    }
  },
})

const updateFormStateManager = (
  ssoEnabled: boolean,
  previousValueStreamState: ValueStream,
): StateManager => ({
  getFinalState(state) {
    const { organization, valueStreamAdmins, valueStreamName, isSubmitting } =
      state

    const orgHasChanged =
      !!organization.value &&
      previousValueStreamState.organizationId !== organization.value.id

    const vsNameFieldHasChanged =
      valueStreamName.value !== previousValueStreamState.name

    const adminsFieldWasChanged = !setEqual(
      previousValueStreamState.users,
      valueStreamAdmins.value,
      u => u.id,
    )

    const formHasChanged =
      orgHasChanged || vsNameFieldHasChanged || adminsFieldWasChanged

    const formIsInvalid =
      organization.error ||
      valueStreamName.error ||
      (valueStreamAdmins.value.length === 0 && ssoEnabled)

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
      valueStreamName: {
        value: '',
        error: true,
        helperText: '',
        disabled: false,
      },
    }
  },
  getStateOnSetValueStreamName(state, action) {
    const { organization: selectedOrg } = state
    const { valueStreamName } = action
    const vsAlreadyExists =
      selectedOrg.value?.id === previousValueStreamState.organizationId
        ? selectedOrg.value?.valueStreams.some(
            v =>
              v.name === valueStreamName &&
              valueStreamName !== previousValueStreamState.name,
          )
        : selectedOrg.value?.valueStreams.some(v => v.name === valueStreamName)
    if (vsAlreadyExists) {
      return {
        ...state,
        valueStreamName: {
          value: valueStreamName,
          error: true,
          helperText: `${valueStreamName} already exists`,
          disabled: false,
        },
      }
    }
    const { isValid, errorMessage } = getUserInputValidaton(valueStreamName)
    return {
      ...state,
      valueStreamName: {
        value: valueStreamName,
        error: !isValid,
        helperText: errorMessage,
        disabled: false,
      },
    }
  },
})

const getReducer = (ssoEnabled: boolean, valueStreamToUpdate?: ValueStream) => {
  const stateManager = valueStreamToUpdate
    ? updateFormStateManager(ssoEnabled, valueStreamToUpdate)
    : createFormStateManager(ssoEnabled)
  return (state: State, action: Action) => {
    switch (action.type) {
      case ActionTypes.SET_ORGANIZATION:
        return stateManager.getFinalState(
          stateManager.getStateOnSetOrganization(state, action),
        )
      case ActionTypes.SET_VALUE_STREAM_NAME:
        return stateManager.getFinalState(
          stateManager.getStateOnSetValueStreamName(state, action),
        )
      case ActionTypes.SET_VALUE_STREAM_ADMINS:
        return stateManager.getFinalState({
          ...state,
          valueStreamAdmins: {
            value: action.valueStreamAdmins,
            error: false,
            helperText: '',
          },
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
  valueStreamToUpdateOrganization?: Organization,
  valueStreamToUpdate?: ValueStream,
): State => {
  const isUpdateForm = !!valueStreamToUpdate
  if (isUpdateForm) {
    return {
      organization: {
        value: valueStreamToUpdateOrganization || null,
        error: false,
        helperText: '',
        disabled: false,
      },
      valueStreamName: {
        error: false,
        helperText: '',
        disabled: false,
        value: valueStreamToUpdate.name,
      },
      valueStreamAdmins: {
        value: valueStreamToUpdate.users,
        error: false,
        helperText: '',
      },
      isSubmitting: false,
      isSubmitDisabled: true,
    }
  }
  return {
    organization: {
      value: null,
      error: false,
      helperText: '',
      disabled: true,
    },
    valueStreamName: {
      value: '',
      error: false,
      helperText: '',
      disabled: true,
    },
    valueStreamAdmins: {
      value: [],
      error: false,
      helperText: '',
    },
    isSubmitting: false,
    isSubmitDisabled: true,
  }
}

const useValueStreamFormReducer = (
  ssoEnabled: boolean,
  valueStreamToUpdateOrganization?: Organization,
  valueStreamToUpdate?: ValueStream,
) => {
  const reducer = useMemo(
    () => getReducer(ssoEnabled, valueStreamToUpdate),
    [ssoEnabled, valueStreamToUpdate],
  )
  const [state, dispatch] = useReducer(reducer, null, () =>
    buildInitialState(valueStreamToUpdateOrganization, valueStreamToUpdate),
  )

  return {
    state,
    setValueStreamName: (name: string) =>
      dispatch({
        type: ActionTypes.SET_VALUE_STREAM_NAME,
        valueStreamName: name,
      }),
    setOrganization: (org: Organization | null) =>
      dispatch({ type: ActionTypes.SET_ORGANIZATION, organization: org }),
    setValueStreamAdmins: (admins: User[]) =>
      dispatch({
        type: ActionTypes.SET_VALUE_STREAM_ADMINS,
        valueStreamAdmins: admins,
      }),
    setIsSubmitting: (submitting: boolean) =>
      dispatch({
        type: ActionTypes.SET_IS_SUBMITTING,
        isSubmitting: submitting,
      }),
  }
}

export default useValueStreamFormReducer
