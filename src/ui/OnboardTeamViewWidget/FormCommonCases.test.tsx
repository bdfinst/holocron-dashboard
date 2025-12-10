import { useAPIContext, createTeamView, CollectorTargetsProvider } from 'api'
import TeamViews from '__mocks__/TeamViews'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { createTeam } from '__mocks__/Teams'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { useNavigate } from 'react-router-dom'
import TeamViewForm from './TeamViewForm'
import * as useFormReducerHookModule from './useTeamViewFormReducer'

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
  createTeamView: jest.fn(),
  useAPIContext: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const createTeamViewMock = createTeamView as jest.Mock

beforeAll(() => {
  useAPIContextMock.mockReturnValue({
    teamViews: TeamViews.result,
  })
})

describe('Forms Common Cases', () => {
  it('both forms should redirect to /admin on cancel', async () => {
    const mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
    RenderWithWrapper(
      <CollectorTargetsProvider>
        <TeamViewForm team={createTeam({})} />
      </CollectorTargetsProvider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel Submission' }),
    )

    expect(mockNavigate).toHaveBeenCalledWith('/admin')
  })

  it('both forms should show error snackbar on failure', async () => {
    jest.spyOn(useFormReducerHookModule, 'default').mockReturnValue({
      state: {
        teamViewName: {
          value: 'foo',
          error: false,
          helperText: '',
        },
        repositories: [],
        pipelines: [],
        ticketBoards: [],
        projects: [],
        isSubmitting: false,
        isSubmitDisabled: false,
      },
      setTeamViewName: jest.fn(),
      setTicketBoards: jest.fn(),
      setPipelines: jest.fn(),
      setRepositories: jest.fn(),
      setProjects: jest.fn(),
      setIsSubmitting: jest.fn(),
    })

    createTeamViewMock.mockRejectedValueOnce(new Error('oops.'))

    RenderWithWrapper(
      <CollectorTargetsProvider>
        <TeamViewForm team={createTeam({})} />
      </CollectorTargetsProvider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    const errorAlert = await screen.findByRole('alert')

    expect(errorAlert).toHaveTextContent('Error submitting form.')
  })
})
