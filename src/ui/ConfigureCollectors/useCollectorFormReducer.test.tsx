import { renderHook } from '@testing-library/react'
import { Collector } from 'api'
import { act } from 'react'
import useCollectorFormReducer from './useCollectorFormReducer'

describe('useCollectorFormReducer', () => {
  const initialCollectors: Collector[] = [
    {
      id: 1,
      name: 'Collector 1',
      collectorIntervalSeconds: 0,
      collectorTargetsIntrvlSecs: 0,
      createdAt: '',
      lookBackDays: 0,
      maxRequestsPerMinute: 0,
      target: '',
      updatedAt: '',
    },
    {
      id: 2,
      name: 'Collector 2',
      collectorIntervalSeconds: 0,
      collectorTargetsIntrvlSecs: 0,
      createdAt: '',
      lookBackDays: 0,
      maxRequestsPerMinute: 0,
      target: '',
      updatedAt: '',
    },
  ]

  it('should set collectors', () => {
    const { result } = renderHook(() =>
      useCollectorFormReducer(initialCollectors),
    )

    const newCollectors: Collector[] = [
      {
        id: 3,
        name: 'Collector 3',
        collectorIntervalSeconds: 0,
        collectorTargetsIntrvlSecs: 0,
        createdAt: '',
        lookBackDays: 0,
        maxRequestsPerMinute: 0,
        target: '',
        updatedAt: '',
      },
      {
        id: 4,
        name: 'Collector 4',
        collectorIntervalSeconds: 0,
        collectorTargetsIntrvlSecs: 0,
        createdAt: '',
        lookBackDays: 0,
        maxRequestsPerMinute: 0,
        target: '',
        updatedAt: '',
      },
    ]

    act(() => {
      result.current.setCollectors(newCollectors)
    })

    expect(result.current.state.collectors).toEqual(newCollectors)
  })

  it('should set selected collector', () => {
    const { result } = renderHook(() =>
      useCollectorFormReducer(initialCollectors),
    )

    const selectedCollector: Collector = {
      id: 2,
      name: 'Collector 2',
      collectorIntervalSeconds: 0,
      collectorTargetsIntrvlSecs: 0,
      createdAt: '',
      lookBackDays: 0,
      maxRequestsPerMinute: 0,
      target: '',
      updatedAt: '',
    }

    act(() => {
      result.current.setSelectedCollector(selectedCollector)
    })

    expect(result.current.state.selectedCollector).toEqual(selectedCollector)
  })

  it('should set selected tab', () => {
    const { result } = renderHook(() =>
      useCollectorFormReducer(initialCollectors),
    )

    const selectedTab = 1

    act(() => {
      result.current.setSelectedTab(selectedTab)
    })

    expect(result.current.state.selectedTab).toBe(selectedTab)
  })

  it('should update collector field', () => {
    const { result } = renderHook(() =>
      useCollectorFormReducer(initialCollectors),
    )

    const field = 'collectorIntervalSeconds'
    const value = 10

    act(() => {
      result.current.updateCollectorField(field, value)
    })

    expect(result.current.state.selectedCollector?.[field]).toBe(value)
  })

  it('should set success notification', () => {
    const { result } = renderHook(() =>
      useCollectorFormReducer(initialCollectors),
    )

    const message = 'Notification message'
    const severity = 'success'

    act(() => {
      result.current.setNotification(message, severity)
    })

    expect(result.current.state.notification).toEqual({
      message,
      severity,
      open: true,
    })
  })

  it('should set error notification', () => {
    const { result } = renderHook(() =>
      useCollectorFormReducer(initialCollectors),
    )

    const message = 'Error message'
    const severity = 'error'

    act(() => {
      result.current.setNotification(message, severity)
    })

    expect(result.current.state.notification).toEqual({
      message,
      severity,
      open: true,
    })
  })

  it('should set open state', () => {
    const { result } = renderHook(() =>
      useCollectorFormReducer(initialCollectors),
    )

    const open = true

    act(() => {
      result.current.setOpen(open)
    })

    expect(result.current.state.open).toBe(open)
  })

  it('should set submitting state', () => {
    const { result } = renderHook(() =>
      useCollectorFormReducer(initialCollectors),
    )

    const isSubmitting = true

    act(() => {
      result.current.setIsSubmitting(isSubmitting)
    })

    expect(result.current.state.isSubmitting).toBe(isSubmitting)
  })
})
