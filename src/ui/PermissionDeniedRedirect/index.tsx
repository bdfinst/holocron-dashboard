import { Alert, AlertTitle } from '@mui/material'

const PermissionDeniedRedirect: React.FC = () => (
  <Alert severity="warning" sx={{ mx: 'auto', mt: '3%', p: 5 }}>
    <AlertTitle aria-label="Permission Denied Warning Title">
      Warning: Not enough privileges
    </AlertTitle>
    You do not have enough privileges to view this page.
  </Alert>
)

export default PermissionDeniedRedirect
