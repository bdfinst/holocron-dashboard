import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { green, red } from '@mui/material/colors'
import { updateTeamMembers, useOnUserChangeAPIData } from 'api'
import DropzoneForm from 'utils/DropzoneForm'
import {
  CheckCircleFilledIcon,
  CloseIcon,
  ErrorFilledIcon,
  FileUploadIcon,
} from 'utils/icons'
import { useToggle } from 'utils/hooks'
import { useState } from 'react'
import { useMutation } from 'react-query'
import globalConfig from 'globalConfig'
import remarkGFM from 'remark-gfm'
import ReactMarkdown from 'react-markdown'
import helpContent from './helpContent.md'
import { FileParsingErrorMessages, getMembersFromFile } from './utils'

const { UI_SETTINGS } = globalConfig

const { ERROR_HIDE_DURATION, SUCCESS_HIDE_DURATION } = UI_SETTINGS

const DropzoneHelpMessage = () => (
  <Box
    sx={{
      maxHeight: 200,
      overflow: 'scroll',
      maxWidth: '100%',
    }}
  >
    <ReactMarkdown remarkPlugins={[remarkGFM]}>{helpContent}</ReactMarkdown>
  </Box>
)

const UploadTeamMembersFile = ({ teamId }: { teamId: number }) => {
  const theme = useTheme()
  const extraSmallScreenSizeIsViewed = useMediaQuery(
    theme.breakpoints.down('sm'),
  )

  const [
    isDropzoneFormDialogOpen,
    openDropzoneFormDialog,
    closeDropzoneFormDialog,
  ] = useToggle()

  const [isSuccessSnackBarOpen, openSuccessSnackBar, closeSuccessSnackBar] =
    useToggle()

  const [errorSnackBarMessage, setErrorSnackBarMessage] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onUserChangeAPIData = useOnUserChangeAPIData()

  const mutation = useMutation(updateTeamMembers)

  const onFilesSubmit = async (files: File[]) => {
    setIsSubmitting(true)
    try {
      const eachFilesMembers = await Promise.all(files.map(getMembersFromFile))
      await mutation.mutateAsync({
        id: teamId,
        teamMembers: eachFilesMembers.flatMap(fileMembers =>
          fileMembers.map(member => {
            const noEndDate = Number.isNaN(new Date(member.end_date).getTime())
            return {
              endDate: noEndDate
                ? undefined
                : new Date(member.end_date).toISOString(),
              member: { username: member.username, name: member.name },
              startDate: new Date(member.start_date).toISOString(),
            }
          }),
        ),
      })
      await onUserChangeAPIData()
      setIsSubmitting(false)
      closeDropzoneFormDialog()
      openSuccessSnackBar()
    } catch (error) {
      setErrorSnackBarMessage(
        error instanceof Error &&
          (error.message === FileParsingErrorMessages.INVALID_JSON ||
            error.message === FileParsingErrorMessages.INVALID_SCHEMA)
          ? `Json file format error: ${error.message}`
          : 'Error submitting.',
      )
      setIsSubmitting(false)
    }
  }

  const onErrorSnackbarClose = () => {
    setErrorSnackBarMessage('')
  }

  return (
    <>
      <Snackbar
        open={errorSnackBarMessage !== ''}
        autoHideDuration={ERROR_HIDE_DURATION}
        onClose={onErrorSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        role="alert"
        aria-label="Error Alert"
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ backgroundColor: red.A400 }}
          icon={<ErrorFilledIcon color="primary" />}
        >
          <Typography color="primary">{errorSnackBarMessage}</Typography>
        </Alert>
      </Snackbar>
      <Snackbar
        open={isSuccessSnackBarOpen}
        autoHideDuration={SUCCESS_HIDE_DURATION}
        onClose={closeSuccessSnackBar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        role="alert"
        aria-label="Success Alert"
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ backgroundColor: green.A400 }}
          icon={<CheckCircleFilledIcon color="primary" />}
        >
          <Typography color="primary">
            Successfully uploaded team members!
          </Typography>
        </Alert>
      </Snackbar>

      <Button
        onClick={openDropzoneFormDialog}
        variant="contained"
        size="small"
        sx={{ width: 'fit-content' }}
        startIcon={<FileUploadIcon />}
        aria-label="Upload Team Members File"
      >
        Upload Team Members File
      </Button>

      <Dialog
        open={isDropzoneFormDialogOpen}
        onClose={closeDropzoneFormDialog}
        fullScreen={extraSmallScreenSizeIsViewed}
      >
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={closeDropzoneFormDialog}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DropzoneForm
            maxFilesUserCanUpload={3}
            DropzoneHelpMessage={DropzoneHelpMessage}
            onFilesSubmit={onFilesSubmit}
            inputElementFileTypeAccept="application/json"
            inputElementFileTypeAcceptExtensions={['.json']}
            inputElementId="upload-team-members-json-file"
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UploadTeamMembersFile
