import { Box, Stack } from '@mui/material'
import OnboardOrganizationWidget from 'ui/OnboardOrganizationWidget'
import OnboardValueStreamWidget from 'ui/OnboardValueStreamWidget'
import OnboardTeamWidget from 'ui/OnboardTeamWidget'
import UploadEffortRate from 'ui/UploadEffortRate'
import { useAPIContext } from 'api'
import ManageUsersTable from 'ui/ManageUsersTable'
import ConfigureCollectors from 'ui/ConfigureCollectors'

const AdminPageHeader = () => {
  const { featureFlags, currentUser } = useAPIContext()

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      {featureFlags.FEATURE_COST_METRICS && currentUser.isOrgLeadership && (
        <UploadEffortRate />
      )}
      {featureFlags.FEATURE_COLLECTOR_CONFIGURATION && currentUser.isAdmin && (
        <ConfigureCollectors />
      )}
    </Stack>
  )
}

const AdminPage = () => {
  const { currentUser } = useAPIContext()

  return (
    <Box sx={{ width: { xs: '100%', sm: '80%' }, mx: 'auto' }}>
      <Stack spacing={2}>
        <AdminPageHeader />
        <OnboardOrganizationWidget />
        <OnboardValueStreamWidget />
        <OnboardTeamWidget />
        {currentUser.isAdmin && <ManageUsersTable />}
      </Stack>
    </Box>
  )
}

export default AdminPage
