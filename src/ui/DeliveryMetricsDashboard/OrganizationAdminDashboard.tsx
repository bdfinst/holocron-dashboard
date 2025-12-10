import {
  getOrganizationMetrics,
  Organization,
  Team,
  TeamMetrics,
  TeamView,
  useMetrics,
  ValueStream,
  withAPIData,
  OrganizationDetails,
  TeamDetails,
  useCurrentUserPermissions,
  useAPIContext,
  useGroupEntityRouteParams,
  useParamsBasedGroupEntities,
  ValueStreamDetails,
} from 'api'
import { useNavigate } from 'react-router-dom'
import { Autocomplete, Box, Grid, TextField } from '@mui/material'
import localStorageConfig from 'localStorageConfig'
import * as localStorage from 'local-storage'
import TeamAutocomplete, { groupTeamWithTeamViews } from './TeamAutocomplete'
import DatePicker, { useWeekRange } from './DatePicker'
import Widgets from './DeliveryMetricsDashboardWidgets'
import DashboardLoadingScreen from './DashboardLoadingScreen'

type permissionFunctionNames = {
  canViewOrganizationDashboardFunctionName: keyof Omit<
    ReturnType<typeof useCurrentUserPermissions>,
    | 'isOrgLeadership'
    | 'isGlobalAdmin'
    | 'isOrgAdmin'
    | 'isVSAdmin'
    | 'isTeamAdmin'
  >
  canViewValueStreamDashboardFunctionName: keyof Omit<
    ReturnType<typeof useCurrentUserPermissions>,
    | 'isOrgLeadership'
    | 'isGlobalAdmin'
    | 'isOrgAdmin'
    | 'isVSAdmin'
    | 'isTeamAdmin'
  >
  canViewTeamDashboardFunctionName: keyof Omit<
    ReturnType<typeof useCurrentUserPermissions>,
    | 'isOrgLeadership'
    | 'isGlobalAdmin'
    | 'isOrgAdmin'
    | 'isVSAdmin'
    | 'isTeamAdmin'
  >
}

type OrganizationAdminDashboardProps = Omit<
  ReturnType<typeof useParamsBasedGroupEntities>,
  'routeNotFound' | 'organization'
> & { organization: Organization }

type APIMetricsProps = {
  apiMetrics: TeamMetrics[]
  apiMetricsNotReady: boolean
}

export type DashboardWidgetsProps = OrganizationAdminDashboardProps &
  APIMetricsProps & {
    weekRange: number
  }

