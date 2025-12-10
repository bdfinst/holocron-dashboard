import MockOrganizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { allMockUsers } from '__mocks__/Users'
import {
  updateTeam,
  useAPIContext,
  CollectorTargetsProvider,
  useCollectorTargetsContext,
} from 'api'
import { renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TicketBoards from '__mocks__/TicketBoards'
import Repositories from '__mocks__/Repos'
import Pipelines from '__mocks__/Pipelines'
import MockCodeAnalysisProjects from '__mocks__/CodeAnalysisProjects'
import { useNavigate } from 'react-router-dom'
import UpdateTeamForm, { usePreviousTeamData } from './TeamForm'

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

jest.mock('ui/UploadTeamMembersFile', () => ({
  __esModule: true,
  default: () => <div data-testid="UploadTeamMembersFile" />,
}))

jest.mock('ui/OnboardTeamViewWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="OnboardTeamViewWidget" />,
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useCollectorTargets: jest.fn(),
  updateTeam: jest.fn(),
  useAPIContext: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const updateTeamMock = updateTeam as jest.Mock

const [mockOrganization, anotherOrganization] = MockOrganizations.result
const [anotherValueStream, mockValueStream] = mockOrganization.valueStreams
const [mockTeam, anotherTeamInSameValueStream] = mockValueStream.teams
const [anotherTeamInDifferentValueStream] = anotherValueStream.teams

beforeEach(() => {
  useAPIContextMock.mockReturnValue({
    allUsers: allMockUsers.result,
    organizationList: MockOrganizations.result,
    featureFlags: { ssoEnabled: true },
  })
})

describe('Form initial state', () => {
  it('should be prepopulated with previous data', () => {
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
        <UpdateTeamForm
          organization={mockOrganization}
          valueStream={mockValueStream}
          team={mockTeam}
          previousTeamTicketBoards={TicketBoards.result.filter(
            t => t.teamId === mockTeam.id,
          )}
          previousTeamRepositories={Repositories.result.filter(
            r => r.teamId === mockTeam.id,
          )}
          previousTeamPipelines={Pipelines.result.filter(
            p => p.teamId === mockTeam.id,
          )}
          previousTeamProjects={MockCodeAnalysisProjects.result.filter(
            p => p.teamId === mockTeam.id,
          )}
        />
        ,
      </CollectorTargetsProvider>,
    )

    expect(
      screen
        .getByRole('combobox', { name: 'Select Your Organization' })
        .closest('input'),
    ).toHaveValue(mockOrganization.name)
    expect(
      screen
        .getByRole('combobox', { name: 'Select Your Value Stream' })
        .closest('input'),
    ).toHaveValue(mockValueStream.name)

    expect(
      screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
    ).toHaveValue(mockTeam.name)
    expect(
      screen.getByRole('textbox', {
        name: 'Enter the number of members in your team',
      }),
    ).toHaveValue(String(mockTeam.teamSize))
  })
})

describe('Form effects', () => {
  it('changing organization should reset relevant fields', async () => {
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
        <UpdateTeamForm
          organization={mockOrganization}
          valueStream={mockValueStream}
          team={mockTeam}
          previousTeamTicketBoards={TicketBoards.result.filter(
            t => t.teamId === mockTeam.id,
          )}
          previousTeamRepositories={Repositories.result.filter(
            r => r.teamId === mockTeam.id,
          )}
          previousTeamPipelines={Pipelines.result.filter(
            p => p.teamId === mockTeam.id,
          )}
          previousTeamProjects={MockCodeAnalysisProjects.result.filter(
            p => p.teamId === mockTeam.id,
          )}
        />
        ,
      </CollectorTargetsProvider>,
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
      `${'{backspace}'.repeat(mockOrganization.name.length)}`,
    )

    expect(
      screen
        .getByRole('combobox', { name: 'Select Your Value Stream' })
        .closest('input'),
    ).toHaveValue('')
    expect(
      screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
    ).toHaveValue('')

    expect(
      screen.getByRole('textbox', {
        name: 'Enter the number of members in your team',
      }),
    ).toHaveValue(String(mockTeam.teamSize))
  })

  it('changing value stream field should reset relevant fields', async () => {
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
        <UpdateTeamForm
          organization={mockOrganization}
          valueStream={mockValueStream}
          team={mockTeam}
          previousTeamTicketBoards={TicketBoards.result.filter(
            t => t.teamId === mockTeam.id,
          )}
          previousTeamRepositories={Repositories.result.filter(
            r => r.teamId === mockTeam.id,
          )}
          previousTeamPipelines={Pipelines.result.filter(
            p => p.teamId === mockTeam.id,
          )}
          previousTeamProjects={MockCodeAnalysisProjects.result.filter(
            p => p.teamId === mockTeam.id,
          )}
        />
        ,
      </CollectorTargetsProvider>,
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
      `${'{backspace}'.repeat(mockValueStream.name.length)}`,
    )

    expect(
      screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
    ).toHaveValue('')
    // the rest of the fields should not change
    expect(
      screen.getByRole('textbox', {
        name: 'Enter the number of members in your team',
      }),
    ).toHaveValue(String(mockTeam.teamSize))
    expect(
      screen
        .getByRole('combobox', { name: 'Select Your Organization' })
        .closest('input'),
    ).toHaveValue(mockOrganization.name)
  })
})

