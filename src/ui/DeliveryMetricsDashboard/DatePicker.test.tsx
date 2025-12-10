import {
  fireEvent,
  screen,
  render,
  renderHook,
  act,
} from '@testing-library/react'
import * as localStorage from 'local-storage'
import localStorageConfig from 'localStorageConfig'
import DatePicker, {
  DEFAULT_WEEK_RANGE,
  useWeekRange,
  weekRanges,
} from './DatePicker'

jest.mock('local-storage')

const localStorageMock = localStorage as unknown as {
  set: jest.Mock
  get: jest.Mock
}

describe('useWeekRange', () => {
  afterEach(() => {
    localStorageMock.set.mockReset()
  })

  it('should initially have a default value if local storage value is not valid', () => {
    localStorageMock.get.mockReturnValue(null)
    const { result } = renderHook(() => useWeekRange())
    const { weekRange } = result.current
    expect(weekRange).toEqual(DEFAULT_WEEK_RANGE)
  })

  it('should have the local storage value initially if it is valid', () => {
    localStorageMock.get.mockReturnValue(
      weekRanges[weekRanges.length - 1].value,
    )
    const { result } = renderHook(() => useWeekRange())
    const { weekRange } = result.current
    expect(weekRange).toEqual(weekRanges[weekRanges.length - 1].value)
  })

  it('should set the local storage value on setWeekRange', () => {
    localStorageMock.get.mockReturnValue(null)
    const { result } = renderHook(() => useWeekRange())

    act(() => {
      result.current.setWeekRange(weekRanges[weekRanges.length - 1].value)
    })

    expect(result.current.weekRange).toEqual(
      weekRanges[weekRanges.length - 1].value,
    )
    expect(localStorageMock.set).toHaveBeenCalledTimes(1)
    expect(localStorageMock.set).toHaveBeenCalledWith(
      localStorageConfig.WEEK_RANGE,
      weekRanges[weekRanges.length - 1].value,
    )
  })
})

describe('Selecting a date range', () => {
  it('Should call onChange when Last Month range is selected', () => {
    const onChange = jest.fn()
    render(<DatePicker weeksOfData={12} handleSelectWeeksOfData={onChange} />)
    const dateRange = screen.getByLabelText('Select a Date Range For Metrics')
    const [lastMonth] = weekRanges
    fireEvent.change(dateRange, { target: { value: lastMonth.value } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(4)
  })
})
