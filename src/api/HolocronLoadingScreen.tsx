import React from 'react'
import {
  Box,
  LinearProgress,
  Typography,
  Stack,
  styled,
  Fade,
} from '@mui/material'

const SlowLinearProgress = styled(LinearProgress)({
  '& .MuiLinearProgress-bar': {
    animationDuration: '5s',
  },
})

interface HolocronLoadingScreenProps {
  fullScreen?: boolean
  showLogo?: boolean
  text?: string
  visible?: boolean
}

const HolocronLoadingScreen: React.FC<HolocronLoadingScreenProps> = ({
  fullScreen = true,
  showLogo = true,
  text = 'Loading please wait...',
  visible = true,
}) => (
  <Fade in={visible} timeout={300}>
    <Box
      data-testid="holocron-loading-screen"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullScreen ? '100vh' : '100%',
        width: '100%',
        position: fullScreen ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
        ...(fullScreen
          ? {}
          : {
              border: '1px solid black',
              borderRadius: '8px',
            }),
      }}
    >
      <Stack spacing={4} alignItems="center">
        {showLogo && (
          <>
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex', justifyContent: 'center' },
              }}
            >
              <img
                src="/holocron-logo-color.svg"
                alt="Holocron Logo Loading"
                aria-label="Holocron Logo Loading"
                height={100}
              />
            </Box>
            <Box
              sx={{
                display: { xs: 'flex', sm: 'none', justifyContent: 'center' },
              }}
            >
              <img
                src="/holocron-icon-color.svg"
                alt="Holocron Icon Loading"
                aria-label="Holocron Icon Loading"
                height={50}
                width={100}
              />
            </Box>
          </>
        )}
        <Box sx={{ width: '80%', maxWidth: 300 }}>
          <SlowLinearProgress color="secondary" />
        </Box>
        <Typography
          variant="h6"
          align="center"
          aria-label="Loading Screen Text"
        >
          {text}
        </Typography>
      </Stack>
    </Box>
  </Fade>
)

export default HolocronLoadingScreen
