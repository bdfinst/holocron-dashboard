import { Box, Grid, Stack, Typography } from '@mui/material'
import { TeamMetrics } from 'api'

import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  getLastUpdatedMessage,
} from 'utils/DashboardWidgetWrapper'
import LeadTimeTrendChart, {
  getLeadTimeTrendChartData,
} from './LeadTimeTrendChart'
import ThroughputTrendChart, {
  getThroughputTrendChartData,
} from './ThroughputTrendChart'
import helpContent from './helpContent.md'
import LeadTimeScatterChart, {
  getLeadTimeScatterChartData,
} from './LeadTimeScatterChart'

export type LeadTimeCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  apiMetrics: TeamMetrics[]
  weekRange: number
}

const AdditionalInformation = ({
  apiMetrics,
  weekRange,
}: Omit<LeadTimeCardProps, 'cardContent' | 'cartProps'>) => {
  const throughputTrendChartData = getThroughputTrendChartData({
    apiMetrics,
    weekRange,
  })
  const leadTimeScatterChartData = getLeadTimeScatterChartData({
    apiMetrics,
    weekRange,
  })

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DashboardWidgetWrapper
          title="Lead Time & Throughput"
          notEnoughData={
            leadTimeScatterChartData.every(point => point.leadTime === 0) &&
            throughputTrendChartData.every(point => point.totalThroughput === 0)
          }
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
              height: { md: 400, xs: 800 },
            },
          }}
        >
          <Stack sx={{ height: 'inherit' }}>
            <Box sx={{ height: '45%' }}>
              <LeadTimeScatterChart data={leadTimeScatterChartData} />
            </Box>
            <Box sx={{ height: '45%' }}>
              <ThroughputTrendChart data={throughputTrendChartData} />
            </Box>
          </Stack>
        </DashboardWidgetWrapper>
      </Grid>
    </Grid>
  )
}

const LeadTimeCard = ({
  apiMetrics,
  weekRange,
  cardProps,
  contentProps,
}: LeadTimeCardProps) => {
  const leadTimeTrendChartData = getLeadTimeTrendChartData({
    apiMetrics,
    weekRange,
  })
  const throughputTrendChartData = getThroughputTrendChartData({
    apiMetrics,
    weekRange,
  })
  const { workflow: lastUpdatedMessage } = getLastUpdatedMessage(apiMetrics)

  return (
    <DashboardWidgetWrapper
      title="Lead Time & Throughput"
      notEnoughData={
        leadTimeTrendChartData.every(
          point => point.averageStoryLeadTime === 0,
        ) &&
        throughputTrendChartData.every(point => point.totalThroughput === 0)
      }
      cardProps={cardProps}
      contentProps={contentProps}
      helpContent={helpContent}
      AdditionalInformation={
        <AdditionalInformation apiMetrics={apiMetrics} weekRange={weekRange} />
      }
      Footer={
        <Typography
          variant="caption"
          aria-label="Lead Time & Throughput Last Updated Footer"
        >
          {lastUpdatedMessage}
        </Typography>
      }
    >
      <Stack sx={{ height: 'inherit' }}>
        <Box sx={{ height: '45%' }}>
          <LeadTimeTrendChart data={leadTimeTrendChartData} />
        </Box>
        <Box sx={{ height: '45%' }}>
          <ThroughputTrendChart data={throughputTrendChartData} />
        </Box>
      </Stack>
    </DashboardWidgetWrapper>
  )
}

export default LeadTimeCard
