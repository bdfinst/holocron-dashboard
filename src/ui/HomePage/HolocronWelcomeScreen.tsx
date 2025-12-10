import { Box, Stack, Typography } from '@mui/material'

const HolocronWelcomeScreen = () => (
  <Box sx={{ justifyContent: 'center', alignItems: 'center' }}>
    <Stack spacing={2}>
      <Typography variant="h4">Welcome to Holocron!</Typography>
      <Typography>
        {`It seems like this is your first time visiting Holocron. You don't have
        any permissions on this application. Contact an administrator or your
        team lead to gain access.`}
      </Typography>
    </Stack>
  </Box>
)

export default HolocronWelcomeScreen
