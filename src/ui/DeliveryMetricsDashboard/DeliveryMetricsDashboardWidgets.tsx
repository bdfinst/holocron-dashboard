import {
  Organization,
  Team,
  TeamMetrics,
  TeamView,
  ValueStream,
  useAPIContext,
} from 'api'
import { filterTeamMetricsList } from 'utils/DashboardWidgetWrapper'
import { Grid } from '@mui/material'
import CodeReviewTrendCard from 'ui/CodeReviewTrendCard'
import CumulativeWorkflowCard from 'ui/CumulativeWorkflowCard'
import CycleTimeAndDefectsCard from 'ui/CycleTimeAndDefectsCard'
import DeployFrequencyCard from 'ui/DeployFrequencyCard'
import EffortCard from 'ui/EffortCard'
import LeadTimeCard from 'ui/LeadTimeCard'
import PipelineActivityCard from 'ui/PipelineActivityCard'
import WipLoadGaugeCard from 'ui/WipLoadGaugeCard'
import CIActivityCard from 'ui/CIActivityCard'
import TechDebtTrendCard from 'ui/TechDebtCard'
import VulnerabilitiesCard from 'ui/VulnerabilitiesCard'
import MetricsNotReady from './MetricsNotReady'

export type DeliveryMetricsDashboardWidgetsProps = {
  apiMetrics: TeamMetrics[]
  apiMetricsNotReady: boolean
  organization: Organization
  valueStream?: ValueStream
  team?: Team
  teamView?: TeamView
  weekRange: number
}

export const withDashboardNotReadyHandler = (
  WrappedComponent: React.ComponentType<
    Omit<DeliveryMetricsDashboardWidgetsProps, 'apiMetricsNotReady'>
  >,
) => {
  const Component = (props: DeliveryMetricsDashboardWidgetsProps) => {
    const { featureFlags } = useAPIContext()

    const { apiMetricsNotReady, apiMetrics, ...restOfProps } = props
    const { team, valueStream, organization, teamView } = restOfProps
    const teamMetricsList = apiMetricsNotReady
      ? []
      : filterTeamMetricsList(
          apiMetrics,
          {
            organization,
            valueStream,
            team,
            teamView,
          },
          featureFlags,
        )
    if (teamMetricsList.length === 0) {
      return (
        <MetricsNotReady message="Server has not finished calculating these metrics yet." />
      )
    }
    return <WrappedComponent apiMetrics={teamMetricsList} {...restOfProps} />
  }
  return Component
}

export const DeliveryMetricsDashboardWidgets = ({
  apiMetrics,
  team,
  teamView,
  weekRange,
}: Omit<DeliveryMetricsDashboardWidgetsProps, 'apiMetricsNotReady'>) => {
  const { featureFlags } = useAPIContext()
  const teamBeingViewed = teamView || team

  const widgets = [
    {
      key: 'pipeline-activity',
      show: teamBeingViewed && !teamBeingViewed.isWorkflowOnly,
      render: () => (
        <PipelineActivityCard
          apiMetrics={apiMetrics}
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
              height: 200,
            },
          }}
        />
      ),
    },
    {
      key: 'ci-activity',
      show: teamBeingViewed && !teamBeingViewed.isWorkflowOnly,
      render: () => (
        <CIActivityCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
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
              height: { sm: 200, xs: 400 },
            },
          }}
        />
      ),
    },
    {
      key: 'code-review-trend',
      show: teamBeingViewed && !teamBeingViewed.isWorkflowOnly,
      render: () => (
        <CodeReviewTrendCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
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
              height: { sm: 200, xs: 400 },
            },
          }}
        />
      ),
    },
    {
      key: 'effort',
      show: true,
      render: () => (
        <EffortCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
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
              height: { sm: 200, xs: 400 },
            },
          }}
        />
      ),
    },
    {
      key: 'wipload',
      show: true,
      render: () => (
        <WipLoadGaugeCard
          apiMetrics={apiMetrics}
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
              height: { sm: 200, xs: 400 },
            },
          }}
        />
      ),
    },
    {
      key: 'cumulative-workflow',
      show: true,
      render: () => (
        <CumulativeWorkflowCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
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
              height: { sm: 200, xs: 400 },
            },
          }}
        />
      ),
    },
    {
      key: 'lead-time',
      show: true,
      render: () => (
        <LeadTimeCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
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
              height: { sm: 330, xs: 400 },
            },
          }}
        />
      ),
    },
    {
      key: 'cycle-time-and-defects',
      show: true,
      render: () => (
        <CycleTimeAndDefectsCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
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
              height: { sm: 330, xs: 400 },
            },
          }}
        />
      ),
    },
    {
      key: 'deploy-frequency',
      show: featureFlags.FEATURE_DEPLOY_FREQUENCY,
      render: () => (
        <DeployFrequencyCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
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
              height: { sm: 200, xs: 400 },
            },
          }}
        />
      ),
    },
    {
      key: 'tech-debt',
      show:
        !teamBeingViewed ||
        (teamBeingViewed && !teamBeingViewed.isWorkflowOnly),
      render: () => (
        <TechDebtTrendCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
          showDetails={!!teamBeingViewed}
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
              height: { sm: 200, xs: 400 },
            },
          }}
        />
      ),
    },
    {
      key: 'vulnerabilities-card',
      show: teamBeingViewed && !teamBeingViewed.isWorkflowOnly,
      render: () => (
        <VulnerabilitiesCard
          apiMetrics={apiMetrics}
          weekRange={weekRange}
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
              height: { sm: 200, xs: 400 },
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

export default withDashboardNotReadyHandler(DeliveryMetricsDashboardWidgets)
