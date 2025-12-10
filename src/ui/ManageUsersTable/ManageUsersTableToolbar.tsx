import { Toolbar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { User } from 'api'
import DeleteUserButton from './DeleteUserButton'

export type ManageUsersTableToolbarProps = {
  usersSelected: User[]
  deSelectUsers: (users: User[]) => void
}

const ManageUsersTableToolbar = ({
  usersSelected,
  deSelectUsers,
}: ManageUsersTableToolbarProps) => {
  const numSelected = usersSelected.length

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1 },
        ...(numSelected > 0 && {
          bgcolor: theme =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity,
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
          aria-label="number selected"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Users List
        </Typography>
      )}

      {numSelected > 0 && (
        <DeleteUserButton
          users={usersSelected}
          deSelectUsers={deSelectUsers}
          bulkDelete
        />
      )}
    </Toolbar>
  )
}

export default ManageUsersTableToolbar
