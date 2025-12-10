import { Grid, Typography, Stack } from '@mui/material'
import { CheckCircleIcon, ErrorIcon, WarningIcon } from 'utils/icons'

export type PipelineActivitySummaryProps = {
  amountOfStaleCodeReviews: number
  amountOfStaleBranches: number
  amountOfStalePipelines: number
  amountOfFailedBuilds: number
  amountOfPassedWithWarningsBuilds: number
}

const SummaryItem = ({
  icon,
  label,
  summary,
}: {
  icon: JSX.Element
  label: string
  summary: string
}) => (
  <Stack spacing={1} direction="row">
    <>{icon}</>
    <Typography aria-label={label}>{summary}</Typography>
  </Stack>
)

const getBuildStatusSummaryItem = (
  amountOfFailedBuilds: number,
  amountOfPassedWithWarningsBuilds: number,
) => {
  if (amountOfFailedBuilds > 0 && amountOfPassedWithWarningsBuilds > 0) {
    return (
      <SummaryItem
        icon={<ErrorIcon color="error" aria-label="Red Build Status" />}
        label="Build Status"
        summary={`Build Status: ${amountOfFailedBuilds} Failing, ${amountOfPassedWithWarningsBuilds} Warning`}
      />
    )
  }

  if (amountOfFailedBuilds > 0) {
    return (
      <SummaryItem
        icon={<ErrorIcon color="error" aria-label="Red Build Status" />}
        label="Build Status"
        summary={`Build Status: ${amountOfFailedBuilds} Failing`}
      />
    )
  }

  if (amountOfPassedWithWarningsBuilds > 0) {
    return (
      <SummaryItem
        icon={<WarningIcon color="warning" aria-label="Yellow Build Status" />}
        label="Build Status"
        summary={`Build Status: ${amountOfPassedWithWarningsBuilds} Warning`}
      />
    )
  }

  return (
    <SummaryItem
      icon={<CheckCircleIcon color="success" aria-label="Green Build Status" />}
      label="Build Status"
      summary="Build Status: All passing"
    />
  )
}

const getStaleCategorySummaryItem = (
  category: string,
  amountOfStaleCategoryItems: number,
) =>
  amountOfStaleCategoryItems > 0 ? (
    <SummaryItem
      icon={
        <WarningIcon
          color="warning"
          aria-label={`Yellow Stale ${category} Status`}
        />
      }
      label={`Stale ${category} Status`}
      summary={`Stale ${category}: ${amountOfStaleCategoryItems}`}
    />
  ) : (
    <SummaryItem
      icon={
        <CheckCircleIcon
          color="success"
          aria-label={`Green Stale ${category} Status`}
        />
      }
      label={`Stale ${category} Status`}
      summary={`Stale ${category}: 0`}
    />
  )

const PipelineActivitySummary = ({
  amountOfFailedBuilds,
  amountOfStaleBranches,
  amountOfStalePipelines,
  amountOfPassedWithWarningsBuilds,
  amountOfStaleCodeReviews,
}: PipelineActivitySummaryProps) => (
  <Grid
    container
    alignItems="center"
    justifyContent="space-between"
    spacing={1}
  >
    <Grid item xs={12}>
      {getBuildStatusSummaryItem(
        amountOfFailedBuilds,
        amountOfPassedWithWarningsBuilds,
      )}
    </Grid>
    <Grid item xs={12}>
      {getStaleCategorySummaryItem('Code Reviews', amountOfStaleCodeReviews)}
    </Grid>
    <Grid item xs={12}>
      {getStaleCategorySummaryItem('Branches', amountOfStaleBranches)}
    </Grid>
    <Grid item xs={12}>
      {getStaleCategorySummaryItem('Pipelines', amountOfStalePipelines)}
    </Grid>
  </Grid>
)

export default PipelineActivitySummary
