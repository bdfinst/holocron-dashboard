import { useReducer } from 'react'

enum ActionTypes {
  ADD_FILES = 'ADD_FILES',
  REMOVE_FILE = 'REMOVE_FILE',
  SET_FILE_REJECTION_REASON = 'SET_FILE_REJECTION_REASON',
  SHOW_CONFIRMATION_MESSAGE_UI = 'SHOW_CONFIRMATION_MESSAGE_UI',
  HIDE_CONFIRMATION_MESSAGE_UI = 'HIDE_CONFIRMATION_MESSAGE_UI',
}

type AddFiles = {
  type: ActionTypes.ADD_FILES
  addedFiles: File[]
}

type RemoveFile = {
  type: ActionTypes.REMOVE_FILE
  file: File
}

type SetFileRejectionReason = {
  type: ActionTypes.SET_FILE_REJECTION_REASON
  fileRejectionReason: string
}

type ShowConfirmationMessageUI = {
  type: ActionTypes.SHOW_CONFIRMATION_MESSAGE_UI
}

type HideConfirmationMessageUI = {
  type: ActionTypes.HIDE_CONFIRMATION_MESSAGE_UI
}

type State = {
  acceptedFiles: File[]
  isConfirmationMessageUIShown: boolean
  fileRejectionReason: string
  isNextStepsButtonDisabled: boolean
  staticState: {
    maxFiles: number
    maxFileSize: number
    inputElementFileTypeAcceptExtensions: string[]
  }
}

type Action =
  | AddFiles
  | RemoveFile
  | SetFileRejectionReason
  | ShowConfirmationMessageUI
  | HideConfirmationMessageUI

const getStateOnAddFiles = (state: State, action: AddFiles): State => {
  const { acceptedFiles: previousFiles, staticState } = state
  const { addedFiles } = action
  const previousFileNamesTable: { [fileName: string]: boolean } = {}
  for (const file of previousFiles) {
    previousFileNamesTable[file.name] = true
  }

  const isUniqueFile = (file: File) => !(file.name in previousFileNamesTable)

  const addedFilesWithNoDuplicates = addedFiles.filter(isUniqueFile)

  const fileRejectionReason = (() => {
    const { maxFiles, maxFileSize, inputElementFileTypeAcceptExtensions } =
      staticState
    const isInvalidFileExtension = addedFilesWithNoDuplicates.some(
      file =>
        !inputElementFileTypeAcceptExtensions.some(fileExtension =>
          file.name.endsWith(fileExtension),
        ),
    )
    if (isInvalidFileExtension) {
      return 'Some files do not have a valid extension. Please follow directions on what files to accept on help message.'
    }
    if (previousFiles.length + addedFilesWithNoDuplicates.length > maxFiles) {
      return `More than ${maxFiles} uploaded`
    }
    if (addedFilesWithNoDuplicates.some(file => file.size > maxFileSize)) {
      return `File cannot be more than ${maxFileSize} bytes`
    }
    return ''
  })()

  const acceptedFilesState =
    fileRejectionReason === ''
      ? [...previousFiles, ...addedFilesWithNoDuplicates]
      : previousFiles

  return {
    ...state,
    fileRejectionReason,
    acceptedFiles: acceptedFilesState,
    isNextStepsButtonDisabled: acceptedFilesState.length === 0,
  }
}

const getStateOnRemoveFile = (state: State, action: RemoveFile): State => {
  const { file: fileToRemove } = action
  const acceptedFiles = state.acceptedFiles.filter(
    file => file.name !== fileToRemove.name,
  )
  return {
    ...state,
    acceptedFiles,
    isNextStepsButtonDisabled: acceptedFiles.length === 0,
  }
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.ADD_FILES:
      return getStateOnAddFiles(state, action)
    case ActionTypes.REMOVE_FILE:
      return getStateOnRemoveFile(state, action)
    case ActionTypes.SET_FILE_REJECTION_REASON:
      return {
        ...state,
        fileRejectionReason: action.fileRejectionReason,
      }
    case ActionTypes.SHOW_CONFIRMATION_MESSAGE_UI:
      return {
        ...state,
        isConfirmationMessageUIShown: true,
      }
    default:
      return {
        ...state,
        isConfirmationMessageUIShown: false,
        acceptedFiles: [],
        fileRejectionReason: '',
        isNextStepsButtonDisabled: true,
      }
  }
}

const useDropzoneFormReducer = (
  maxFiles: number,
  maxFileSize: number,
  inputElementFileTypeAcceptExtensions: string[],
) => {
  const [state, dispatch] = useReducer(reducer, {
    acceptedFiles: [],
    fileRejectionReason: '',
    isConfirmationMessageUIShown: false,
    isNextStepsButtonDisabled: true,
    staticState: {
      maxFiles,
      maxFileSize,
      inputElementFileTypeAcceptExtensions,
    },
  })

  return {
    state,
    addFiles: (addedFiles: File[]) =>
      dispatch({ type: ActionTypes.ADD_FILES, addedFiles }),
    removeFile: (file: File) =>
      dispatch({ type: ActionTypes.REMOVE_FILE, file }),
    setFileRejectionReason: (fileRejectionReason: string) =>
      dispatch({
        type: ActionTypes.SET_FILE_REJECTION_REASON,
        fileRejectionReason,
      }),
    showConfirmationMessageUI: () =>
      dispatch({ type: ActionTypes.SHOW_CONFIRMATION_MESSAGE_UI }),
    hideConfirmationMessageUI: () =>
      dispatch({ type: ActionTypes.HIDE_CONFIRMATION_MESSAGE_UI }),
  }
}

export default useDropzoneFormReducer
