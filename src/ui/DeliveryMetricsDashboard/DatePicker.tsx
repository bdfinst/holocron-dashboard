import { Slider, styled } from '@mui/material'
import localStorageConfig from 'localStorageConfig'
import { useState } from 'react'
import * as localStorage from 'local-storage'

const CustomSlider = styled(Slider)({
  '& .MuiSlider-markLabel': {
    transform: 'rotate(45deg) translateY(45%)',
    marginTop: '1%',
  },
})

export const weekRanges = [
  {
    value: 4,
    description: 'Last Month',
    label: '1 Mo.',
  },
  {
    value: 12,
    description: 'Last 3 Months',
    label: '3 Mo.',
  },
  {
    value: 24,
    description: 'Last 6 Months',
    label: '6 Mo.',
  },
  {
    value: 36,
    description: 'Last 9 Months',
    label: '9 Mo.',
  },
  {
    value: 52,
    description: 'Last Year',
    label: '1 Yr.',
  },
]

export const DEFAULT_WEEK_RANGE = weekRanges[1].value

export const useWeekRange = () => {
  const [weekRange, setWeekRange] = useState(() => {
    const lsWeekRange = localStorage.get<number>(localStorageConfig.WEEK_RANGE)
    if (weekRanges.some(r => r.value === lsWeekRange)) {
      return lsWeekRange
    }
    return DEFAULT_WEEK_RANGE
  })

  return {
    weekRange,
    setWeekRange: (value: number) => {
      localStorage.set(localStorageConfig.WEEK_RANGE, value)
      setWeekRange(value)
    },
  }
}

export type DatePickerProps = {
  weeksOfData: number
  handleSelectWeeksOfData: (weekRange: number) => void
}

const DatePicker = ({
  weeksOfData,
  handleSelectWeeksOfData,
}: DatePickerProps) => {
  const [firstMonthWkRange] = weekRanges
  const lastYearWkRange = weekRanges[weekRanges.length - 1]

  return (
    <CustomSlider
      aria-labelledby="select-a-date-range"
      value={weeksOfData}
      valueLabelFormat={value =>
        weekRanges.find(mark => mark.value === value).description
      }
      getAriaLabel={() => 'Select a Date Range For Metrics'}
      getAriaValueText={(value, _) =>
        `Currently Selected Metrics From ${
          weekRanges.find(mark => mark.value === value).description
        }`
      }
      onChange={(_, value) => {
        if (typeof value === 'number') {
          handleSelectWeeksOfData(value)
        }
      }}
      step={null}
      valueLabelDisplay="on"
      min={firstMonthWkRange.value}
      max={lastYearWkRange.value}
      marks={weekRanges}
    />
  )
}

export default DatePicker
