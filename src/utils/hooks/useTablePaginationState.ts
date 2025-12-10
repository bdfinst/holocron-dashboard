import { useState } from 'react'
import { TablePaginationProps } from '@mui/material'

export default function useTablePaginationState(
  FIRST_PAGE = 0,
  DEFAULT_ROWS_PER_PAGE = 5,
  rowsPerPageOptions = [5, 10, 15, 25],
) {
  const [page, setPage] = useState(FIRST_PAGE)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)

  const onPageChange: TablePaginationProps['onPageChange'] = (_, newPage) => {
    setPage(newPage)
  }

  const onRowsPerPageChange: TablePaginationProps['onRowsPerPageChange'] =
    event => {
      setRowsPerPage(+event.target.value)
      setPage(FIRST_PAGE)
    }

  return {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    setPage,
    setRowsPerPage,
    onPageChange,
    onRowsPerPageChange,
  }
}
