import {
  Grid,
  InputAdornment,
  TableCell,
  TableCellProps,
  TextField,
  TextFieldProps,
  Typography,
  TableRow,
  TablePagination,
  TableContainer,
  Table,
  TableHead,
  TableBody,
} from '@mui/material'
import { GroupEntityAddButton } from 'utils/GroupEntityLinkButtons'
import StyledTooltip from 'utils/StyledTooltip'
import { HelpIcon, SearchIcon } from 'utils/icons'
import { useTablePaginationState } from 'utils/hooks'
import { useState } from 'react'

const COLUMN_OFFSET = 2
const FIRST_PAGE = 0

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
        <StyledTooltip title={tipText}>
          <HelpIcon fontSize="small" />
        </StyledTooltip>
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

const SearchBox = ({
  value,
  onChange,
  groupEntityCategory,
  addGroupEntityLink,
  canCreate,
}: {
  value: string
  onChange: TextFieldProps['onChange']
  groupEntityCategory: string
  addGroupEntityLink: string
  canCreate: boolean
}) => (
  <Grid
    container
    spacing={1}
    direction="row"
    justifyContent="center"
    alignItems="center"
  >
    <Grid item sm={6} xs={9}>
      <TextField
        placeholder={`Search ${groupEntityCategory} by name`}
        fullWidth
        value={value}
        onChange={onChange}
        inputProps={{
          'aria-label': `Search ${groupEntityCategory} by name`,
        }}
        // should not be duplicate props
        // eslint-disable-next-line react/jsx-no-duplicate-props
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        size="small"
        variant="standard"
      />
    </Grid>
    <Grid item>
      <GroupEntityAddButton
        hasAccess={canCreate}
        groupEntityCategory={groupEntityCategory}
        link={addGroupEntityLink}
      />
    </Grid>
  </Grid>
)

type Column = {
  // title for table column
  title: string
  // optional tooltip for table column
  tipText?: string
  // where the table column
  // should be aligned when rendering
  // the table column
  align: TableCellProps['align']
}

export type GroupEntityTableProps<Entity extends { id: number; name: string }> =
  {
    // table columns
    columns: Column[]
    // the callback to render each row (entity)
    renderRow: (entity: Entity) => JSX.Element
    // the entities to render
    entities: Entity[]
    // the category of group entity
    groupEntityCategory: string
    // the link to adding the group entity page
    addGroupEntityLink: string
    // whether the current user can create the group entity
    canCreate: boolean
  }

const GroupEntityTable = <Entity extends { id: number; name: string }>({
  canCreate,
  columns,
  renderRow,
  entities,
  groupEntityCategory,
  addGroupEntityLink,
}: GroupEntityTableProps<Entity>) => {
  const [enteredName, setEnteredName] = useState('')
  const {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    setPage,
    onPageChange,
    onRowsPerPageChange,
  } = useTablePaginationState()

  const onNameEntered: TextFieldProps['onChange'] = event => {
    setPage(FIRST_PAGE)
    setEnteredName(event.target.value)
  }

  const noResultUI = (
    <TableRow>
      <TableCell align="center" colSpan={columns.length + COLUMN_OFFSET}>
        <Typography>No Items Found</Typography>
      </TableCell>
    </TableRow>
  )

  const filteredItems = entities.filter(entity =>
    entity.name.toLowerCase().includes(enteredName.toLowerCase()),
  )

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} mb="2%">
        <SearchBox
          canCreate={canCreate}
          value={enteredName}
          onChange={onNameEntered}
          groupEntityCategory={groupEntityCategory}
          addGroupEntityLink={addGroupEntityLink}
        />
      </Grid>
      <Grid item xs={12}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map(header => (
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
              {filteredItems.length > 0
                ? filteredItems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(renderRow)
                : noResultUI}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Grid>
    </Grid>
  )
}

export default GroupEntityTable
