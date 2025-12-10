import { deleteUser, useOnUserChangeAPIData, User } from 'api'
import { useToggle } from 'utils/hooks'
import { useState } from 'react'
import { setLogger, useMutation } from 'react-query'
import reactQueryConfig from 'reactQueryConfig'
import Tooltip from 'utils/StyledTooltip'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material'
import { DeleteIcon } from 'utils/icons'
import config from 'globalConfig'

setLogger(reactQueryConfig.LOGGER)

export type DeleteUserButtonProps = {
  users: User[]
  deSelectUsers: (users: User[]) => void
  bulkDelete?: boolean
}

const DeleteUserButton = ({
  users,
  deSelectUsers,
  bulkDelete = false,
}: DeleteUserButtonProps) => {
  const [isDeleteUserModalOpen, openDeleteUserModal, closeDeleteUserModal] =
    useToggle()
  const [isErrorAlertOpen, openErrorAlert, closeErrorAlert] = useToggle()
  const [isSubmissionLoading, setIsSubmissionLoading] = useState(false)

  const resetDeleteDialogState = () => {
    closeErrorAlert()
  }

  const handleModalClose = () => {
    resetDeleteDialogState()
    closeDeleteUserModal()
  }

  const onUserChangeAPIData = useOnUserChangeAPIData()
  const mutation = useMutation(
    async () => {
      await Promise.all(users.map(user => deleteUser(user)))
      await onUserChangeAPIData()
    },
    {
      onSuccess: () => {
        setIsSubmissionLoading(false)
        deSelectUsers(users)
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
    mutation.mutate()
  }

  return (
    <>
      <Tooltip
        title={bulkDelete ? 'Delete Selected Users' : 'Delete User'}
        placement="top"
        enterTouchDelay={config.UI_SETTINGS.TOOL_TIP_DELAY}
      >
        <IconButton
          onClick={openDeleteUserModal}
          aria-label={
            bulkDelete ? 'delete-user-bulk' : `delete-user-${users[0].username}`
          }
          color="secondary"
          size="large"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        id="confirm-delete-user(s)-dialog"
        open={isDeleteUserModalOpen}
        onClose={handleModalClose}
        aria-labelledby="confirm-delete-user(s)-dialog"
      >
        {isErrorAlertOpen && (
          <Alert onClose={closeErrorAlert} variant="filled" severity="error">
            Error deleting.
          </Alert>
        )}
        <DialogTitle>
          {bulkDelete
            ? 'Are you sure you want to Delete the selected users?'
            : `Are you sure you want to Delete user ${users[0].username}?`}
        </DialogTitle>
        <DialogContent dividers>
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
              disabled={isSubmissionLoading}
            >
              Yes
              {isSubmissionLoading && <CircularProgress size={25} />}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeleteUserButton
