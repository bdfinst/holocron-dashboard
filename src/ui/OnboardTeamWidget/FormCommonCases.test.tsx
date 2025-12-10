import MockOrganizations, { createOrganization } from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { allMockUsers, basicUser } from '__mocks__/Users'
import { createTeam, useAPIContext, CollectorTargetsProvider } from 'api'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { createValueStream } from '__mocks__/ValueStreams'
import { useNavigate } from 'react-router-dom'
import TeamForm from './TeamForm'
import * as useFormReducerHookModule from './useTeamFormReducer'

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
  createTeam: jest.fn(),
  useAPIContext: jest.fn(),
}))

jest.mock('ui/UploadTeamMembersFile', () => ({
  __esModule: true,
  default: () => <div data-testid="UploadTeamMembersFile" />,
}))

jest.mock('ui/OnboardTeamViewWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="OnboardTeamViewWidget" />,
}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const createTeamMock = createTeam as jest.Mock

beforeAll(() => {
  useAPIContextMock.mockReturnValue({
    allUsers: allMockUsers.result,
    organizationList: MockOrganizations.result,
    featureFlags: { ssoEnabled: true },
  })
})

describe('Forms Common Cases', () => {
  it('both forms should redirect to /admin on cancel', async () => {
    const mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
    RenderWithWrapper(
      <CollectorTargetsProvider>
        <TeamForm />,
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
        organization: {
          value: createOrganization({ name: 'foo' }),
          error: false,
          helperText: '',
          disabled: false,
        },
        valueStream: {
          value: createValueStream({ name: 'bar' }),
          error: false,
          helperText: '',
          disabled: false,
        },
        teamName: {
          value: 'foo bar',
          error: false,
          helperText: '',
          disabled: false,
        },
        teamSize: {
          value: '5',
          error: false,
          helperText: '',
        },
        teamAdmins: {
          value: [basicUser],
          error: false,
          helperText: '',
        },
        ticketBoards: [],
        repositories: [],
        pipelines: [],
        projects: [],
        isSubmitDisabled: false,
        isSubmitting: false,
      },
      setIsSubmitting: jest.fn(),
      setOrganization: jest.fn(),
      setValueStream: jest.fn(),
      setTeamName: jest.fn(),
      setTeamSize: jest.fn(),
      setTeamAdmins: jest.fn(),
      setPipelines: jest.fn(),
      setTicketBoards: jest.fn(),
      setRepositories: jest.fn(),
      setProjects: jest.fn(),
    })

    createTeamMock.mockRejectedValueOnce(new Error('oops.'))

    RenderWithWrapper(
      <CollectorTargetsProvider>
        <TeamForm />,
      </CollectorTargetsProvider>,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    const errorAlert = await screen.findByRole('alert')

    expect(errorAlert).toHaveTextContent('Error submitting form.')
  })
})
