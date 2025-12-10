import {
  TeamDetails,
  useCurrentUserPermissions,
  useParamsBasedGroupEntities,
  useAPIContext,
  useGroupEntityRouteParams,
  ValueStreamDetails,
  getValueStreamMetrics,
  Organization,
  Team,
  TeamMetrics,
  TeamView,
  useMetrics,
  ValueStream,
  withAPIData,
} from 'api'
import { useNavigate } from 'react-router-dom'
import { Autocomplete, Box, Grid, TextField } from '@mui/material'
import localStorageConfig from 'localStorageConfig'
import * as localStorage from 'local-storage'
import DatePicker, { useWeekRange } from './DatePicker'
import TeamAutocomplete, { groupTeamWithTeamViews } from './TeamAutocomplete'
import Widgets from './DeliveryMetricsDashboardWidgets'
import DashboardLoadingScreen from './DashboardLoadingScreen'

type permissionFunctionNames = {
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

type ValueStreamAdminDashboardProps = Omit<
  ReturnType<typeof useParamsBasedGroupEntities>,
  'routeNotFound' | 'organization' | 'valueStream'
> & {
  organization: Organization
  valueStream: ValueStream
}

type APIMetricsProps = {
  apiMetrics: TeamMetrics[]
  apiMetricsNotReady: boolean
}

export type DashboardWidgetsProps = ValueStreamAdminDashboardProps &
  APIMetricsProps & {
    weekRange: number
  }

export const withValueStreamAdminDashboard = ({
  dashboardHomePagePath,
  permissionFunctionNames,
  valueStreamIDLocalStorageKey,
  DashboardWidgets,
}: {
  dashboardHomePagePath: string
  permissionFunctionNames: permissionFunctionNames
  valueStreamIDLocalStorageKey: string
  DashboardWidgets: React.ComponentType<DashboardWidgetsProps>
}) => {
  const Dashboard: React.ComponentType<
    ValueStreamAdminDashboardProps & APIMetricsProps
  > = ({
    organization,
    valueStream,
    apiMetrics,
    apiMetricsNotReady,
    team = null,
    teamView = null,
  }: ValueStreamAdminDashboardProps & APIMetricsProps) => {
    const { valueStreamList, teamList, teamViews, featureFlags } =
      useAPIContext()

    const { FEATURE_TEAM_VIEWS } = featureFlags

    const {
      canViewValueStreamDashboardFunctionName,
      canViewTeamDashboardFunctionName,
    } = permissionFunctionNames
    const {
      [canViewValueStreamDashboardFunctionName]: canViewValueStreamDashboard,
      [canViewTeamDashboardFunctionName]: canViewTeamDashboard,
    } = useCurrentUserPermissions()

    const { getPathWithParams, getTeamParamsForTeamId, getVSParamsForVSId } =
      useGroupEntityRouteParams()

    const { weekRange, setWeekRange } = useWeekRange()

    const navigate = useNavigate()

    const onValueStreamChange = (selectedValueStream: ValueStream | null) => {
      if (selectedValueStream) {
        localStorage.set(valueStreamIDLocalStorageKey, selectedValueStream.id)
        const path = getPathWithParams(
          ({ organizationName, valueStreamName }: ValueStreamDetails) =>
            `${dashboardHomePagePath}/${organizationName}/${valueStreamName}`,
          getVSParamsForVSId(selectedValueStream.id),
        )
        navigate(path)
      }
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
        >
          <Grid item md={9} xs={12}>
            <Grid container spacing={2}>
              <Grid item md={4} xs={12}>
                <Autocomplete
                  id="select-a-valuestream"
                  selectOnFocus
                  handleHomeEndKeys
                  autoHighlight
                  clearOnBlur
                  options={valueStreamList.filter(({ id }) =>
                    canViewValueStreamDashboard(id),
                  )}
                  value={valueStream}
                  isOptionEqualToValue={(selected, another) =>
                    selected.id === another.id
                  }
                  getOptionLabel={option => option.name}
                  onChange={(_, selectedValue) => {
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
                              valueStreamId === valueStream.id,
                          ),
                          teamViews,
                        )
                      : teamList.filter(
                          ({ id, valueStreamId }) =>
                            canViewTeamDashboard(id) &&
                            valueStreamId === valueStream.id,
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

export const useValueStreamMetrics = ({
  valueStream,
}: Omit<ReturnType<typeof useParamsBasedGroupEntities>, 'routeNotFound'>) =>
  useMetrics('VALUE_STREAM', getValueStreamMetrics, valueStream)

export const withValueStreamMetrics = withAPIData({
  useAPIData: useValueStreamMetrics,
  LoadingComponent: DashboardLoadingScreen,
})

export default withValueStreamMetrics(
  withValueStreamAdminDashboard({
    dashboardHomePagePath: '/delivery-metrics',
    permissionFunctionNames: {
      canViewValueStreamDashboardFunctionName: 'canViewValueStreamMetrics',
      canViewTeamDashboardFunctionName: 'canViewTeamMetrics',
    },
    valueStreamIDLocalStorageKey: localStorageConfig.VALUESTREAM_ID,
    DashboardWidgets: Widgets,
  }),
)
