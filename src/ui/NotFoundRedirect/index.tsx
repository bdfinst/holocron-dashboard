import { Alert, AlertTitle } from '@mui/material'

/**
 * @returns {object} JSX the
 * default redirect for the not found
 * component
 */
const NotFoundRedirect: React.FC = () => (
  <Alert severity="warning" sx={{ mx: 'auto', mt: '3%', p: 5 }}>
    <AlertTitle aria-label="Page not found warning">
      Warning: Page not Found
    </AlertTitle>
    The page you requested does not exist. Click the logo to go back to the main
    page.
  </Alert>
)

export default NotFoundRedirect
