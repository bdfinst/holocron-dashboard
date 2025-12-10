import Help from 'utils/Help'
import StyledTooltip from 'utils/StyledTooltip'
import { Link, useLocation } from 'react-router-dom'
import globalConfig from 'globalConfig'
import {
  IconButton,
  AppBar,
  Box,
  Grid,
  Toolbar,
  Typography,
  useTheme,
  Stack,
} from '@mui/material'
import { SettingsIcon, MenuIcon } from 'utils/icons'
import { Fragment } from 'react'
import holocronInfo from './infoContent.md'
import SwitchThemeButton from './SwitchThemeButton'

export const ConfigurationButtons = [
  {
    key: 'Switch Theme',
    render: () => <SwitchThemeButton />,
  },
  {
    key: 'Holocron Info',
    render: () => <Help helpContent={holocronInfo} fontSize="large" />,
  },
  {
    key: 'Configure Holocron',
    render: () => (
      <StyledTooltip
        title="Configure Holocron"
        placement="top"
        enterTouchDelay={globalConfig.UI_SETTINGS.TOOL_TIP_DELAY}
      >
        <Link to="/admin">
          <IconButton aria-label="Configuration">
            <SettingsIcon fontSize="large" />
          </IconButton>
        </Link>
      </StyledTooltip>
    ),
  },
]

const usePageTitle = () => {
  const location = useLocation()
  const { pathname } = location

  const pathToLabelMap = {
    '/reports': 'Reports',
    '/admin': 'Configuration',
    '/costs': 'Cost Metrics',
  }

  const currentPath = Object.keys(pathToLabelMap).find(path =>
    pathname.startsWith(path),
  )

  return currentPath ? pathToLabelMap[currentPath] : 'Delivery Metrics'
}

const MobileViewContent = ({ pageTitle }: { pageTitle: string }) => (
  <Stack
    direction="row"
    sx={{ display: { sm: 'flex', md: 'none' } }}
    spacing={1}
    aria-label="Mobile View Header Content"
  >
    <Link to="/">
      <img
        src="/holocron-icon-color.svg"
        alt="Holocron Icon"
        aria-label="Holocron Icon"
        height={30}
      />
    </Link>
    <Typography
      variant="h6"
      noWrap
      aria-label="Mobile View Page Title"
      align="right"
    >
      {pageTitle}
    </Typography>
  </Stack>
)

const DesktopViewContent = ({ pageTitle }: { pageTitle: string }) => (
  <Grid container justifyContent="space-between" sx={{ mt: '1%' }}>
    <Grid item>
      <Box
        sx={{ display: { xs: 'none', md: 'block' } }}
        aria-label="Desktop View Holocron Logo"
      >
        <Link to="/">
          <img
            src="/holocron-logo-color.svg"
            alt="Holocron Logo"
            aria-label="Holocron Logo"
            height={50}
          />
        </Link>
      </Box>
    </Grid>

    <Grid item>
      <Box
        sx={{ display: { xs: 'none', md: 'block' } }}
        aria-label="Desktop View Page Title Styler"
      >
        <Typography
          variant="h4"
          noWrap
          aria-label="Desktop View Page Title"
          align="center"
        >
          {pageTitle}
        </Typography>
      </Box>
    </Grid>

    <Grid item>
      <Box
        sx={{ display: { xs: 'none', md: 'block' } }}
        aria-label="Desktop View Config Buttons"
      >
        {ConfigurationButtons.map(configButton => (
          <Fragment key={configButton.key}>{configButton.render()}</Fragment>
        ))}
      </Box>
    </Grid>
  </Grid>
)

export type HeaderBarProps = {
  onClick: () => void
  open: boolean
}

const HeaderBar = ({ onClick, open }: HeaderBarProps) => {
  const INDEX_OFFSET = 1
  const { UI_SETTINGS } = globalConfig
  const { DRAWER_WIDTH } = UI_SETTINGS

  const theme = useTheme()
  const pageTitle = usePageTitle()

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + INDEX_OFFSET,
        backgroundColor: theme.palette.header,
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && {
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
      }}
    >
      <Toolbar disableGutters>
        <IconButton
          sx={{
            mr: '2%',
            mt: '1%',
            display: open ? 'none' : 'inline-block',
          }}
          color="inherit"
          aria-label="open drawer"
          onClick={onClick}
        >
          <MenuIcon fontSize="large" />
        </IconButton>
        <MobileViewContent pageTitle={pageTitle} />
        <DesktopViewContent pageTitle={pageTitle} />
      </Toolbar>
    </AppBar>
  )
}

export default HeaderBar
