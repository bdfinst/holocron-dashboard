import { Box, Drawer, IconButton, List } from '@mui/material'
import { ChevronLeftIcon } from 'utils/icons'
import { Fragment, ReactNode } from 'react'
import { useAPIContext } from 'api'
import { useTheme } from '@mui/material/styles'
import { ConfigurationButtons } from 'ui/HeaderBar'
import config from 'globalConfig'

import Routes, { OrgLeadershipUserRoutes } from './routes'
import ListLinkItem from './ListLinkItem'

const AppBarOffset = ({ children }: { children: ReactNode }) => (
  <Box
    aria-label="appbar spacer"
    sx={theme => ({
      ...theme.mixins.toolbar,
      display: 'flex',
      justifyContent: 'flex-end',
      p: 1,
    })}
  >
    {children}
  </Box>
)

const renderSideLink = ({
  sidebarName,
  icon,
  path,
}: {
  sidebarName: string
  icon: ReactNode
  path: string
}) => (
  <ListLinkItem key={sidebarName} icon={icon} to={path} primary={sidebarName} />
)

type SidebarProps = {
  /**
   * onClick callback for when the sidebar is opened/closed (drawer is open/closed).
   */
  onClick: (event?: React.MouseEvent<HTMLElement>) => void
  /**
   * whether the sidebar is expanded (drawer is open)
   */
  open: boolean
}

const Sidebar = ({ onClick, open }: SidebarProps) => {
  const theme = useTheme()
  const { featureFlags, currentUser } = useAPIContext()

  const drawerContent = (
    <>
      <AppBarOffset>
        <IconButton onClick={onClick} aria-label="close drawer" size="large">
          <ChevronLeftIcon fontSize="large" />
        </IconButton>
      </AppBarOffset>
      <List>
        {Routes.map(renderSideLink)}
        {featureFlags.FEATURE_COST_METRICS &&
          currentUser.isOrgLeadership &&
          OrgLeadershipUserRoutes.map(renderSideLink)}
      </List>
    </>
  )

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        sx={{ display: { md: 'none', xs: 'block' } }}
        variant="temporary"
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={open}
        PaperProps={{
          sx: {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: config.UI_SETTINGS.DRAWER_WIDTH,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
          BackdropProps: { 'aria-label': 'backdrop' },
          onClose: () => {
            // Closes drawer if user clicks outside
            if (open) {
              onClick()
            }
          },
        }}
      >
        {drawerContent}
        <Box display="block" aria-label="Mobile View Config Buttons">
          {ConfigurationButtons.map(configButton => (
            <Fragment key={configButton.key}>{configButton.render()}</Fragment>
          ))}
        </Box>
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        sx={{ display: { xs: 'none', md: 'block' } }}
        variant="permanent"
        PaperProps={{
          sx: {
            position: 'relative',
            whiteSpace: 'nowrap',
            overflowX: 'hidden',
            width: theme.spacing(7),
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ...(open && {
              overflowX: 'visible',
              width: config.UI_SETTINGS.DRAWER_WIDTH,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }),
          },
        }}
        open={open}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}

export default Sidebar
