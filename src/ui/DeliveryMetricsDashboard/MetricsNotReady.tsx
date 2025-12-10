import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'

export type MetricsNotReadyProps = {
  message: string
}

const MetricsNotReady = ({ message }: MetricsNotReadyProps) => (
  <Grid item sx={{ minWidth: '80%', maxWidth: '80%', minHeight: '80%', p: 2 }}>
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={4}>
          <img
            src="/holocron-logo-color.svg"
            alt="No Data Holocron Logo"
            aria-label="No Data Holocron Logo"
            height={100}
          />
          <Typography
            aria-label="data-not-ready-message"
            textAlign="center"
            variant="h6"
          >
            {message}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  </Grid>
)

export default MetricsNotReady
