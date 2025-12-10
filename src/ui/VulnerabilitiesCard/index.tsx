import { TeamMetrics } from 'api'
import { Grid, Stack, Typography, useTheme } from '@mui/material'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  getLastUpdatedMessage,
} from 'utils/DashboardWidgetWrapper'
import TrendIndicator from 'utils/TrendIndicator'
import VulnerabilitiesTrendChart, {
  getVulnerabilitiesTrendChartData,
} from './VulnerabilitiesTrendChart'
import helpContent from './helpContent.md'
import VulnerabilitiesTrendBySeverityChart, {
  getVulnerabilitiesTrendBySeverityChartData,
} from './VulnerabilitiesTrendBySeverityChart'
import ActiveVulnerabilitiesTable from './ActiveVulnerabilitiesTable'

export type VulnerabilitiesCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & { apiMetrics: TeamMetrics[]; weekRange: number }

const AdditionalInformation = ({
  apiMetrics,
  weekRange,
}: Omit<VulnerabilitiesCardProps, 'cardProps' | 'contentProps'>) => {
  const theme = useTheme()

  const vulnerabilitiesTrendChartData =
    getVulnerabilitiesTrendBySeverityChartData({
      apiMetrics,
      weekRange,
    })

  const hasEnoughVulnerabilitiesTrendData =
    vulnerabilitiesTrendChartData.some(
      entry =>
        entry.highSeverityVulnerabilities > 0 ||
        entry.mediumSeverityVulnerabilities > 0 ||
        entry.lowSeverityVulnerabilities > 0,
    ) && vulnerabilitiesTrendChartData.length >= 2

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DashboardWidgetWrapper
          title="Vulnerabilities Trend By Severity"
          notEnoughData={!hasEnoughVulnerabilitiesTrendData}
          Footer={
            hasEnoughVulnerabilitiesTrendData && (
              <Grid container justifyContent="space-between">
                <Grid
                  item
                  md={4}
                  xs={12}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <TrendIndicator
                    beforeValue={
                      vulnerabilitiesTrendChartData[
                        vulnerabilitiesTrendChartData.length - 2
                      ].highSeverityVulnerabilities
                    }
                    afterValue={
                      vulnerabilitiesTrendChartData[
                        vulnerabilitiesTrendChartData.length - 1
                      ].highSeverityVulnerabilities
                    }
                    title="High Severity Vulnerabilities"
                    titleProps={{
                      color: theme.chart.red,
                    }}
                    timeFrame="week"
                  />
                </Grid>
                <Grid
                  item
                  md={4}
                  xs={12}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <TrendIndicator
                    beforeValue={
                      vulnerabilitiesTrendChartData[
                        vulnerabilitiesTrendChartData.length - 2
                      ].mediumSeverityVulnerabilities
                    }
                    afterValue={
                      vulnerabilitiesTrendChartData[
                        vulnerabilitiesTrendChartData.length - 1
                      ].mediumSeverityVulnerabilities
                    }
                    title="Medium Severity Vulnerabilities"
                    titleProps={{
                      color: theme.chart.yellow,
                    }}
                    timeFrame="week"
                  />
                </Grid>
                <Grid
                  item
                  md={4}
                  xs={12}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <TrendIndicator
                    beforeValue={
                      vulnerabilitiesTrendChartData[
                        vulnerabilitiesTrendChartData.length - 2
                      ].lowSeverityVulnerabilities
                    }
                    afterValue={
                      vulnerabilitiesTrendChartData[
                        vulnerabilitiesTrendChartData.length - 1
                      ].lowSeverityVulnerabilities
                    }
                    title="Low Severity Vulnerabilities"
                    titleProps={{
                      color: theme.chart.blue,
                    }}
                    timeFrame="week"
                  />
                </Grid>
              </Grid>
            )
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
          <VulnerabilitiesTrendBySeverityChart
            data={vulnerabilitiesTrendChartData}
          />
        </DashboardWidgetWrapper>
      </Grid>
      <Grid item md={6} xs={12}>
        <ActiveVulnerabilitiesTable apiMetrics={apiMetrics} />
      </Grid>
    </Grid>
  )
}

const VulnerabilitiesCard = ({
  apiMetrics,
  weekRange,
  cardProps,
  contentProps,
}: VulnerabilitiesCardProps) => {
  const vulnerabilitiesTrendChartData = getVulnerabilitiesTrendChartData({
    apiMetrics,
    weekRange,
  })

  const { projectAnalysis: lastUpdatedMessage } =
    getLastUpdatedMessage(apiMetrics)

  const hasEnoughData =
    vulnerabilitiesTrendChartData.some(p => p.vulnerabilities > 0) &&
    vulnerabilitiesTrendChartData.length >= 2

  return (
    <DashboardWidgetWrapper
      title="Vulnerabilities"
      notEnoughData={!hasEnoughData}
      cardProps={cardProps}
      contentProps={contentProps}
      helpContent={helpContent}
      AdditionalInformation={
        <AdditionalInformation apiMetrics={apiMetrics} weekRange={weekRange} />
      }
      Footer={
        <Stack>
          {hasEnoughData && (
            <TrendIndicator
              beforeValue={
                vulnerabilitiesTrendChartData[
                  vulnerabilitiesTrendChartData.length - 2
                ].vulnerabilities
              }
              afterValue={
                vulnerabilitiesTrendChartData[
                  vulnerabilitiesTrendChartData.length - 1
                ].vulnerabilities
              }
              timeFrame="week"
            />
          )}
          <Typography
            variant="caption"
            aria-label="Lead Time & Throughput Last Updated Footer"
          >
            {lastUpdatedMessage}
          </Typography>
        </Stack>
      }
    >
      <VulnerabilitiesTrendChart data={vulnerabilitiesTrendChartData} />
    </DashboardWidgetWrapper>
  )
}

export default VulnerabilitiesCard
