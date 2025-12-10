import {
  Alert,
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
import { updatePayRates, useOnUserChangeAPIData } from 'api'
import DropzoneForm from 'utils/DropzoneForm'
import {
  CheckCircleFilledIcon,
  CloseIcon,
  ErrorFilledIcon,
  FileUploadIcon,
} from 'utils/icons'
import globalConfig from 'globalConfig'
import { useToggle } from 'utils/hooks'
import { useState } from 'react'
import { useMutation } from 'react-query'
import { FILE_PARSING_ERROR_MESSAGES, getPayRatesFromFile } from './utils'

const { METRICS_SETTINGS, UI_SETTINGS } = globalConfig
const { FTE_RATE_UNIT } = METRICS_SETTINGS

const { ERROR_HIDE_DURATION, SUCCESS_HIDE_DURATION } = UI_SETTINGS

const DropzoneHelpMessage = () => (
  <Typography component="p">
    {`Upload csv files with the columns "email" and "rate" where "rate" is the FTE rate for the user as a number or currency greater than 0 (Example: 19, 19.00 or ${FTE_RATE_UNIT}19.00)`}
  </Typography>
)

const UploadEffortRate = () => {
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

  const mutation = useMutation(updatePayRates)

  const onFilesSubmit = async (files: File[]) => {
    setIsSubmitting(true)
    try {
      const eachFilePayRates = await Promise.all(files.map(getPayRatesFromFile))
      await mutation.mutateAsync({
        rates: eachFilePayRates.flatMap(rates => rates),
      })
      await onUserChangeAPIData()
      setIsSubmitting(false)
      closeDropzoneFormDialog()
      openSuccessSnackBar()
    } catch (error) {
      setErrorSnackBarMessage(
        error instanceof Error &&
          error.message === FILE_PARSING_ERROR_MESSAGES.INVALID_CSV
          ? `Failed to parse csv: ${FILE_PARSING_ERROR_MESSAGES.INVALID_CSV}`
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
          icon={<CheckCircleFilledIcon color="primary" />}
        >
          <Typography color="primary">Successfully uploaded rates!</Typography>
        </Alert>
      </Snackbar>

      <Button
        onClick={openDropzoneFormDialog}
        variant="contained"
        size="small"
        sx={{ width: 'fit-content' }}
        startIcon={<FileUploadIcon />}
        aria-label="Upload FTE Rates"
      >
        Upload FTE Rates
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
            inputElementFileTypeAccept="text/csv"
            inputElementFileTypeAcceptExtensions={['.csv']}
            inputElementId="upload-fte-rates"
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UploadEffortRate
