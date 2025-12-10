import { render, screen } from '@testing-library/react'
import { CollectorTarget } from 'api'
import MockTicketBoards from '__mocks__/TicketBoards'
import MockRepositories from '__mocks__/Repos'
import { Reports } from '.'

const MockCollectorTargetsSpy = jest.fn()
const [mockBlackListedTicketBoard] = MockTicketBoards.result

jest.mock('./CollectorTargetsReportTable', () => ({
  __esModule: true,
  default: ({ collectorTargets }: { collectorTargets: CollectorTarget[] }) => {
    MockCollectorTargetsSpy(collectorTargets)
    return <div data-testid="CollectorTargetsReportTable" />
  },
}))

jest.mock('globalConfig', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('globalConfig').default,
    METRICS_SETTINGS: {
      ...jest.requireActual('globalConfig').default.METRICS_SETTINGS,
      BLACKLIST_FEATURE_BOARDS: [MockTicketBoards.result[0].url],
    },
  },
}))

jest.mock('api/CollectorTargetsProvider', () => ({
  useCollectorTargetsContext: () => ({
    ticketBoards: MockTicketBoards.result,
    repositories: MockRepositories.result,
    isLoading: false,
    error: null,
  }),
}))

describe('Reports', () => {
  afterEach(MockCollectorTargetsSpy.mockReset)

  it('should render with ticket boards report, and repositories report', () => {
    render(<Reports />)
    const expectedAmountOfReportsTables = 2
    expect(screen.getAllByTestId('CollectorTargetsReportTable')).toHaveLength(
      expectedAmountOfReportsTables,
    )
  })

  it('should only show ticket boards that are filtered from black list', () => {
    render(<Reports />)
    expect(MockCollectorTargetsSpy).toHaveBeenCalledWith(
      MockTicketBoards.result.filter(
        t => t.id !== mockBlackListedTicketBoard.id,
      ),
    )
  })
})
