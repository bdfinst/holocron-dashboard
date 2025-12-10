import { TeamMetrics } from 'api'
import { Box, Grid, Stack, Typography } from '@mui/material'
import DashboardWidgetWrapper, {
  DashboardWidgetWrapperProps,
  getLastUpdatedMessage,
} from 'utils/DashboardWidgetWrapper'
import DevCycleTimeTrendChart, {
  getDevCycleTimeTrendChartData,
} from './DevCycleTimeTrendChart'
import DefectRateTrendChart, {
  getDefectRateTrendChartData,
} from './DefectRateTrendChart'
import helpContent from './helpContent.md'
import DevCycleTimeScatterChart, {
  getDevCycleTimeScatterChartData,
} from './DevCycleTimeScatterChart'
import DefectPriorityRateTrendChart, {
  getDefectPriorityRateTrendChartData,
} from './DefectPriorityRateTrendChart'
import DefectPriorityPieChart, {
  getDefectPriorityPieChartData,
} from './DefectPriorityPieChart'
import DevCycleTimeHistogram, {
  getDevCycleTimeHistogramData,
} from './DevCycleTimeHistogram'

export type CycleTimeAndDefectsCardProps = Pick<
  DashboardWidgetWrapperProps,
  'cardProps' | 'contentProps'
> & {
  apiMetrics: TeamMetrics[]
  weekRange: number
}

const AdditionalInformation = ({
  apiMetrics,
  weekRange,
}: Omit<CycleTimeAndDefectsCardProps, 'cardProps' | 'contentProps'>) => {
  const devCycleTimeScatterChartData = getDevCycleTimeScatterChartData({
    apiMetrics,
    weekRange,
  })
  const defectPriorityRateTrendChartData = getDefectPriorityRateTrendChartData({
    apiMetrics,
    weekRange,
  })
  const defectPriorityPieChartData = getDefectPriorityPieChartData(
    defectPriorityRateTrendChartData,
  )
  const devCycleTimeHistogramData = getDevCycleTimeHistogramData(
    devCycleTimeScatterChartData,
  )

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DashboardWidgetWrapper
          title="Cycle Time & Defects"
          notEnoughData={
            devCycleTimeScatterChartData.every(
              entry => entry.devCycleTime === 0,
            ) &&
            defectPriorityRateTrendChartData.every(
              entry =>
                entry.highestPriorityDefectsCreated === 0 &&
                entry.highPriorityDefectsCreated === 0 &&
                entry.mediumPriorityDefectsCreated === 0 &&
                entry.lowPriorityDefectsCreated === 0 &&
                entry.lowestPriorityDefectsCreated === 0,
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
          <Stack sx={{ height: 'inherit' }}>
            <Box sx={{ height: { sm: '45%', xs: '45%' } }}>
              <DevCycleTimeScatterChart data={devCycleTimeScatterChartData} />
            </Box>
            <Box sx={{ height: { sm: '45%', xs: '50%' } }}>
              <DefectPriorityRateTrendChart
                data={defectPriorityRateTrendChartData}
              />
            </Box>
          </Stack>
        </DashboardWidgetWrapper>
      </Grid>
      <Grid item md={6} xs={12}>
        <DashboardWidgetWrapper
          title="Cycle Time Histogram"
          notEnoughData={devCycleTimeScatterChartData.every(
            point => point.devCycleTime === 0,
          )}
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
              height: { md: 330, xs: 400 },
            },
          }}
        >
          <DevCycleTimeHistogram data={devCycleTimeHistogramData} />
        </DashboardWidgetWrapper>
      </Grid>
      <Grid item md={6} xs={12}>
        <DashboardWidgetWrapper
          title="Defect Priority Distribution"
          notEnoughData={defectPriorityPieChartData.every(
            sector => sector.defectsCreated === 0,
          )}
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
              height: { md: 330, xs: 400 },
            },
          }}
        >
          <DefectPriorityPieChart data={defectPriorityPieChartData} />
        </DashboardWidgetWrapper>
      </Grid>
    </Grid>
  )
}

const CycleTimeAndDefectsCard = ({
  apiMetrics,
  weekRange,
  cardProps,
  contentProps,
}: CycleTimeAndDefectsCardProps) => {
  const devCycleTimeTrendChardData = getDevCycleTimeTrendChartData({
    apiMetrics,
    weekRange,
  })

  const defectRateTrendChartData = getDefectRateTrendChartData({
    apiMetrics,
    weekRange,
  })

  const { workflow: lastUpdatedMessage } = getLastUpdatedMessage(apiMetrics)

  return (
    <DashboardWidgetWrapper
      title="Cycle Time & Defects"
      notEnoughData={
        devCycleTimeTrendChardData.every(
          point => point.averageDevCycleTime === 0,
        ) && defectRateTrendChartData.every(point => point.defectsCreated === 0)
      }
      helpContent={helpContent}
      Footer={
        <Typography
          variant="caption"
          aria-label="Cycle Time And Defects Last Updated Footer"
        >
          {lastUpdatedMessage}
        </Typography>
      }
      AdditionalInformation={
        <AdditionalInformation apiMetrics={apiMetrics} weekRange={weekRange} />
      }
      cardProps={cardProps}
      contentProps={contentProps}
    >
      <Stack sx={{ height: 'inherit' }}>
        <Box sx={{ height: '45%' }}>
          <DevCycleTimeTrendChart data={devCycleTimeTrendChardData} />
        </Box>
        <Box sx={{ height: '45%' }}>
          <DefectRateTrendChart data={defectRateTrendChartData} />
        </Box>
      </Stack>
    </DashboardWidgetWrapper>
  )
}

export default CycleTimeAndDefectsCard

export { DefectRateTrendChart, getDefectRateTrendChartData }
