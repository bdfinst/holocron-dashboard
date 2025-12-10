import { AssignmentIcon, AttachMoneyIcon, GraphIcon } from 'utils/icons'
import CostMetricsHomePage from 'ui/CostMetricsHomePage'
import DeliveryMetricsDashboard from 'ui/DeliveryMetricsDashboard'
import Reports from 'ui/Reports'

const routes = [
  {
    path: `/`,
    sidebarName: 'Delivery Metrics',
    icon: <GraphIcon />,
    component: DeliveryMetricsDashboard,
  },
  {
    path: `/reports`,
    sidebarName: 'Reports',
    icon: <AssignmentIcon />,
    component: Reports,
  },
]

export const OrgLeadershipUserRoutes = [
  {
    path: '/costs',
    sidebarName: 'Cost Metrics',
    icon: <AttachMoneyIcon />,
    component: CostMetricsHomePage,
  },
]

export default routes