describe('Form validation', () => {
  describe('organization field', () => {
    it('setting it together with value stream, and team name should enable submit', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${'{backspace}'.repeat(mockOrganization.name.length)}${
          anotherOrganization.name
        }{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
        `${anotherOrganization.valueStreams[0].name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
        'foo bar',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('value stream field', () => {
    it('setting it together with team name should enable submission', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
        `${'{backspace}'.repeat(mockValueStream.name.length)}${
          anotherValueStream.name
        }{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
        'foo bar',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('team name field', () => {
    it('should not allow submission if team name is taken within same value stream', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
        `${'{backspace}'.repeat(mockTeam.name.length)}${
          anotherTeamInSameValueStream.name
        }`,
      )

      expect(
        screen.getByText(`${anotherTeamInSameValueStream.name} already exists`),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })

    it('should not allow submission if team name is taken within different value stream', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
        `${'{backspace}'.repeat(mockValueStream.name.length)}${
          anotherValueStream.name
        }{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
        anotherTeamInDifferentValueStream.name,
      )

      expect(
        screen.getByText(
          `${anotherTeamInDifferentValueStream.name} already exists`,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })

    it('should allow submission if field gets updated', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
        `${'{backspace}'.repeat(mockTeam.name.length)}foo bar`,
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('team size field', () => {
    it('should allow submission if field gets changed', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Enter the number of members in your team',
        }),
        `${'{backspace}'.repeat(String(mockTeam.teamSize).length)}1`,
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('team admins field', () => {
    it('should allow submission if admin gets changed', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Team Admins' }),
        'basic{arrowdown}{enter}',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })

    it('should be disabled if sso is disabled', () => {
      useAPIContextMock.mockReturnValue({
        allUsers: allMockUsers.result,
        organizationList: MockOrganizations.result,
        featureFlags: { ssoEnabled: false },
      })
      jest.mocked(useCollectorTargetsContext).mockReturnValue({
        ticketBoards: TicketBoards.result,
        repositories: Repositories.result,
        pipelines: Pipelines.result,
        projects: MockCodeAnalysisProjects.result,
        isLoading: false,
        error: null,
      })
      RenderWithWrapper(
        <CollectorTargetsProvider>
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
        </CollectorTargetsProvider>,
      )

      expect(
        screen.getByRole('combobox', { name: 'Select Your Team Admins' }),
      ).toBeDisabled()
    })
  })

  describe('ticket boards field', () => {
    it('should allow submission if ticket boards get changed', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
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
    it('should allow submission if repositories get changed', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
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
    it('should allow submission if pipelines get changed', async () => {
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
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
          <UpdateTeamForm
            organization={mockOrganization}
            valueStream={mockValueStream}
            team={mockTeam}
            previousTeamTicketBoards={TicketBoards.result.filter(
              t => t.teamId === mockTeam.id,
            )}
            previousTeamRepositories={Repositories.result.filter(
              r => r.teamId === mockTeam.id,
            )}
            previousTeamPipelines={Pipelines.result.filter(
              p => p.teamId === mockTeam.id,
            )}
            previousTeamProjects={MockCodeAnalysisProjects.result.filter(
              p => p.teamId === mockTeam.id,
            )}
          />
          ,
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
    updateTeamMock.mockResolvedValueOnce({ dont: 'CareWhatResponseIs' })
    jest.mocked(useCollectorTargetsContext).mockReturnValue({
      ticketBoards: TicketBoards.result,
      repositories: Repositories.result,
      pipelines: Pipelines.result,
      projects: MockCodeAnalysisProjects.result,
      isLoading: false,
      error: null,
    })
    RenderWithWrapper(
      <CollectorTargetsProvider>
        <UpdateTeamForm
          organization={mockOrganization}
          valueStream={mockValueStream}
          team={mockTeam}
          previousTeamTicketBoards={TicketBoards.result.filter(
            t => t.teamId === mockTeam.id,
          )}
          previousTeamRepositories={Repositories.result.filter(
            r => r.teamId === mockTeam.id,
          )}
          previousTeamPipelines={Pipelines.result.filter(
            p => p.teamId === mockTeam.id,
          )}
          previousTeamProjects={MockCodeAnalysisProjects.result.filter(
            p => p.teamId === mockTeam.id,
          )}
        />
        ,
      </CollectorTargetsProvider>,
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
      `${'{backspace}'.repeat(mockTeam.name.length)}foo bar`,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })
})

describe('usePreviousTeamData', () => {
  it('should return null data if collector targets are being fetched', () => {
    ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      ticketBoards: [],
      repositories: [],
      pipelines: [],
      projects: [],
    })
    const { result } = renderHook(() => usePreviousTeamData({ team: mockTeam }))
    expect(result.current.data).toBeNull()
  })

  it('should return null data if collector targets fetch has errored', () => {
    ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      ticketBoards: [],
      repositories: [],
      pipelines: [],
      projects: [],
    })
    const { result } = renderHook(() => usePreviousTeamData({ team: mockTeam }))
    expect(result.current.data).toBeNull()
  })

  it('should return the data needed for update form otherwise', () => {
    ;(useCollectorTargetsContext as jest.Mock).mockReturnValue({
      ticketBoards: TicketBoards.result,
      repositories: Repositories.result,
      pipelines: Pipelines.result,
      projects: MockCodeAnalysisProjects.result,
      isLoading: false,
      error: null,
    })
    const { result } = renderHook(() => usePreviousTeamData({ team: mockTeam }))
    const {
      current: { data },
    } = result
    const {
      previousTeamPipelines,
      previousTeamRepositories,
      previousTeamTicketBoards,
      previousTeamProjects,
    } = data
    expect(
      previousTeamPipelines.every(item => item.teamId === mockTeam.id),
    ).toBe(true)
    expect(
      previousTeamRepositories.every(item => item.teamId === mockTeam.id),
    ).toBe(true)
    expect(
      previousTeamTicketBoards.every(item => item.teamId === mockTeam.id),
    ).toBe(true)
    expect(
      previousTeamProjects.every(item => item.teamId === mockTeam.id),
    ).toBe(true)
  })
})
