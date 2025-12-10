import {
  Checkbox,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import { HelpIcon } from 'utils/icons'
import { useAPIContext, User } from 'api'
import { useState } from 'react'
import Tooltip from 'utils/StyledTooltip'

import { useTablePaginationState } from 'utils/hooks'
import DeleteUserButton from './DeleteUserButton'
import ManageUsersTableToolbar from './ManageUsersTableToolbar'

const FIRST_PAGE = 0

const COLUMN_LOADING_OFFSET = 2

const TableHeaderCell = ({
  title,
  align,
  tipText,
}: {
  title: string
  align: TableCellProps['align']
  tipText?: string
}) =>
  tipText ? (
    <TableCell
      key={title}
      align={align}
      sx={{ backgroundColor: theme => theme.palette.header }}
    >
      <Typography>
        {`${title}`}
        <Tooltip title={tipText}>
          <HelpIcon fontSize="small" />
        </Tooltip>
      </Typography>
    </TableCell>
  ) : (
    <TableCell
      key={title}
      align={align}
      sx={{ backgroundColor: theme => theme.palette.header }}
    >
      {title}
    </TableCell>
  )

const useUserTable = () => {
  const { allUsers } = useAPIContext()

  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    setPage,
    onPageChange,
    onRowsPerPageChange,
  } = useTablePaginationState()

  const selectedUserIdsTable = (() => {
    const table: { [userId: number]: boolean } = {}
    for (const user of selectedUsers) {
      table[user.id] = true
    }
    return table
  })()

  const isUserSelected = (user: User) => user.id in selectedUserIdsTable

  return {
    state: { allUsers, page, selectedUsers, rowsPerPage, rowsPerPageOptions },
    isUserSelected,
    onUserSelected: (user: User) => {
      const isDoubleClicked = isUserSelected(user)
      setSelectedUsers(prevSelectedUsers =>
        isDoubleClicked
          ? prevSelectedUsers.filter(u => u.id !== user.id)
          : [...prevSelectedUsers, user],
      )
    },
    onAllUsersSelected: (
      _: React.ChangeEvent<HTMLInputElement>,
      checked: boolean,
    ) => {
      setSelectedUsers(checked ? allUsers : [])
    },
    onPageChange,
    deSelectUsers: (users: User[]) => {
      const deSelectedUserIdsTable: { [userId: number]: boolean } = {}
      for (const user of users) {
        deSelectedUserIdsTable[user.id] = true
      }
      setSelectedUsers(prevSelectedUsers =>
        prevSelectedUsers.filter(user => !(user.id in deSelectedUserIdsTable)),
      )
      // want to redirect to first page after we have
      // delselected all deleted users
      // because there is the possibility that there
      // are no users in page user is viewing.
      setPage(FIRST_PAGE)
    },
    onRowsPerPageChange,
  }
}

const ManageUsersTable = () => {
  const {
    state: { page, selectedUsers, allUsers, rowsPerPage, rowsPerPageOptions },
    isUserSelected,
    onUserSelected,
    onAllUsersSelected,
    deSelectUsers,
    onPageChange,
    onRowsPerPageChange,
  } = useUserTable()

  const columnHeaders: {
    title: string
    tipText: string
    align: TableCellProps['align']
  }[] = [
    {
      title: 'Username',
      tipText: 'The username of the user',
      align: 'left',
    },
    {
      title: 'Actions',
      tipText: undefined,
      align: 'center',
    },
  ]

  const noResultUI = (
    <TableRow>
      <TableCell
        align="center"
        colSpan={columnHeaders.length + COLUMN_LOADING_OFFSET}
      >
        <Typography>No Users Found</Typography>
      </TableCell>
    </TableRow>
  )

  const numSelected = selectedUsers.length
  const rowCount = allUsers.length

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <ManageUsersTableToolbar
          usersSelected={selectedUsers}
          deSelectUsers={deSelectUsers}
        />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  sx={{ backgroundColor: theme => theme.palette.header }}
                >
                  <Checkbox
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={onAllUsersSelected}
                    inputProps={{
                      'aria-label': 'select all users',
                    }}
                  />
                </TableCell>
                {columnHeaders.map(header => (
                  <TableHeaderCell
                    key={header.title}
                    title={header.title}
                    align={header.align}
                    tipText={header.tipText}
                  />
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {allUsers.length
                ? allUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user: User) => {
                      const isItemSelected = isUserSelected(user)
                      const labelId = `enhanced-table-checkbox-${user.id}`

                      return (
                        <TableRow
                          hover
                          key={user.id}
                          aria-label={`User Table Row-${user.id}`}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              onClick={() => onUserSelected(user)}
                              aria-label={`row-${user.id}-checkbox`}
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                'aria-labelledby': labelId,
                              }}
                            />
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Grid
                              sx={{ flexGrow: 1 }}
                              container
                              spacing={1}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Grid item>
                                <DeleteUserButton
                                  users={[user]}
                                  deSelectUsers={deSelectUsers}
                                />
                              </Grid>
                            </Grid>
                          </TableCell>
                        </TableRow>
                      )
                    })
                : noResultUI}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={allUsers.length}
          rowsPerPage={rowsPerPage}
          page={!allUsers.length || allUsers.length <= 0 ? 0 : page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Grid>
    </Grid>
  )
}

export default ManageUsersTable
