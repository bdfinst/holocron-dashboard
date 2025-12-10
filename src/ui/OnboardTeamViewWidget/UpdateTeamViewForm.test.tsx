import {
  useAPIContext,
  updateTeamView,
  CollectorTargetsProvider,
  useCollectorTargetsContext,
} from 'api'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { renderHook, screen, waitFor } from '@testing-library/react'
import MockTeams from '__mocks__/Teams'
import MockTeamViews from '__mocks__/TeamViews'
import TicketBoards from '__mocks__/TicketBoards'
import Repositories from '__mocks__/Repos'
import Pipelines from '__mocks__/Pipelines'
import MockCodeAnalysisProjects from '__mocks__/CodeAnalysisProjects'
import { useNavigate } from 'react-router-dom'
import UpdateTeamViewForm, { usePreviousTeamViewData } from './TeamViewForm'

jest.mock('api/CollectorTargetsProvider', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
  useCollectorTargetsContext: jest.fn().mockReturnValue({
    ticketBoards: [],
    repositories: [],
    pipelines: [],
    projects: [],
    isLoading: false,
    error: null,
  }),
}))

jest.mock('loglevel')

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  updateTeamView: jest.fn(),
  useCollectorTargets: jest.fn(),
  useAPIContext: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const updateTeamViewMock = updateTeamView as jest.Mock

beforeAll(() => {
  useAPIContextMock.mockReturnValue({
    teamViews: [
      ...MockTeamViews.result,
      {
        id: 9001,
        name: 'taken',
        viewOwnerId: MockTeamViews.result[0].viewOwnerId,
        collectorTargets: [],
        isWorkflowOnly: false,
      },
    ],
  })
})

const [mockTeam] = MockTeams.result
const [mockTeamView] = MockTeamViews.result

describe('Form validation', () => {
  beforeEach(() => {
    ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
      ticketBoards: [],
      repositories: [],
      pipelines: [],
      projects: [],
      isLoading: false,
      error: null,
    })
  })
  describe('name field', () => {
    it('should not allow submission if team view name is already taken', async () => {
      RenderWithWrapper(
        <CollectorTargetsProvider>
          <UpdateTeamViewForm
            team={mockTeam}
            teamView={mockTeamView}
            previousTeamViewTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeamView.id,
            )}
            previousTeamViewRepositories={Repositories.result.filter(
              r => r.teamId === mockTeamView.id,
            )}
            previousTeamViewPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
            previousTeamViewProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team View Name' }),
        `${'{backspace}'.repeat(mockTeamView.name.length)}taken`,
      )

      expect(screen.getByText('taken already exists')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })

    it('should allow submission if team view name changes to a valid one', async () => {
      RenderWithWrapper(
        <CollectorTargetsProvider>
          <UpdateTeamViewForm
            team={mockTeam}
            teamView={mockTeamView}
            previousTeamViewTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeamView.id,
            )}
            previousTeamViewRepositories={Repositories.result.filter(
              r => r.teamId === mockTeamView.id,
            )}
            previousTeamViewPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
            previousTeamViewProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team View Name' }),
        'foo bar',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('ticket boards field', () => {
    it('should allow submission if ticket boards changes', async () => {
      // Mock the CollectorTargetsContext
      ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
        ticketBoards: TicketBoards.result,
        repositories: Repositories.result,
        pipelines: Pipelines.result,
        projects: MockCodeAnalysisProjects.result,
        isLoading: false,
        error: null,
      })

      RenderWithWrapper(
        <CollectorTargetsProvider>
          <UpdateTeamViewForm
            team={mockTeam}
            teamView={mockTeamView}
            previousTeamViewTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeamView.id,
            )}
            previousTeamViewRepositories={Repositories.result.filter(
              r => r.teamId === mockTeamView.id,
            )}
            previousTeamViewPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
            previousTeamViewProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
          />
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Ticket Boards' }),
        'Board 2 [[url : https://jira.com/rest/agile/1.0/board/720]{arrowdown}{enter}',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('repositories field', () => {
    it('should allow submission if repositories changes', async () => {
      // Mock the CollectorTargetsContext
      ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
        ticketBoards: TicketBoards.result,
        repositories: Repositories.result,
        pipelines: Pipelines.result,
        projects: MockCodeAnalysisProjects.result,
        isLoading: false,
        error: null,
      })

      RenderWithWrapper(
        <CollectorTargetsProvider>
          <UpdateTeamViewForm
            team={mockTeam}
            teamView={mockTeamView}
            previousTeamViewTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeamView.id,
            )}
            previousTeamViewRepositories={Repositories.result.filter(
              r => r.teamId === mockTeamView.id,
            )}
            previousTeamViewPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
            previousTeamViewProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
          />
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Repositories' }),
        'Repo 2 [[url : https://gitlab.com/repo-2]{arrowdown}{enter}',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('pipelines field', () => {
    it('should allow submission if pipelines changes', async () => {
      // Mock the CollectorTargetsContext
      ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
        ticketBoards: TicketBoards.result,
        repositories: Repositories.result,
        pipelines: Pipelines.result,
        projects: MockCodeAnalysisProjects.result,
        isLoading: false,
        error: null,
      })

      RenderWithWrapper(
        <CollectorTargetsProvider>
          <UpdateTeamViewForm
            team={mockTeam}
            teamView={mockTeamView}
            previousTeamViewTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeamView.id,
            )}
            previousTeamViewRepositories={Repositories.result.filter(
              r => r.teamId === mockTeamView.id,
            )}
            previousTeamViewPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
            previousTeamViewProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
          />
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Pipelines' }),
        'Repo 3 [[url : https://gitlab.com/repo-3]{arrowdown}{enter}',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('projects field', () => {
    it('should allow submission if projects get changed', async () => {
      // Mock the CollectorTargetsContext
      ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
        ticketBoards: TicketBoards.result,
        repositories: Repositories.result,
        pipelines: Pipelines.result,
        projects: MockCodeAnalysisProjects.result,
        isLoading: false,
        error: null,
      })

      RenderWithWrapper(
        <CollectorTargetsProvider>
          <UpdateTeamViewForm
            team={mockTeam}
            teamView={mockTeamView}
            previousTeamViewTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeamView.id,
            )}
            previousTeamViewRepositories={Repositories.result.filter(
              r => r.teamId === mockTeamView.id,
            )}
            previousTeamViewPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
            previousTeamViewProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeamView.id,
            )}
          />
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('combobox', {
          name: 'Select Code Analysis Projects',
        }),
        'Code Analysis Project 1 [[url : https://code.analysis.project.1.com]{arrowdown}{enter}',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })
})

