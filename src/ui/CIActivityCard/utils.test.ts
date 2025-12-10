import { TeamMetrics } from 'api'
import {
  padAndSortAscendingWeekEntires,
  getMonthAndMondayDayLabel,
} from 'utils/DashboardWidgetWrapper'
import {
  getCIActivityChartData,
  getPercentProgressToCIInformation,
} from './utils'

const MAX_DAYS_IN_WEEK_THAT_CAN_BE_USED_FOR_INTEGRATIONS = 5

jest.mock('utils/DashboardWidgetWrapper', () => ({
  ...jest.requireActual('utils/DashboardWidgetWrapper'),
  padAndSortAscendingWeekEntires: jest.fn(),
  getMonthAndMondayDayLabel: jest.fn(),
}))

const padAndSortAscendingWeekEntriesMock =
  padAndSortAscendingWeekEntires as jest.Mock
const getMonthAndMondayDayLabelMock = getMonthAndMondayDayLabel as jest.Mock

describe('getPercentProgressToCIInformation', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it(`should return the progress percentage to ci
		(total internal integrations / (average team size for the week * days in the week))
		of that week if the week has already passed'), as well
    as the minimum integrations needed for the week`, () => {
    jest.useFakeTimers({ now: new Date('2021-06-14') })
    expect(new Date().getTime()).toEqual(new Date('2021-06-14').getTime())
    const expectedProgressToCI = 27 // Math.round((total internal integrations / (average team size * MAX_DAYS_IN_WEEK_THAT_CAN_BE_USED_FOR_INTEGRATIONS)) * 100) = 27%
    const expectedMinimumIntegrationsNeeded = Math.round(
      1.5 * MAX_DAYS_IN_WEEK_THAT_CAN_BE_USED_FOR_INTEGRATIONS,
    ) // Math.round(average team size for week * days passed in the week) = Math.round(1.5 * 5)

    const { percentProgressToCI, minimumIntegrationsNeeded } =
      getPercentProgressToCIInformation('2021-05-24', 2, 1.5)

    expect(percentProgressToCI).toEqual(expectedProgressToCI)
    expect(minimumIntegrationsNeeded).toEqual(expectedMinimumIntegrationsNeeded)
  })

  it(`should use the number of days passed in the week
   (ignoring Sunday and Saturday) when calculating percentage to CI`, () => {
    jest.useFakeTimers({ now: new Date('2021-12-06') })
    expect(new Date().getTime()).toEqual(new Date('2021-12-06').getTime())
    const daysPassedSinceMondayOfTheWeek = 1
    const expectedProgressToCI = 100 // Math.round((total internal integrations / ( average team size * daysPassedSinceMondayOfTheWeek)) * 100) = 100%
    const expectedMinimumIntegrationsNeeded = Math.round(
      2 * daysPassedSinceMondayOfTheWeek,
    ) // Math.round(average team size for week * days passed in the week) = Math.round(2 * 5)

    const { percentProgressToCI, minimumIntegrationsNeeded } =
      getPercentProgressToCIInformation('2021-12-06', 2, 2)

    expect(percentProgressToCI).toEqual(expectedProgressToCI)
    expect(minimumIntegrationsNeeded).toEqual(expectedMinimumIntegrationsNeeded)
  })
})

describe('getCIActivityChartData', () => {
  beforeAll(() => {
    padAndSortAscendingWeekEntriesMock.mockImplementation(
      dataPoints => dataPoints,
    )
    getMonthAndMondayDayLabelMock.mockImplementation(weekString => weekString)
  })

  it(`should have the totals for integrations, and direct integrations
  and an average team size`, () => {
    const apiMetrics = [
      {
        historicalData: [
          {
            week: 'dontcare-1',
            totalDirectIntegrations: 1,
            totalInternalIntegrations: 1,
            averageTeamSize: 2,
          },
          {
            week: 'dontcare-2',
            totalDirectIntegrations: 1,
            totalInternalIntegrations: 1,
            averageTeamSize: 2,
          },
        ],
      },
    ] as TeamMetrics[]

    const expected = [
      {
        totalDirectIntegrations: 1,
        totalInternalIntegrations: 1,
        averageTeamSize: 2,
      },
      {
        totalDirectIntegrations: 1,
        totalInternalIntegrations: 1,
        averageTeamSize: 2,
      },
    ]

    expect(
      getCIActivityChartData({
        apiMetrics,
        weekRange: 2,
        featureFlags: {},
      }).map(
        ({
          totalDirectIntegrations,
          totalInternalIntegrations,
          averageTeamSize,
        }) => ({
          totalDirectIntegrations,
          totalInternalIntegrations,
          averageTeamSize,
        }),
      ),
    ).toEqual(expected)
  })

  it('should have external contributors as well if FEATURE_EXTERNAL_CONTRIBUTORS is on', () => {
    const apiMetrics = [
      {
        historicalData: [
          {
            week: 'dontcare-1',
            totalDirectIntegrations: 1,
            totalInternalIntegrations: 1,
            totalExternalIntegrations: 1,
            averageTeamSize: 2,
          },
          {
            week: 'dontcare-2',
            totalDirectIntegrations: 1,
            totalInternalIntegrations: 1,
            totalExternalIntegrations: 1,
            averageTeamSize: 2,
          },
        ],
      },
    ] as TeamMetrics[]

    const expected = [
      {
        totalDirectIntegrations: 1,
        totalInternalIntegrations: 1,
        totalExternalIntegrations: 1,
        averageTeamSize: 2,
      },
      {
        totalDirectIntegrations: 1,
        totalInternalIntegrations: 1,
        totalExternalIntegrations: 1,
        averageTeamSize: 2,
      },
    ]

    expect(
      getCIActivityChartData({
        apiMetrics,
        weekRange: 2,
        featureFlags: {
          FEATURE_EXTERNAL_CONTRIBUTORS: true,
        },
      }).map(
        ({
          totalDirectIntegrations,
          totalInternalIntegrations,
          totalExternalIntegrations,
          averageTeamSize,
        }) => ({
          totalDirectIntegrations,
          totalInternalIntegrations,
          totalExternalIntegrations,
          averageTeamSize,
        }),
      ),
    ).toEqual(expected)
  })
})
