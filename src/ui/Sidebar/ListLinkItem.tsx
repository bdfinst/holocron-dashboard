import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'

type ListItemLinkProps = {
  /**
   * the icon of the side bar item
   */
  icon: ReactNode
  /**
   * the sidebar name to display when
   * the drawer is open
   */
  primary: string
  /**
   * path for the react router link to
   * direct to when pressing the ListItem
   */
  to: string
}

const ListItemLink = ({ icon, primary, to }: ListItemLinkProps) => (
  <li>
    <ListItemButton component={RouterLink} to={to}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={primary} />
    </ListItemButton>
  </li>
)

export default ListItemLink
