import { Organization, User, useAPIContext } from 'api'
import { useMemo, useReducer } from 'react'
import { getUserInputValidaton, setEqual } from 'utils'

enum ActionTypes {
  SET_ORGANIZATION_ADMINS = 'SET_ORGANIZATION_ADMINS',
  SET_ORGANIZATION_NAME = 'SET_ORGANIZATION_NAME',
  SET_IS_SUBMITTING = 'SET_IS_SUBMITTING',
}

type State = {
  organizationAdmins: {
    value: User[]
    error: boolean
    helperText: ''
  }
  organizationName: {
    value: string
    error: boolean
    helperText: string
  }
  isSubmitting: boolean
  isSubmitDisabled: boolean
}

type SetOrganizationName = {
  type: ActionTypes.SET_ORGANIZATION_NAME
  organizationName: string
}

type SetOrganizationAdmins = {
  type: ActionTypes.SET_ORGANIZATION_ADMINS
  organizationAdmins: User[]
}

type SetIsSubmitting = {
  type: ActionTypes.SET_IS_SUBMITTING
  isSubmitting: boolean
}

type Action = SetOrganizationName | SetOrganizationAdmins | SetIsSubmitting

interface StateManager {
  getFinalState(state: State): State
  getStateOnSetOrganizationName(
    state: State,
    action: SetOrganizationName,
  ): State
}

const createFormStateManager = (
  ssoEnabled: boolean,
  organizationList: Organization[],
): StateManager => ({
  getFinalState(state) {
    const { organizationAdmins, organizationName, isSubmitting } = state
    const formIsInvalid =
      organizationName.error ||
      (organizationAdmins.value.length === 0 && ssoEnabled)
    return {
      ...state,
      isSubmitDisabled: formIsInvalid || isSubmitting,
    }
  },
  getStateOnSetOrganizationName(state, action) {
    const { organizationName } = action
    if (organizationList.some(org => org.name === organizationName)) {
      return {
        ...state,
        organizationName: {
          value: organizationName,
          error: true,
          helperText: `${organizationName} already exists`,
        },
      }
    }
    const { isValid, errorMessage } = getUserInputValidaton(
      action.organizationName,
    )
    return {
      ...state,
      organizationName: {
        value: action.organizationName,
        error: !isValid,
        helperText: errorMessage,
      },
    }
  },
})

const updateFormStateManager = (
  ssoEnabled: boolean,
  organizationList: Organization[],
  previousOrganizationState: Organization,
): StateManager => ({
  getFinalState(state) {
    const { organizationAdmins, organizationName, isSubmitting } = state
    const formHasChanged =
      organizationName.value !== previousOrganizationState.name ||
      !setEqual(
        previousOrganizationState.users,
        organizationAdmins.value,
        u => u.id,
      )
    const formIsInvalid =
      organizationName.error ||
      (organizationAdmins.value.length === 0 && ssoEnabled)
    return {
      ...state,
      isSubmitDisabled: formIsInvalid || isSubmitting || !formHasChanged,
    }
  },
  getStateOnSetOrganizationName(state, action) {
    const { organizationName } = action
    if (
      organizationList.some(
        org =>
          org.name === organizationName &&
          organizationName !== previousOrganizationState.name,
      )
    ) {
      return {
        ...state,
        organizationName: {
          value: organizationName,
          error: true,
          helperText: `${organizationName} already exists`,
        },
      }
    }
    const { isValid, errorMessage } = getUserInputValidaton(
      action.organizationName,
    )
    return {
      ...state,
      organizationName: {
        value: action.organizationName,
        error: !isValid,
        helperText: errorMessage,
      },
    }
  },
})

const getReducer = (
  ssoEnabled: boolean,
  organizationList: Organization[],
  organization?: Organization,
) => {
  const stateManager = organization
    ? updateFormStateManager(ssoEnabled, organizationList, organization)
    : createFormStateManager(ssoEnabled, organizationList)
  return (state: State, action: Action) => {
    switch (action.type) {
      case ActionTypes.SET_ORGANIZATION_ADMINS:
        return stateManager.getFinalState({
          ...state,
          organizationAdmins: {
            value: action.organizationAdmins,
            error: false,
            helperText: '',
          },
        })
      case ActionTypes.SET_ORGANIZATION_NAME:
        return stateManager.getFinalState(
          stateManager.getStateOnSetOrganizationName(state, action),
        )
      default:
        return stateManager.getFinalState({
          ...state,
          isSubmitting: action.isSubmitting,
        })
    }
  }
}

const buildInitialState = (organization?: Organization): State => {
  const isUpdateForm = !!organization
  if (isUpdateForm) {
    return {
      organizationAdmins: {
        value: organization?.users || [],
        error: false,
        helperText: '',
      },
      organizationName: {
        value: organization?.name || '',
        error: false,
        helperText: '',
      },
      isSubmitting: false,
      isSubmitDisabled: true,
    }
  }
  return {
    organizationAdmins: {
      value: organization?.users || [],
      error: false,
      helperText: '',
    },
    organizationName: {
      value: '',
      error: false,
      helperText: '',
    },
    isSubmitting: false,
    isSubmitDisabled: true,
  }
}

const useOrganizationFormReducer = (
  ssoEnabled: boolean,
  organization?: Organization,
) => {
  const { organizationList } = useAPIContext()
  const reducer = useMemo(
    () => getReducer(ssoEnabled, organizationList, organization),
    [ssoEnabled, organizationList, organization],
  )
  const [state, dispatch] = useReducer(reducer, null, () =>
    buildInitialState(organization),
  )
  return {
    state,
    setOrganizationAdmins: (organizationAdmins: User[]) =>
      dispatch({
        type: ActionTypes.SET_ORGANIZATION_ADMINS,
        organizationAdmins,
      }),
    setOrganizationName: (organizationName: string) =>
      dispatch({
        type: ActionTypes.SET_ORGANIZATION_NAME,
        organizationName,
      }),
    setIsSubmitting: (isSubmitting: boolean) =>
      dispatch({
        type: ActionTypes.SET_IS_SUBMITTING,
        isSubmitting,
      }),
  }
}

export default useOrganizationFormReducer
