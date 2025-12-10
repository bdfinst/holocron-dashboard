import { useReducer, useEffect, useMemo } from 'react'
import { Collector } from 'api'

enum ActionTypes {
  SET_COLLECTORS = 'SET_COLLECTORS',
  SET_SELECTED_COLLECTOR = 'SET_SELECTED_COLLECTOR',
  SET_SELECTED_TAB = 'SET_SELECTED_TAB',
  UPDATE_COLLECTOR_FIELD = 'UPDATE_COLLECTOR_FIELD',
  SET_NOTIFICATION = 'SET_NOTIFICATION',
  SET_OPEN = 'SET_OPEN',
  SET_IS_SUBMITTING = 'SET_IS_SUBMITTING',
}

type State = {
  collectors: Collector[]
  selectedCollector: Collector | null
  selectedTab: number
  notification: {
    message: string
    severity: 'success' | 'error'
    open: boolean
  }
  open: boolean
  isSubmitting: boolean
}

type SetCollectors = { type: ActionTypes.SET_COLLECTORS; payload: Collector[] }
type SetSelectedCollector = {
  type: ActionTypes.SET_SELECTED_COLLECTOR
  payload: Collector
}
type SetSelectedTab = { type: ActionTypes.SET_SELECTED_TAB; payload: number }
type UpdateCollectorField = {
  type: ActionTypes.UPDATE_COLLECTOR_FIELD
  payload: { field: string; value: number | null }
}
type SetNotification = {
  type: ActionTypes.SET_NOTIFICATION
  payload: { message: string; severity: 'success' | 'error' }
}
type SetOpen = { type: ActionTypes.SET_OPEN; payload: boolean }
type SetIsSubmitting = { type: ActionTypes.SET_IS_SUBMITTING; payload: boolean }

type Action =
  | SetCollectors
  | SetSelectedCollector
  | SetSelectedTab
  | UpdateCollectorField
  | SetNotification
  | SetOpen
  | SetIsSubmitting

interface StateManager {
  getFinalState(state: State): State
  getStateOnSetCollectors(state: State, action: SetCollectors): State
  getStateOnSetSelectedCollector(
    state: State,
    action: SetSelectedCollector,
  ): State
  getStateOnUpdateCollectorField(
    state: State,
    action: UpdateCollectorField,
  ): State
}

const createStateManager = (): StateManager => ({
  getFinalState(state) {
    return {
      ...state,
      collectors: sortCollectors(state.collectors),
    }
  },
  getStateOnSetCollectors(state, action) {
    return {
      ...state,
      collectors: sortCollectors(action.payload),
    }
  },
  getStateOnSetSelectedCollector(state, action) {
    return {
      ...state,
      selectedCollector: { ...action.payload },
    }
  },
  getStateOnUpdateCollectorField(state, action) {
    const { field, value } = action.payload
    return {
      ...state,
      selectedCollector: {
        ...state.selectedCollector,
        [field]: value,
      } as Collector,
    }
  },
})

const reducer = (
  state: State,
  action: Action,
  stateManager: StateManager,
): State => {
  switch (action.type) {
    case ActionTypes.SET_COLLECTORS:
      return stateManager.getFinalState(
        stateManager.getStateOnSetCollectors(state, action),
      )
    case ActionTypes.SET_SELECTED_COLLECTOR:
      return stateManager.getFinalState(
        stateManager.getStateOnSetSelectedCollector(state, action),
      )
    case ActionTypes.SET_SELECTED_TAB:
      return {
        ...state,
        selectedTab: action.payload,
      }
    case ActionTypes.UPDATE_COLLECTOR_FIELD:
      return stateManager.getFinalState(
        stateManager.getStateOnUpdateCollectorField(state, action),
      )
    case ActionTypes.SET_NOTIFICATION:
      return {
        ...state,
        notification: {
          ...action.payload,
          open: action.payload.message !== '',
        },
      }
    case ActionTypes.SET_OPEN:
      return { ...state, open: action.payload }
    case ActionTypes.SET_IS_SUBMITTING:
      return { ...state, isSubmitting: action.payload }
    default:
      return state
  }
}

/**
 * Sorts an array of collectors based on their IDs in ascending order.
 * This is used to ensure that the collectors are always displayed in the same order.
 * As the API seems to return collectors in the order they were last updated
 * @param {Collector[]} collectors - The array of collectors to be sorted.
 * @return {Collector[]} The sorted array of collectors.
 */
const sortCollectors = (collectors: Collector[]): Collector[] =>
  [...collectors].sort((a, b) => a.id - b.id)

const useCollectorFormReducer = (initialCollectors: Collector[]) => {
  const stateManager = useMemo(() => createStateManager(), [initialCollectors])

  const [state, dispatch] = useReducer(
    (state: State, action: Action) => reducer(state, action, stateManager),
    {
      collectors: sortCollectors(initialCollectors),
      selectedCollector: initialCollectors[0] || null,
      selectedTab: 0,
      notification: {
        message: '',
        severity: 'success',
        open: false,
      },
      open: false,
      isSubmitting: false,
    },
  )

  useEffect(() => {
    dispatch({ type: ActionTypes.SET_COLLECTORS, payload: initialCollectors })
    dispatch({
      type: ActionTypes.SET_SELECTED_COLLECTOR,
      payload: initialCollectors[0],
    })
  }, [initialCollectors])

  return {
    state,
    setCollectors: (collectors: Collector[]) =>
      dispatch({ type: ActionTypes.SET_COLLECTORS, payload: collectors }),
    setSelectedCollector: (collector: Collector) =>
      dispatch({
        type: ActionTypes.SET_SELECTED_COLLECTOR,
        payload: collector,
      }),
    setSelectedTab: (selectedTab: number) =>
      dispatch({ type: ActionTypes.SET_SELECTED_TAB, payload: selectedTab }),
    updateCollectorField: (field: string, value: number | null) =>
      dispatch({
        type: ActionTypes.UPDATE_COLLECTOR_FIELD,
        payload: { field, value },
      }),
    setNotification: (message: string, severity: 'success' | 'error') =>
      dispatch({
        type: ActionTypes.SET_NOTIFICATION,
        payload: { message, severity },
      }),
    setOpen: (open: boolean) =>
      dispatch({ type: ActionTypes.SET_OPEN, payload: open }),
    setIsSubmitting: (isSubmitting: boolean) =>
      dispatch({ type: ActionTypes.SET_IS_SUBMITTING, payload: isSubmitting }),
  }
}

export default useCollectorFormReducer
