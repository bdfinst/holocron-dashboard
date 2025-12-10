import {
  TeamDetails,
  useCurrentUserPermissions,
  useParamsBasedGroupEntities,
  useAPIContext,
  useGroupEntityRouteParams,
  getTeamMetrics,
  Organization,
  Team,
  TeamMetrics,
  TeamView,
  useMetrics,
  ValueStream,
  withAPIData,
} from 'api'
import localStorageConfig from 'localStorageConfig'
import { useNavigate } from 'react-router-dom'
import { Grid, Box } from '@mui/material'
import * as localStorage from 'local-storage'
import DatePicker, { useWeekRange } from './DatePicker'
import TeamAutocomplete, { groupTeamWithTeamViews } from './TeamAutocomplete'
import Widgets from './DeliveryMetricsDashboardWidgets'
import DashboardLoadingScreen from './DashboardLoadingScreen'

type permissionFunctionNames = {
  canViewTeamDashboardFunctionName: keyof Omit<
    ReturnType<typeof useCurrentUserPermissions>,
    | 'isOrgLeadership'
    | 'isGlobalAdmin'
    | 'isOrgAdmin'
    | 'isVSAdmin'
    | 'isTeamAdmin'
  >
}

type TeamAdminDashboardProps = Omit<
  ReturnType<typeof useParamsBasedGroupEntities>,
  'routeNotFound' | 'organization' | 'team' | 'valueStream'
> & {
  organization: Organization
  valueStream: ValueStream
  team: Team
}

type APIMetricsProps = {
  apiMetrics: TeamMetrics[]
  apiMetricsNotReady: boolean
}

export type DashboardWidgetsProps = TeamAdminDashboardProps &
  APIMetricsProps & {
    weekRange: number
  }

export const withTeamAdminDashboard = ({
  dashboardHomePagePath,
  permissionFunctionNames,
  teamIDLocalStorageKey,
  DashboardWidgets,
}: {
  dashboardHomePagePath: string
  permissionFunctionNames: permissionFunctionNames
  teamIDLocalStorageKey: string
  DashboardWidgets: React.ComponentType<DashboardWidgetsProps>
}) => {
  const Dashboard: React.ComponentType<
    APIMetricsProps & TeamAdminDashboardProps
  > = ({
    organization,
    valueStream,
    team,
    apiMetrics,
    apiMetricsNotReady,
    teamView = null,
  }: APIMetricsProps & TeamAdminDashboardProps) => {
    const { teamList, teamViews, featureFlags } = useAPIContext()

    const { FEATURE_TEAM_VIEWS } = featureFlags

    const { canViewTeamDashboardFunctionName } = permissionFunctionNames
    const { [canViewTeamDashboardFunctionName]: canViewTeamDashboard } =
      useCurrentUserPermissions()

    const { getPathWithParams, getTeamParamsForTeamId } =
      useGroupEntityRouteParams()

    const { weekRange, setWeekRange } = useWeekRange()

    const navigate = useNavigate()

    const onTeamChange = (selectedTeam: Team | null) => {
      if (selectedTeam) {
        localStorage.set(teamIDLocalStorageKey, selectedTeam.id)
        const path = getPathWithParams(
          ({ organizationName, valueStreamName, teamName }: TeamDetails) =>
            `${dashboardHomePagePath}/${organizationName}/${valueStreamName}/${teamName}`,
          getTeamParamsForTeamId(selectedTeam.id),
        )
        navigate(path)
      }
    }

    const onTeamViewChange = (selectedTeamView: TeamView) => {
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
                <TeamAutocomplete
                  value={FEATURE_TEAM_VIEWS ? teamView || team : team}
                  options={
                    FEATURE_TEAM_VIEWS
                      ? groupTeamWithTeamViews(
                          teamList.filter(({ id }) => canViewTeamDashboard(id)),
                          teamViews,
                        )
                      : teamList.filter(({ id }) => canViewTeamDashboard(id))
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

export const useTeamMetrics = ({
  team,
  teamView,
}: Omit<ReturnType<typeof useParamsBasedGroupEntities>, 'routeNotFound'>) => {
  const { featureFlags } = useAPIContext()
  const groupEntity = featureFlags.FEATURE_TEAM_VIEWS ? teamView || team : team
  return useMetrics('TEAM', getTeamMetrics, groupEntity)
}

export const withTeamMetrics = withAPIData({
  useAPIData: useTeamMetrics,
  LoadingComponent: DashboardLoadingScreen,
})

export default withTeamMetrics(
  withTeamAdminDashboard({
    dashboardHomePagePath: '/delivery-metrics',
    permissionFunctionNames: {
      canViewTeamDashboardFunctionName: 'canViewTeamMetrics',
    },
    teamIDLocalStorageKey: localStorageConfig.TEAM_ID,
    DashboardWidgets: Widgets,
  }),
)
