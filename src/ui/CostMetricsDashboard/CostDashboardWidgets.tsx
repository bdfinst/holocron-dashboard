import { Grid } from '@mui/material'
import EffortCard from 'ui/EffortCard'
import { Organization, Team, TeamMetrics, TeamView, ValueStream } from 'api'
import { withDashboardNotReadyHandler } from 'ui/DeliveryMetricsDashboard'

export type CostDashboardWidgetProps = {
  apiMetrics: TeamMetrics[]
  apiMetricsNotReady: boolean
  organization?: Organization
  valueStream?: ValueStream
  team?: Team
  teamView?: TeamView
  weekRange: number
}

export const CostDashboardWidgets = ({
  apiMetrics,
  weekRange,
}: Omit<CostDashboardWidgetProps, 'apiMetricsNotReady'>) => {
  const widgets = [
    {
      key: 'effort',
      show: true,
      render: () => (
        <EffortCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
          showDetails
          cardProps={{
            variant: 'outlined',
            sx: {
              textAlign: 'center',
              color: 'text.secondary',
              p: 1,
            },
          }}
          contentProps={{
            sx: {
              height: { md: 200, xs: 400 },
            },
          }}
        />
      ),
    },
  ]

  return (
    <Grid container justifyContent="flex-start" spacing={2}>
      {widgets.map(
        widget =>
          widget.show && (
            <Grid item key={widget.key} xs={12} sm={6} md={6} lg={4}>
              {widget.render()}
            </Grid>
          ),
      )}
    </Grid>
  )
}

export default withDashboardNotReadyHandler(CostDashboardWidgets)
