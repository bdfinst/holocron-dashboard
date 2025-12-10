import React, { useState, useEffect } from 'react'
import { Stack, Typography } from '@mui/material'
import globalConfig from 'globalConfig'
import { useCollectorTargetsContext, HolocronLoadingScreen } from 'api'
import CollectorTargetsReportTable from './CollectorTargetsReportTable'

export const Reports = () => {
  const { ticketBoards, repositories, isLoading, error } =
    useCollectorTargetsContext()
  const [showLoading, setShowLoading] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
    } else {
      const timer = setTimeout(() => setShowLoading(false), 300)
      return () => clearTimeout(timer)
    }
    return () => {}
  }, [isLoading])

  const blackListTicketBoardsUrlTable = (() => {
    const { BLACKLIST_FEATURE_BOARDS }: { BLACKLIST_FEATURE_BOARDS: string[] } =
      globalConfig.METRICS_SETTINGS
    const result: { [url: string]: boolean } = {}
    for (const url of BLACKLIST_FEATURE_BOARDS) {
      result[url] = true
    }
    return result
  })()

  if (error) {
    return (
      <Typography color="error">
        Error loading collector targets: {error.message}
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      <Stack position="relative">
        <HolocronLoadingScreen
          fullScreen={false}
          showLogo
          text="Loading data..."
          visible={showLoading}
        />
        <Stack justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="h6">Ticket Boards Report</Typography>
          <CollectorTargetsReportTable
            collectorTargets={(ticketBoards || []).filter(
              t => !(t.url in blackListTicketBoardsUrlTable),
            )}
          />
        </Stack>
        <Stack justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="h6">Repositories Report</Typography>
          <CollectorTargetsReportTable collectorTargets={repositories || []} />
        </Stack>
      </Stack>
    </Stack>
  )
}

export default Reports
