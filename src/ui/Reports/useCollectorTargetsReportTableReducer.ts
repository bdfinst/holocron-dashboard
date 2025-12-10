import { TableSortLabelProps } from '@mui/material'
import { CollectorTarget } from 'api'
import { useReducer } from 'react'

const FIRST_PAGE = 0
export const rowsPerPageOptions = [5, 10, 15, 25]
const [DEFAULT_ROWS_PER_PAGE] = rowsPerPageOptions

enum ActionTypes {
  SORT = 'SORT',
  SEARCH_BY_NAME = 'SEARCH_BY_NAME',
  SEARCH_BY_URL = 'SEARCH_BY_URL',
  SEARCH_BY_STATUS = 'SEARCH_BY_STATUS',
  SET_PAGE = 'SET_PAGE',
  SET_ROWS_PER_PAGE = 'SET_ROWS_PER_PAGE',
}

export enum CollectorTargetStatus {
  ALL = 'ALL',
  UNUSED = 'UNUSED',
  USED = 'USED',
}

type SortCategory = keyof Pick<CollectorTarget, 'name' | 'url'>

type State = {
  name: string
  url: string
  sortCategory: SortCategory
  sortOrder: TableSortLabelProps['direction']
  status: CollectorTargetStatus
  page: number
  rowsPerPage: number
}

type SearchByName = {
  type: ActionTypes.SEARCH_BY_NAME
  name: string
}

type SearchByUrl = {
  type: ActionTypes.SEARCH_BY_URL
  url: string
}

type Sort = {
  type: ActionTypes.SORT
  sortCategory: State['sortCategory']
  sortOrder: State['sortOrder']
}

type SetPage = {
  type: ActionTypes.SET_PAGE
  page: number
}

type SetRowsPerPage = {
  type: ActionTypes.SET_ROWS_PER_PAGE
  rowsPerPage: number
}

type SearchByStatus = {
  type: ActionTypes.SEARCH_BY_STATUS
  status: CollectorTargetStatus
}

type Action =
  | SearchByName
  | SearchByUrl
  | SearchByStatus
  | SetPage
  | SetRowsPerPage
  | Sort

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.SEARCH_BY_NAME:
      return {
        ...state,
        page: FIRST_PAGE,
        name: action.name,
      }
    case ActionTypes.SEARCH_BY_URL:
      return {
        ...state,
        page: FIRST_PAGE,
        url: action.url,
      }
    case ActionTypes.SET_PAGE:
      return {
        ...state,
        page: action.page,
      }
    case ActionTypes.SET_ROWS_PER_PAGE:
      return {
        ...state,
        rowsPerPage: action.rowsPerPage,
      }
    case ActionTypes.SEARCH_BY_STATUS:
      return {
        ...state,
        page: FIRST_PAGE,
        status: action.status,
      }
    default:
      return {
        ...state,
        sortCategory: action.sortCategory,
        sortOrder: action.sortOrder,
      }
  }
}

const useCollectorTargetsReportTableReducer = () => {
  const [state, dispatch] = useReducer(reducer, {
    page: FIRST_PAGE,
    rowsPerPage: DEFAULT_ROWS_PER_PAGE,
    name: '',
    url: '',
    sortOrder: 'asc',
    sortCategory: 'name',
    status: CollectorTargetStatus.ALL,
  })

  return {
    state,
    searchByName: (name: string) =>
      dispatch({ type: ActionTypes.SEARCH_BY_NAME, name }),
    searchByUrl: (url: string) =>
      dispatch({ type: ActionTypes.SEARCH_BY_URL, url }),
    searchByStatus: (status: CollectorTargetStatus) =>
      dispatch({ type: ActionTypes.SEARCH_BY_STATUS, status }),
    setPage: (page: number) => dispatch({ type: ActionTypes.SET_PAGE, page }),
    setRowsPerPage: (rowsPerPage: number) =>
      dispatch({ type: ActionTypes.SET_ROWS_PER_PAGE, rowsPerPage }),
    sortBy: ({
      sortOrder,
      sortCategory,
    }: Pick<State, 'sortOrder' | 'sortCategory'>) =>
      dispatch({ type: ActionTypes.SORT, sortCategory, sortOrder }),
  }
}

export default useCollectorTargetsReportTableReducer