export const withOrganizationAdminDashboard = ({
  dashboardHomePagePath,
  permissionFunctionNames,
  organizationIDLocalStorageKey,
  DashboardWidgets,
}: {
  dashboardHomePagePath: string
  permissionFunctionNames: permissionFunctionNames
  organizationIDLocalStorageKey: string
  DashboardWidgets: React.ComponentType<DashboardWidgetsProps>
}) => {
  const Dashboard: React.ComponentType<
    APIMetricsProps & OrganizationAdminDashboardProps
  > = ({
    organization,
    apiMetrics,
    apiMetricsNotReady,
    valueStream = null,
    team = null,
    teamView = null,
  }: APIMetricsProps & OrganizationAdminDashboardProps) => {
    const {
      organizationList,
      valueStreamList,
      teamList,
      teamViews,
      featureFlags,
    } = useAPIContext()

    const { FEATURE_TEAM_VIEWS } = featureFlags

    const {
      canViewOrganizationDashboardFunctionName,
      canViewValueStreamDashboardFunctionName,
      canViewTeamDashboardFunctionName,
    } = permissionFunctionNames
    const {
      [canViewOrganizationDashboardFunctionName]: canViewOrganizationDashboard,
      [canViewValueStreamDashboardFunctionName]: canViewValueStreamDashboard,
      [canViewTeamDashboardFunctionName]: canViewTeamDashboard,
    } = useCurrentUserPermissions()

    const {
      getPathWithParams,
      getOrgParamsForOrgId,
      getTeamParamsForTeamId,
      getVSParamsForVSId,
    } = useGroupEntityRouteParams()

    const { weekRange, setWeekRange } = useWeekRange()

    const navigate = useNavigate()

    const onOrganizationChange = (
      selectedOrganization: Organization | null,
    ) => {
      if (selectedOrganization) {
        localStorage.set(organizationIDLocalStorageKey, selectedOrganization.id)
        const path = getPathWithParams(
          ({ organizationName }: OrganizationDetails) =>
            `${dashboardHomePagePath}/${organizationName}`,
          getOrgParamsForOrgId(selectedOrganization.id),
        )
        navigate(path)
      }
    }

    const onValueStreamChange = (selectedValueStream: ValueStream | null) => {
      const path = selectedValueStream
        ? getPathWithParams(
            ({ organizationName, valueStreamName }: ValueStreamDetails) =>
              `${dashboardHomePagePath}/${organizationName}/${valueStreamName}`,
            getVSParamsForVSId(selectedValueStream.id),
          )
        : getPathWithParams(
            ({ organizationName }: OrganizationDetails) =>
              `${dashboardHomePagePath}/${organizationName}`,
            getOrgParamsForOrgId(organization.id),
          )
      navigate(path)
    }

    const onTeamChange = (selectedTeam: Team | null) => {
      const path = selectedTeam
        ? getPathWithParams(
            ({ organizationName, valueStreamName, teamName }: TeamDetails) =>
              `${dashboardHomePagePath}/${organizationName}/${valueStreamName}/${teamName}`,
            getTeamParamsForTeamId(selectedTeam.id),
          )
        : getPathWithParams(
            ({ organizationName, valueStreamName }: ValueStreamDetails) =>
              `${dashboardHomePagePath}/${organizationName}/${valueStreamName}`,
            getVSParamsForVSId(valueStream.id),
          )
      navigate(path)
    }

    const onTeamViewChange = (selectedTeamView: TeamView) => {
      // selectedTeamView cannot be null because in the autocomplete
      // for TeamAutocomplete it will decide whether the selected item
      // is a team or a team view, if it is a team view, it has
      // to be non null otherwise, it would not have the viewOwnerId
      // property.
      const path = getPathWithParams(
        ({ organizationName, valueStreamName, teamName }: TeamDetails) =>
          `${dashboardHomePagePath}/${organizationName}/${valueStreamName}/${teamName}/${selectedTeamView.name}`,
        getTeamParamsForTeamId(selectedTeamView.viewOwnerId),
      )
      navigate(path)
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: 3,
        }}
      >
        <Grid
          container
          spacing={{
            xs: 5,
            md: 2,
          }}
          justifyContent="space-between"
          alignItems="center"
          aria-label="Dashboard Headers"
        >
          <Grid item md={9} xs={12}>
            <Grid container spacing={2}>
              <Grid item md={4} xs={12}>
                <Autocomplete
                  id="select-an-organization"
                  selectOnFocus
                  handleHomeEndKeys
                  autoHighlight
                  clearOnBlur
                  value={organization}
                  options={organizationList.filter(({ id }) =>
                    canViewOrganizationDashboard(id),
                  )}
                  isOptionEqualToValue={(selected, another) =>
                    selected.id === another.id
                  }
                  getOptionLabel={option => option.name}
                  onChange={(_, selectedValue) => {
                    onOrganizationChange(selectedValue)
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Select an Organization"
                    />
                  )}
                />
              </Grid>
              <Grid item md={4} xs={12}>
                <Autocomplete
                  id="select-a-value-stream"
                  selectOnFocus
                  handleHomeEndKeys
                  autoHighlight
                  clearOnBlur
                  value={valueStream}
                  options={valueStreamList.filter(
                    ({ id, organizationId }) =>
                      canViewValueStreamDashboard(id) &&
                      organizationId === organization.id,
                  )}
                  isOptionEqualToValue={(selected, another) =>
                    selected.id === another.id
                  }
                  getOptionLabel={option => option.name}
                  onChange={(_, selectedValue: ValueStream | null) => {
                    onValueStreamChange(selectedValue)
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Select a Value Stream"
                    />
                  )}
                />
              </Grid>
              <Grid item md={4} xs={12}>
                <TeamAutocomplete
                  value={FEATURE_TEAM_VIEWS ? teamView || team : team}
                  options={
                    FEATURE_TEAM_VIEWS
                      ? groupTeamWithTeamViews(
                          teamList.filter(
                            ({ id, valueStreamId }) =>
                              canViewTeamDashboard(id) &&
                              valueStreamId === valueStream?.id,
                          ),
                          teamViews,
                        )
                      : teamList.filter(
                          ({ id, valueStreamId }) =>
                            canViewTeamDashboard(id) &&
                            valueStreamId === valueStream?.id,
                        )
                  }
                  onTeamChange={onTeamChange}
                  onTeamViewChange={onTeamViewChange}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box
              sx={{
                mt: { md: '5%', sm: '0%' },
                px: { xs: '8%', sm: '4%', md: '2%' },
                maxWidth: '80%',
                mx: 'auto',
              }}
            >
              <DatePicker
                weeksOfData={weekRange}
                handleSelectWeeksOfData={setWeekRange}
              />
            </Box>
          </Grid>
        </Grid>

        <DashboardWidgets
          apiMetrics={apiMetrics}
          apiMetricsNotReady={apiMetricsNotReady}
          organization={organization}
          valueStream={valueStream}
          team={team}
          teamView={teamView}
          weekRange={weekRange}
        />
      </Box>
    )
  }
  return Dashboard
}

export const useOrganizationMetrics = ({
  organization,
}: Omit<ReturnType<typeof useParamsBasedGroupEntities>, 'routeNotFound'>) =>
  useMetrics('ORGANIZATION', getOrganizationMetrics, organization)

export const withOrganizationMetrics = withAPIData({
  useAPIData: useOrganizationMetrics,
  LoadingComponent: DashboardLoadingScreen,
})

export default withOrganizationMetrics(
  withOrganizationAdminDashboard({
    dashboardHomePagePath: '/delivery-metrics',
    permissionFunctionNames: {
      canViewOrganizationDashboardFunctionName: 'canViewOrganizationMetrics',
      canViewValueStreamDashboardFunctionName: 'canViewValueStreamMetrics',
      canViewTeamDashboardFunctionName: 'canViewTeamMetrics',
    },
    organizationIDLocalStorageKey: localStorageConfig.ORGANIZATION_ID,
    DashboardWidgets: Widgets,
  }),
)
