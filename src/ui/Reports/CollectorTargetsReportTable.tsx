import { CollectorTarget } from 'api'
import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material'
import { SearchIcon } from 'utils/icons'
import StyledTooltip from 'utils/StyledTooltip'
import globalConfig from 'globalConfig'
import useCollectorTargetsReportTableReducer, {
  CollectorTargetStatus,
} from './useCollectorTargetsReportTableReducer'

export type CollectorTargetsReportTableProps = {
  collectorTargets: CollectorTarget[]
}

const FIRST_PAGE = 0
const COLUMN_COUNT = 3
const COLUMN_OFFSET = 2

const CollectorTargetsReportTable = ({
  collectorTargets,
}: CollectorTargetsReportTableProps) => {
  const {
    state,
    searchByName,
    searchByUrl,
    searchByStatus,
    setPage,
    setRowsPerPage,
    sortBy,
  } = useCollectorTargetsReportTableReducer()

  const { name, url, sortCategory, status, sortOrder, rowsPerPage, page } =
    state

  const finalizedCollectorTargets = collectorTargets
    .filter(ct => ct.name.toLowerCase().includes(name.toLowerCase()))
    .filter(ct => ct.url.toLowerCase().includes(url.toLowerCase()))
    .filter(ct => {
      switch (status) {
        case CollectorTargetStatus.USED:
          return !!ct.teamId
        case CollectorTargetStatus.UNUSED:
          return !ct.teamId
        default:
          return true
      }
    })
    .sort((a, b) => {
      const [aValue, bValue] = [a[sortCategory], b[sortCategory]]
      let comparison = 0
      if (aValue < bValue) {
        comparison = -1
      } else if (aValue > bValue) {
        comparison = 1
      }
      if (sortOrder === 'desc') {
        comparison *= -1
      }
      return comparison
    })

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: theme => theme.palette.header,
            }}
          >
            <TableCell
              aria-label="Table Column Name"
              sx={{ minWidth: 265, p: 1 }}
            >
              <StyledTooltip
                title={
                  sortOrder === 'asc'
                    ? 'Sort by Name Descending'
                    : 'Sort by Name Ascending'
                }
                placement="top"
                enterTouchDelay={globalConfig.UI_SETTINGS.TOOL_TIP_DELAY}
              >
                <TableSortLabel
                  active={sortCategory === 'name'}
                  aria-label={
                    sortOrder === 'asc'
                      ? 'Sort by Name Descending'
                      : 'Sort by Name Ascending'
                  }
                  direction={sortOrder}
                  onClick={() =>
                    sortBy({
                      sortOrder: sortOrder === 'asc' ? 'desc' : 'asc',
                      sortCategory: 'name',
                    })
                  }
                />
              </StyledTooltip>
              <TextField
                placeholder="Search by Name"
                InputProps={{
                  'aria-label': 'Search by Name',
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                value={name}
                onChange={event => {
                  searchByName(event.target.value)
                }}
                variant="standard"
              />
            </TableCell>
            <TableCell
              aria-label="Table Column Url"
              sx={{ minWidth: 265, p: 1 }}
            >
              <StyledTooltip
                title={
                  sortOrder === 'asc'
                    ? 'Sort by Url Descending'
                    : 'Sort by Url Ascending'
                }
                placement="top"
                enterTouchDelay={globalConfig.UI_SETTINGS.TOOL_TIP_DELAY}
              >
                <TableSortLabel
                  active={sortCategory === 'url'}
                  aria-label={
                    sortOrder === 'asc'
                      ? 'Sort by Url Descending'
                      : 'Sort by Url Ascending'
                  }
                  direction={sortOrder}
                  onClick={() =>
                    sortBy({
                      sortOrder: sortOrder === 'asc' ? 'desc' : 'asc',
                      sortCategory: 'url',
                    })
                  }
                />
              </StyledTooltip>
              <TextField
                placeholder="Search by Url"
                InputProps={{
                  'aria-label': 'Search by Url',
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                value={url}
                onChange={event => {
                  searchByUrl(event.target.value)
                }}
                variant="standard"
              />
            </TableCell>
            <TableCell
              aria-label="Table Column Usage"
              sx={{ minWidth: 100, p: 1 }}
            >
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  disableUnderline
                  aria-label="Select Status Category"
                  variant="standard"
                  value={status}
                  onChange={event => {
                    searchByStatus(event.target.value as CollectorTargetStatus)
                  }}
                >
                  <MenuItem value={CollectorTargetStatus.ALL}>All</MenuItem>
                  <MenuItem value={CollectorTargetStatus.UNUSED}>
                    Unused
                  </MenuItem>
                  <MenuItem value={CollectorTargetStatus.USED}>Used</MenuItem>
                </Select>
              </FormControl>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {finalizedCollectorTargets.length === 0 ? (
            <TableRow>
              <TableCell align="center" colSpan={COLUMN_COUNT + COLUMN_OFFSET}>
                <Typography aria-label="No items found">
                  No items found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            finalizedCollectorTargets
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(ct => (
                <TableRow key={ct.id}>
                  <TableCell>{ct.name}</TableCell>
                  <TableCell>{ct.url}</TableCell>
                  <TableCell>{ct.teamId ? 'Used' : 'Unused'}</TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        rowsPerPageOptions={[5, 10, 15, 25]}
        count={finalizedCollectorTargets.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={event => {
          setRowsPerPage(+event.target.value)
          setPage(FIRST_PAGE)
        }}
      />
    </TableContainer>
  )
}

export default CollectorTargetsReportTable
