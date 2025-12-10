import { ToggleButtonGroup, ToggleButton } from '@mui/material'
import {
  Brightness3Icon,
  BrightnessHighIcon,
  VisibilityIcon,
} from 'utils/icons'
import { useColorModeContext } from 'utils/ThemeWrapper'
import StyledTooltip from 'utils/StyledTooltip'
import globalConfig from 'globalConfig'
import { useState } from 'react'

const SwitchThemeButton = () => {
  const { toggleColorMode, isGrayScale, colorMode } = useColorModeContext()
  const [alignment, setAlignment] = useState<string>(() => {
    switch (colorMode) {
      case 'dark':
        return 'left'
      case 'light':
        return isGrayScale ? 'right' : 'center'
      default:
        return 'left'
    }
  })

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    setAlignment(newAlignment)
    if (newAlignment === 'left') {
      // Light Mode
      toggleColorMode('dark')
    } else if (newAlignment === 'center') {
      // Dark Mode
      toggleColorMode('light')
    } else if (newAlignment === 'right') {
      // Grayscale Mode
      toggleColorMode('gray-scale')
    }
  }

  return (
    <>
      <ToggleButtonGroup
        value={alignment}
        exclusive
        onChange={handleAlignment}
        aria-label="text alignment"
      >
        <ToggleButton value="left" aria-label="left aligned">
          <StyledTooltip
            title="Dark Mode"
            placement="top"
            enterTouchDelay={globalConfig.UI_SETTINGS.TOOL_TIP_DELAY}
          >
            <div>
              <Brightness3Icon />{' '}
              {/* Use BrightnessHighIcon for Light Mode <BrightnessHighIcon /> */}
            </div>
          </StyledTooltip>
        </ToggleButton>
        <ToggleButton value="center" aria-label="centered">
          <StyledTooltip
            title="Light Mode"
            placement="top"
            enterTouchDelay={globalConfig.UI_SETTINGS.TOOL_TIP_DELAY}
          >
            <div>
              <BrightnessHighIcon />{' '}
              {/* Use Brightness3Icon for Dark Mode <Brightness3Icon /> */}
            </div>
          </StyledTooltip>
        </ToggleButton>
        <ToggleButton value="right" aria-label="right aligned">
          <StyledTooltip
            title="Grayscale Mode"
            placement="top"
            enterTouchDelay={globalConfig.UI_SETTINGS.TOOL_TIP_DELAY}
          >
            <div>
              <VisibilityIcon />
            </div>
          </StyledTooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  )
}

export default SwitchThemeButton
