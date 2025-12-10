import React from 'react'
import { Tooltip, TooltipProps } from '@mui/material'
import { styled } from '@mui/material/styles'

const PX = 12

interface UnstyledTooltipProps extends TooltipProps {
  className?: string
}

const UnstyledTooltip: React.FC<UnstyledTooltipProps> = ({
  className,
  ...props
}) => <Tooltip {...props} classes={{ tooltip: className }} />

/**
 * StyledTooltip is a styled
 * Material UI tooltip with custom
 * theme styles.
 *
 */
const StyledTooltip = styled(UnstyledTooltip)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  maxWidth: 220,
  fontSize: theme.typography.pxToRem(PX),
  border: '1px solid #dadde9',
}))

export default StyledTooltip
