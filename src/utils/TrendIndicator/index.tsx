import { Stack, Typography, TypographyProps } from '@mui/material'
import { TrendingUpIcon, TrendingDownIcon, TrendingFlatIcon } from 'utils/icons'
import { safeDivide, roundValue } from '../DashboardWidgetWrapper'

export type TrendProps = {
  title?: string
  titleProps?: Omit<TypographyProps, 'children'>
  beforeValue: number
  afterValue: number
  timeFrame: string
}

const TrendIndicator = ({
  title,
  beforeValue,
  afterValue,
  timeFrame,
  titleProps,
}: TrendProps) => {
  const percentDifference = roundValue(
    safeDivide(afterValue - beforeValue, beforeValue) * 100,
  )

  const { sign, ariaLabel, icon, color } = (() => {
    if (percentDifference > 0) {
      return {
        sign: '+',
        ariaLabel: `Increasing ${title}`,
        icon: <TrendingUpIcon color="success" />,
        color: 'success.main',
      }
    }
    if (percentDifference < 0) {
      return {
        sign: '-',
        ariaLabel: `Decreasing ${title}`,
        icon: <TrendingDownIcon color="error" />,
        color: 'error.main',
      }
    }
    return {
      sign: '',
      ariaLabel: `No Change ${title}`,
      icon: <TrendingFlatIcon color="warning" />,
      color: 'warning.main',
    }
  })()

  return (
    <Stack
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      justifyContent="space-between"
    >
      {title && (
        <Typography variant="subtitle1" {...titleProps}>
          {title}
        </Typography>
      )}
      {icon}
      <Typography aria-label={ariaLabel} color={color}>
        {sign}
        {Math.abs(percentDifference)}%
      </Typography>
      <Typography variant="body2">vs last {timeFrame}</Typography>
    </Stack>
  )
}

export default TrendIndicator