describe('Form submission', () => {
  it('should redirect to /admin on success', async () => {
    const mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
    updateTeamViewMock.mockResolvedValueOnce({ dont: 'CareWhatTheResponseIs' })

    // Mock the CollectorTargetsContext
    ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
      ticketBoards: TicketBoards.result,
      repositories: Repositories.result,
      pipelines: Pipelines.result,
      projects: MockCodeAnalysisProjects.result,
      isLoading: false,
      error: null,
    })

    RenderWithWrapper(
      <CollectorTargetsProvider>
        <UpdateTeamViewForm
          team={mockTeam}
          teamView={mockTeamView}
          previousTeamViewTicketBoards={TicketBoards.result.filter(
            t => t.teamId === mockTeamView.id,
          )}
          previousTeamViewRepositories={Repositories.result.filter(
            r => r.teamId === mockTeamView.id,
          )}
          previousTeamViewPipelines={Pipelines.result.filter(
            p => p.teamId === mockTeamView.id,
          )}
          previousTeamViewProjects={MockCodeAnalysisProjects.result.filter(
            p => p.teamId === mockTeamView.id,
          )}
        />
      </CollectorTargetsProvider>,
      {},
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter Your Team View Name' }),
      'foo bar',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })
})

describe('usePreviousTeamViewData', () => {
  it('should return null data if collector targets are being fetched', () => {
    ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      ticketBoards: [],
      repositories: [],
      pipelines: [],
      projects: [],
    })
    const { result } = renderHook(() =>
      usePreviousTeamViewData({ teamView: mockTeamView }),
    )
    expect(result.current.data).toBeNull()
  })

  it('should return null data if collector targets fetch has errored', () => {
    ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
      isLoading: false,
      error: new Error('Test error'),
      ticketBoards: [],
      repositories: [],
      pipelines: [],
      projects: [],
    })
    const { result } = renderHook(() =>
      usePreviousTeamViewData({ teamView: mockTeamView }),
    )
    expect(result.current.data).toBeNull()
  })

  it('should return the data needed for update form otherwise', () => {
    ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      ticketBoards: TicketBoards.result,
      repositories: Repositories.result,
      pipelines: Pipelines.result,
      projects: MockCodeAnalysisProjects.result,
    })
    const { result } = renderHook(() =>
      usePreviousTeamViewData({ teamView: mockTeamView }),
    )

    const {
      current: { data },
    } = result
    const {
      previousTeamViewPipelines,
      previousTeamViewRepositories,
      previousTeamViewTicketBoards,
      previousTeamViewProjects,
    } = data
    expect(
      previousTeamViewPipelines.every(item => item.teamId === mockTeamView.id),
    ).toBe(true)
    expect(
      previousTeamViewRepositories.every(
        item => item.teamId === mockTeamView.id,
      ),
    ).toBe(true)
    expect(
      previousTeamViewTicketBoards.every(
        item => item.teamId === mockTeamView.id,
      ),
    ).toBe(true)
    expect(
      previousTeamViewProjects.every(item => item.teamId === mockTeamView.id),
    ).toBe(true)
  })
})
