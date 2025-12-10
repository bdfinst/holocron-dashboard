import { Box, Card, Grid, LinearProgress, Stack, styled } from '@mui/material'

const SlowLinearProgress = styled(LinearProgress)({
  height: 10,
  borderRadius: 5,
  '& .MuiLinearProgress-bar': {
    // apply a new animation-duration to the `.bar` class
    animationDuration: '5s',
  },
})

const DashboardLoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      rowGap: 3,
    }}
  >
    <Grid container spacing={{ xs: 5, md: 2 }} justifyContent="space-between">
      {[...Array(4).keys()].map(num => (
        <Grid key={`header-item-${num}`} item xs={12} md={3}>
          <Card
            variant="outlined"
            sx={{
              p: 3,
            }}
          >
            <SlowLinearProgress />
          </Card>
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2} aria-label="Dashboard Body Loading">
      {[...Array(9).keys()].map(num => (
        <Grid item key={`item-${num}`} xs={12} sm={4}>
          <Card
            variant="outlined"
            sx={{
              textAlign: 'center',
              p: '22%',
            }}
          >
            <Stack spacing={3}>
              <SlowLinearProgress />
              <SlowLinearProgress />
              <SlowLinearProgress />
              <SlowLinearProgress />
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
)

export default DashboardLoadingScreen
