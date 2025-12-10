import globalConfig from 'globalConfig'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { CancelIcon, FileUploadIcon, NavigateNext } from 'utils/icons'
import { red } from '@mui/material/colors'
import useDropzoneFormReducer from './reducer'

const { SECURITY_SETTINGS, UI_SETTINGS } = globalConfig
const { MAX_FILE_SIZE_UPLOAD } = SECURITY_SETTINGS
const { ERROR_HIDE_DURATION } = UI_SETTINGS

export type DropzoneProps = {
  maxFilesUserCanUpload: number
  onFilesSubmit: (files: File[]) => void
  isSubmitting: boolean
  inputElementId: string
  inputElementFileTypeAccept: string
  inputElementFileTypeAcceptExtensions: string[]
  DropzoneHelpMessage: React.ComponentType
}

const FilesListUI = ({
  removeFile,
  files,
}: {
  removeFile?: (file: File) => void
  files: File[]
}) => (
  <List>
    {files.map(file => (
      <ListItem key={file.name} disablePadding>
        <ListItemButton>
          {removeFile && (
            <IconButton
              aria-label={`Remove ${file.name}`}
              onClick={() => {
                removeFile(file)
              }}
            >
              <CancelIcon />
            </IconButton>
          )}
          <ListItemText primary={`${file.name} - ${file.size} bytes`} />
        </ListItemButton>
      </ListItem>
    ))}
  </List>
)

const DropzoneForm = ({
  maxFilesUserCanUpload,
  onFilesSubmit,
  isSubmitting,
  inputElementId,
  inputElementFileTypeAccept,
  inputElementFileTypeAcceptExtensions,
  DropzoneHelpMessage,
}: DropzoneProps) => {
  const {
    state,
    addFiles,
    removeFile,
    setFileRejectionReason,
    showConfirmationMessageUI,
    hideConfirmationMessageUI,
  } = useDropzoneFormReducer(
    maxFilesUserCanUpload,
    MAX_FILE_SIZE_UPLOAD,
    inputElementFileTypeAcceptExtensions,
  )

  const {
    acceptedFiles,
    fileRejectionReason,
    isNextStepsButtonDisabled,
    isConfirmationMessageUIShown,
  } = state

  const errorAlertIsOpen = fileRejectionReason !== ''

  const closeErrorAlert = () => setFileRejectionReason('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    if (event.target.files && event.target.files[0]) {
      addFiles([...event.target.files])
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      addFiles([...event.dataTransfer.files])
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      {!isConfirmationMessageUIShown && (
        <>
          <Snackbar
            open={errorAlertIsOpen}
            autoHideDuration={ERROR_HIDE_DURATION}
            onClose={closeErrorAlert}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              variant="filled"
              severity="error"
              sx={{ backgroundColor: red.A400 }}
            >
              Error uploading file due to reasons : {fileRejectionReason}
            </Alert>
          </Snackbar>
          <Stack spacing={2}>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              aria-label="Drag and Drop File Area"
            >
              <label htmlFor={inputElementId}>
                <Box
                  sx={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    borderRadius: 2,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    p: 5,
                    backgroundColor: theme => theme.palette.background.paper,
                  }}
                >
                  <input
                    type="file"
                    onChange={handleChange}
                    multiple
                    accept={inputElementFileTypeAccept}
                    hidden
                    id={inputElementId}
                    aria-label="Upload File Input Box"
                  />
                  <DropzoneHelpMessage />
                  <br />
                  <Typography>
                    Click and upload, or drag and drop files here. You can
                    upload up to {maxFilesUserCanUpload} files.
                  </Typography>
                  <FileUploadIcon />
                </Box>
              </label>
            </div>
            <Typography>Accepted Files:</Typography>
            <FilesListUI files={acceptedFiles} removeFile={removeFile} />
            {!isNextStepsButtonDisabled && (
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Button
                  aria-label="Go To Next Steps"
                  onClick={showConfirmationMessageUI}
                  endIcon={<NavigateNext />}
                  variant="contained"
                  color="success"
                  sx={{ ml: 'auto' }}
                >
                  Next
                </Button>
              </Box>
            )}
          </Stack>
        </>
      )}
      {isConfirmationMessageUIShown && (
        <Fade in={isConfirmationMessageUIShown} timeout={1200}>
          <Stack spacing={2}>
            <Typography>
              Are you sure you want to submit these files?
            </Typography>
            <FilesListUI files={acceptedFiles} />
            <Stack
              direction={{ sx: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                variant="contained"
                size="large"
                aria-label="No Do Not Submit"
                onClick={hideConfirmationMessageUI}
              >
                No
              </Button>
              <Button
                variant="contained"
                size="large"
                color="primary"
                type="submit"
                aria-label="Yes Submit Files"
                onClick={() => onFilesSubmit(acceptedFiles)}
                disabled={isSubmitting}
              >
                Yes
                {isSubmitting && <CircularProgress size={25} />}
              </Button>
            </Stack>
          </Stack>
        </Fade>
      )}
    </>
  )
}

export default DropzoneForm
