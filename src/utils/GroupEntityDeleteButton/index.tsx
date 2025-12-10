import { useToggle } from 'utils/hooks'
import { useMutation } from 'react-query'
import config from 'globalConfig'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from '@mui/material'
import { DeleteIcon } from 'utils/icons'
import { useState } from 'react'
import StyledTooltip from 'utils/StyledTooltip'
import { useOnUserChangeAPIData } from 'api'

export type GroupEntityDeleteButtonProps<
  Entity extends { name: string; id: number },
> = {
  canDelete: boolean
  groupEntity: Entity
  apiDeleteFn: (entity: Entity) => Promise<unknown>
  groupEntityCategory: string
}

const GroupEntityDeleteButton = <Entity extends { name: string; id: number }>({
  canDelete,
  apiDeleteFn,
  groupEntity,
  groupEntityCategory,
}: GroupEntityDeleteButtonProps<Entity>) => {
  const [
    isDeleteEntityModalOpen,
    openDeleteEntityModal,
    closeDeleteEntityModal,
  ] = useToggle()
  const [isErrorAlertOpen, openErrorAlert, closeErrorAlert] = useToggle()
  const [isSubmissionLoading, setIsSubmissionLoading] = useState(false)
  const [confirmedValue, setConfirmedValue] = useState('')
  const isYesButtonDisabled = () => groupEntity.name !== confirmedValue

  const resetDeleteDialogState = () => {
    setConfirmedValue('')
    closeErrorAlert()
  }

  const handleModalClose = () => {
    resetDeleteDialogState()
    closeDeleteEntityModal()
  }

  const onUserChangeAPIData = useOnUserChangeAPIData()
  const mutation = useMutation(
    async (entity: Entity) => {
      await apiDeleteFn(entity)
      await onUserChangeAPIData()
    },
    {
      onSuccess: () => {
        setIsSubmissionLoading(false)
        handleModalClose()
      },
      onError: () => {
        setIsSubmissionLoading(false)
        openErrorAlert()
      },
    },
  )

  const handleSubmit = () => {
    setIsSubmissionLoading(true)
    mutation.mutate(groupEntity)
  }

  return canDelete ? (
    <>
      <StyledTooltip
        title={`Delete ${groupEntityCategory}`}
        placement="top"
        enterTouchDelay={config.UI_SETTINGS.TOOL_TIP_DELAY}
      >
        <IconButton
          onClick={openDeleteEntityModal}
          aria-label={`delete-${groupEntityCategory}-${groupEntity.name}`}
          color="secondary"
          size="large"
        >
          <DeleteIcon />
        </IconButton>
      </StyledTooltip>
      <Dialog open={isDeleteEntityModalOpen} aria-labelledby="confirm-dialog">
        {isErrorAlertOpen && (
          <Alert onClose={closeErrorAlert} variant="filled" severity="error">
            Error deleting {groupEntityCategory}.
          </Alert>
        )}
        <DialogTitle>
          Are you sure you want to delete {groupEntityCategory}{' '}
          {groupEntity.name}?
        </DialogTitle>
        <DialogContent>
          <TextField
            value={confirmedValue}
            onChange={event => setConfirmedValue(event.target.value)}
            placeholder={`Enter ${groupEntityCategory} name to confirm`}
            inputProps={{
              'aria-label': `Enter ${groupEntity.name} to Confirm Action`,
            }}
            helperText={
              isYesButtonDisabled() && confirmedValue !== ''
                ? 'Values do not match!'
                : ''
            }
            error={isYesButtonDisabled() && confirmedValue !== ''}
            sx={{ mb: '6%' }}
            multiline
            fullWidth
            required
          />
          <Stack
            direction={{ sx: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              aria-label="No Button"
              onClick={handleModalClose}
            >
              No
            </Button>
            <Button
              variant="contained"
              size="large"
              color="primary"
              type="submit"
              aria-label="Yes Button"
              onClick={handleSubmit}
              disabled={isYesButtonDisabled() || isSubmissionLoading}
            >
              Yes
              {isSubmissionLoading && <CircularProgress size={25} />}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  ) : (
    <IconButton
      aria-label={`delete-${groupEntityCategory}-${groupEntity.name}`}
      color="secondary"
      size="large"
      disabled
    >
      <DeleteIcon />
    </IconButton>
  )
}

export default GroupEntityDeleteButton
