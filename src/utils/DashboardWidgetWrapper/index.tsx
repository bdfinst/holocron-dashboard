import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Typography,
  CardProps,
  CardContentProps,
  DialogTitle,
  Box,
  Stack,
} from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { CloseIcon, OpenInFullIcon } from 'utils/icons'
import StyledTooltip from 'utils/StyledTooltip'
import { useToggle } from 'utils/hooks'
import config from 'globalConfig'
import Help from 'utils/Help'
import { LegendProps, TooltipProps } from 'recharts'

export type NotEnoughDataWrapperProps = {
  notEnoughData: boolean
  notEnoughDataMessage?: string
  children: React.ReactNode
}

export const NotEnoughDataWrapper = ({
  notEnoughData,
  notEnoughDataMessage,
  children,
}: NotEnoughDataWrapperProps) => {
  if (notEnoughData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Typography aria-label="Not Enough Data Message">
          {notEnoughDataMessage ||
            'Not enough data to display a meaningful representation.'}
        </Typography>
      </Box>
    )
  }
  return <>{children}</>
}

export type WidgetHeaderProps = {
  title: string
  helpContent?: string
  AdditionalInformation?: React.ReactNode
  showAdditionalInformation: () => void
}

export const WidgetHeader = ({
  title,
  helpContent,
  AdditionalInformation,
  showAdditionalInformation,
}: WidgetHeaderProps) => (
  <Grid container justifyContent="space-between" alignItems="center">
    {!!AdditionalInformation && (
      <Grid item>
        <StyledTooltip
          title="Show Details"
          placement="top"
          enterTouchDelay={config.UI_SETTINGS.TOOL_TIP_DELAY}
        >
          <IconButton
            onClick={showAdditionalInformation}
            aria-label={`Show ${title} Details`}
          >
            <OpenInFullIcon />
          </IconButton>
        </StyledTooltip>
      </Grid>
    )}
    <Grid item xs>
      <Typography
        aria-label="Dashboard Widget Title"
        sx={{ fontSize: '1.2em', fontWeight: 'bold', textAlign: 'center' }}
      >
        {title}
      </Typography>
    </Grid>
    {!!helpContent && (
      <Grid item>
        <Help helpContent={helpContent} />
      </Grid>
    )}
  </Grid>
)

export type DashboardWidgetWrapperProps = {
  title: string
  notEnoughData: boolean
  children: React.ReactNode
  helpContent?: string
  notEnoughDataMessage?: string
  Footer?: React.ReactNode
  AdditionalInformation?: React.ReactNode
  cardProps?: Omit<CardProps, 'children'>
  contentProps?: Omit<CardContentProps, 'children'>
}

const DashboardWidgetWrapper = ({
  title,
  helpContent,
  notEnoughData,
  notEnoughDataMessage,
  children,
  Footer,
  AdditionalInformation,
  cardProps,
  contentProps,
}: DashboardWidgetWrapperProps) => {
  const [
    additionalInformationDialogIsOpen,
    openAdditionalInformationDialog,
    closeAdditionalInformationDialog,
  ] = useToggle()
  return (
    <Card {...cardProps}>
      <WidgetHeader
        title={title}
        helpContent={helpContent}
        AdditionalInformation={AdditionalInformation}
        showAdditionalInformation={openAdditionalInformationDialog}
      />
      <CardContent {...contentProps}>
        <NotEnoughDataWrapper
          notEnoughData={notEnoughData}
          notEnoughDataMessage={notEnoughDataMessage}
        >
          {children}
        </NotEnoughDataWrapper>
      </CardContent>
      {Footer}

      {!!AdditionalInformation && (
        <Dialog
          open={additionalInformationDialogIsOpen}
          fullScreen
          aria-labelledby={`Dashboard Widget ${title} Additional Information`}
          onClose={closeAdditionalInformationDialog}
        >
          <DialogTitle>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={closeAdditionalInformationDialog}
                  aria-label={`Close ${title} Additional Information`}
                >
                  <CloseIcon />
                </IconButton>
                {title}
              </Grid>
              <Grid item>
                <Help helpContent={helpContent} />
              </Grid>
            </Grid>
          </DialogTitle>

          <DialogContent>{AdditionalInformation}</DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

export default DashboardWidgetWrapper

export * from './utils'

const ChartTooltipStyleWrapper = styled('div')(({ theme }) => ({
  margin: '0px',
  padding: '10px',
  backgroundColor: theme.palette.background.paper,
  border: '1px solid rgb(204, 204, 204)',
  whiteSpace: 'nowrap',
}))

type ChartTooltipPayloadValueType = number | string | Array<number | string>
type ChartTooltipPayloadNameType = number | string

export type ChartTooltipWrapperProps = {
  showLabel?: boolean
  children: (
    tooltipProps: TooltipProps<
      ChartTooltipPayloadValueType,
      ChartTooltipPayloadNameType
    >,
  ) => React.ReactNode
} & TooltipProps<ChartTooltipPayloadValueType, ChartTooltipPayloadNameType>

export const ChartTooltipWrapper = ({
  showLabel = true,
  children,
  ...tooltipProps
}: ChartTooltipWrapperProps) => {
  const { active, payload, label } = tooltipProps

  if (active && payload && payload.length > 0) {
    return (
      <ChartTooltipStyleWrapper>
        {showLabel && label && (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontWeight: 'bold',
                color: 'inherit',
                fontSize: '1em',
                textAlign: 'center',
              }}
            >
              {label}
            </Typography>
          </Box>
        )}
        {children(tooltipProps)}
      </ChartTooltipStyleWrapper>
    )
  }
  return null
}

export const LabelAndValueChartTooltip = (
  props: Omit<ChartTooltipWrapperProps, 'showLabel' | 'children'>,
) => (
  <ChartTooltipWrapper showLabel {...props}>
    {({ payload }) => (
      <>
        {payload.map(({ name, color, unit, value }) => (
          <Stack
            key={name}
            spacing={1}
            justifyContent="space-between"
            direction={{ sm: 'row', xs: 'column' }}
          >
            <Typography color={color} aria-label={`${name}`}>
              {name}:
            </Typography>
            <Typography aria-label={`${name} Value:`}>
              {value} {unit || ''}
            </Typography>
          </Stack>
        ))}
      </>
    )}
  </ChartTooltipWrapper>
)

/**
 * this is just styling code for recharts
 * legend
 * so it is not worth testing.
 */
export const legendFormatter: LegendProps['formatter'] = (value, entry) => (
  <span style={{ color: alpha(entry.color, 1) }}>{value}</span>
)
