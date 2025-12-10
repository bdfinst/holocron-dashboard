import { Box, Container } from '@mui/material'
import { styled } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminPage from 'ui/AdminPage'
import HeaderBar from 'ui/HeaderBar'
import Reports from 'ui/Reports'
import Sidebar from 'ui/Sidebar'
import { APIContextProvider, CollectorTargetsProvider } from 'api'
import { useToggle } from 'utils/hooks'
import CostMetricsDashboard from 'ui/CostMetricsDashboard'
import {
  CreateOrganizationForm,
  UpdateOrganizationForm,
} from 'ui/OnboardOrganizationWidget'
import {
  CreateValueStreamForm,
  UpdateValueStreamForm,
} from 'ui/OnboardValueStreamWidget'
import { CreateTeamForm, UpdateTeamForm } from 'ui/OnboardTeamWidget'
import CostMetricsHomePage from 'ui/CostMetricsHomePage'
import DeliveryMetricsDashboard from 'ui/DeliveryMetricsDashboard'
import NotFoundRedirect from 'ui/NotFoundRedirect'
import {
  CreateTeamViewForm,
  UpdateTeamViewForm,
} from 'ui/OnboardTeamViewWidget'
import PermissionDeniedRedirect from 'ui/PermissionDeniedRedirect'
import HomePage from 'ui/HomePage'

const AppBarOffset = () => (
  <Box
    aria-label="appbar spacer"
    sx={theme => ({ ...theme.mixins.toolbar, mt: '2%' })}
  />
)

const queryClient = new QueryClient()

const Content = styled('main')(() => ({
  flexGrow: 1,
  height: '100vh',
  overflowY: 'auto',
  overflowX: 'hidden',
}))

const Main = () => {
  const [drawerOpen, handleDrawerOpen, handleDrawerClose] = useToggle()

  return (
    <QueryClientProvider client={queryClient}>
      <APIContextProvider>
        <CollectorTargetsProvider>
          <Box sx={{ display: 'flex', background: theme => theme.background }}>
            <HeaderBar onClick={handleDrawerOpen} open={drawerOpen} />
            <Sidebar onClick={handleDrawerClose} open={drawerOpen} />
            <Content>
              <AppBarOffset />
              <Container maxWidth="lg" sx={{ pt: 4, pb: 1 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/delivery-metrics/:organizationName/:valueStreamName/:teamName/:teamViewName"
                    element={<DeliveryMetricsDashboard />}
                  />
                  <Route
                    path="/delivery-metrics/:organizationName/:valueStreamName/:teamName"
                    element={<DeliveryMetricsDashboard />}
                  />
                  <Route
                    path="/delivery-metrics/:organizationName/:valueStreamName"
                    element={<DeliveryMetricsDashboard />}
                  />
                  <Route
                    path="/delivery-metrics/:organizationName"
                    element={<DeliveryMetricsDashboard />}
                  />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/add-team" element={<CreateTeamForm />} />
                  <Route
                    path="/admin/add-organization"
                    element={<CreateOrganizationForm />}
                  />
                  <Route
                    path="/admin/add-valuestream"
                    element={<CreateValueStreamForm />}
                  />
                  <Route
                    path="/admin/update-team/:organizationName/:valueStreamName/:teamName"
                    element={<UpdateTeamForm />}
                  />
                  <Route
                    path="/admin/update-valuestream/:organizationName/:valueStreamName"
                    element={<UpdateValueStreamForm />}
                  />
                  <Route
                    path="/admin/update-organization/:organizationName"
                    element={<UpdateOrganizationForm />}
                  />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/costs" element={<CostMetricsHomePage />} />
                  <Route
                    path="/costs/:organizationName/:valueStreamName/:teamName/:teamViewName"
                    element={<CostMetricsDashboard />}
                  />
                  <Route
                    path="/costs/:organizationName/:valueStreamName/:teamName"
                    element={<CostMetricsDashboard />}
                  />
                  <Route
                    path="/costs/:organizationName/:valueStreamName"
                    element={<CostMetricsDashboard />}
                  />
                  <Route
                    path="/costs/:organizationName"
                    element={<CostMetricsDashboard />}
                  />
                  <Route
                    path="/admin/add-team-view/:organizationName/:valueStreamName/:teamName"
                    element={<CreateTeamViewForm />}
                  />
                  <Route
                    path="/admin/update-team-view/:organizationName/:valueStreamName/:teamName/:teamViewName"
                    element={<UpdateTeamViewForm />}
                  />
                  <Route path="/404" element={<NotFoundRedirect />} />
                  <Route path="/401" element={<PermissionDeniedRedirect />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Container>
            </Content>
          </Box>
        </CollectorTargetsProvider>
      </APIContextProvider>
    </QueryClientProvider>
  )
}

export default Main
