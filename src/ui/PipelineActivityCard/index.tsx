import { TeamMetrics } from 'api'
import { Grid, Typography } from '@mui/material'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  getLastUpdatedMessage,
} from 'utils/DashboardWidgetWrapper'
import BuildIssuesTable, { getBuildIssues } from './BuildIssuesTable'
import StaleCodeReviewsTable, {
  getStaleCodeReviews,
} from './StaleCodeReviewsTable'
import StalePipelinesTable, { getStalePipelines } from './StalePipelinesTable'
import StaleBranchesTable, { getStaleBranches } from './StaleBranchesTable'
import helpContent from './PipelineActivityCardHelpContent.md'
import PipelineActivitySummary from './PipelineActivitySummary'

export type PipelineActivityCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  apiMetrics: TeamMetrics[]
}

const AdditionalInformation = ({
  apiMetrics,
}: Omit<PipelineActivityCardProps, 'cardProps' | 'contentProps'>) => {
  const buildIssues = getBuildIssues({
    apiMetrics,
  })
  const failedBuilds = buildIssues.filter(({ failedBuild }) => failedBuild)
  const passedWithWarningBuilds = buildIssues.filter(
    ({ failedBuild }) => !failedBuild,
  )
  const staleCodeReviews = getStaleCodeReviews({
    apiMetrics,
  })
  const stalePipelines = getStalePipelines({
    apiMetrics,
  })
  const staleBranches = getStaleBranches({
    apiMetrics,
  })

  return (
    <Grid container alignItems="flex-start" spacing={3}>
      <Grid item xs={12}>
        <DashboardWidgetWrapper title="" notEnoughData={false}>
          <PipelineActivitySummary
            amountOfFailedBuilds={failedBuilds.length}
            amountOfPassedWithWarningsBuilds={passedWithWarningBuilds.length}
            amountOfStaleBranches={staleBranches.length}
            amountOfStaleCodeReviews={staleCodeReviews.length}
            amountOfStalePipelines={stalePipelines.length}
          />
        </DashboardWidgetWrapper>
      </Grid>
      <Grid item md={6} xs={12}>
        <BuildIssuesTable
          data={buildIssues}
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
              overflow: 'scroll',
            },
          }}
        />
      </Grid>
      <Grid item md={6} xs={12}>
        <StaleCodeReviewsTable
          data={staleCodeReviews}
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
              overflow: 'scroll',
            },
          }}
        />
      </Grid>
      <Grid item md={6} xs={12}>
        <StaleBranchesTable
          data={staleBranches}
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
              overflow: 'scroll',
            },
          }}
        />
      </Grid>
      <Grid item md={6} xs={12}>
        <StalePipelinesTable
          data={stalePipelines}
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
              overflow: 'scroll',
            },
          }}
        />
      </Grid>
    </Grid>
  )
}

const PipelineActivityCard = ({
  apiMetrics,
  cardProps,
  contentProps,
}: PipelineActivityCardProps) => {
  const { build: lastUpdatedMessage } = getLastUpdatedMessage(apiMetrics)

  const buildIssues = getBuildIssues({
    apiMetrics,
  })
  const failedBuilds = buildIssues.filter(({ failedBuild }) => failedBuild)
  const passedWithWarningBuilds = buildIssues.filter(
    ({ failedBuild }) => !failedBuild,
  )
  const staleCodeReviews = getStaleCodeReviews({
    apiMetrics,
  })
  const stalePipelines = getStalePipelines({
    apiMetrics,
  })
  const staleBranches = getStaleBranches({
    apiMetrics,
  })
  return (
    <DashboardWidgetWrapper
      title="Pipeline Activity"
      helpContent={helpContent}
      notEnoughData={false}
      AdditionalInformation={<AdditionalInformation apiMetrics={apiMetrics} />}
      Footer={
        <Typography
          variant="caption"
          aria-label="Pipeline Activity Last Updated Footer"
        >
          {lastUpdatedMessage}
        </Typography>
      }
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <PipelineActivitySummary
        amountOfFailedBuilds={failedBuilds.length}
        amountOfPassedWithWarningsBuilds={passedWithWarningBuilds.length}
        amountOfStaleBranches={staleBranches.length}
        amountOfStaleCodeReviews={staleCodeReviews.length}
        amountOfStalePipelines={stalePipelines.length}
      />
    </DashboardWidgetWrapper>
  )
}

export default PipelineActivityCard
