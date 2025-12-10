import TicketBoards from '__mocks__/TicketBoards'
import Repositories from '__mocks__/Repos'
import Pipelines from '__mocks__/Pipelines'
import MockTeams from '__mocks__/Teams'
import MockCodeAnalysisProjects from '__mocks__/CodeAnalysisProjects'
import MockOrganizations from '__mocks__/Organizations'
import MockValueStreams from '__mocks__/ValueStreams'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { allMockUsers } from '__mocks__/Users'
import { createTeam, useAPIContext, CollectorTargetsProvider } from 'api'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useNavigate } from 'react-router-dom'
import CreateTeamForm from './TeamForm'

jest.mock('api/CollectorTargetsProvider', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
  useCollectorTargetsContext: jest.fn().mockReturnValue({
    ticketBoards: TicketBoards.result,
    repositories: Repositories.result,
    pipelines: Pipelines.result,
    projects: MockCodeAnalysisProjects.result,
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
  default: function MockedOnboardTeamViewWidget(props: any): JSX.Element {
    return <div data-testid="OnboardTeamViewWidget" {...props} />
  },
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  createTeam: jest.fn(),
  useAPIContext: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const createTeamMock = createTeam as jest.Mock

const [mockOrganization] = MockOrganizations.result
const [mockValueStream] = MockValueStreams.result
const [mockTeam] = MockTeams.result

const expectInitialFormState = () => {
  expect(
    screen.getByRole('combobox', { name: 'Select Your Organization' }),
  ).toBeEnabled()
  expect(
    screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
  ).toBeDisabled()
  expect(
    screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
  ).toBeDisabled()
  expect(
    screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
  ).toHaveValue('')
  expect(
    screen.getByRole('textbox', {
      name: 'Enter the number of members in your team',
    }),
  ).toBeDisabled()
  expect(
    screen.getByRole('textbox', {
      name: 'Enter the number of members in your team',
    }),
  ).toHaveValue('')
  expect(
    screen.getByRole('combobox', { name: 'Select Your Team Admins' }),
  ).toBeDisabled()
  expect(
    screen.getByRole('combobox', { name: 'Select Ticket Boards' }),
  ).toBeDisabled()
  expect(
    screen.getByRole('combobox', { name: 'Select Repositories' }),
  ).toBeDisabled()
  expect(
    screen.getByRole('combobox', { name: 'Select Pipelines' }),
  ).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'Submit Your Form' }),
  ).toBeDisabled()
}

beforeEach(() => {
  useAPIContextMock.mockReturnValue({
    allUsers: allMockUsers.result,
    organizationList: MockOrganizations.result,
    featureFlags: { ssoEnabled: true },
  })
})

const renderComponent = () =>
  RenderWithWrapper(
    <CollectorTargetsProvider>
      <CreateTeamForm />
    </CollectorTargetsProvider>,
  )

describe('Form initial state', () => {
  it('should only have organization select field enabled', () => {
    renderComponent()
    expectInitialFormState()
  })
})

describe('Form effects', () => {
  it('changing organization should reset all fields', async () => {
    renderComponent()

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
      `${mockOrganization.name}{arrowdown}{enter}`,
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
      `${mockValueStream.name}{arrowdown}{enter}`,
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
      'foo bar',
    )

    await userEvent.type(
      screen.getByRole('textbox', {
        name: 'Enter the number of members in your team',
      }),
      '5',
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
      `${'{backspace}'.repeat(mockOrganization.name.length)}`,
    )

    expectInitialFormState()
  })

  it('changing value stream should reset all fields besides organization', async () => {
    renderComponent()

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
      `${mockOrganization.name}{arrowdown}{enter}`,
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
      `${mockValueStream.name}{arrowdown}{enter}`,
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
      'foo bar',
    )

    await userEvent.type(
      screen.getByRole('textbox', {
        name: 'Enter the number of members in your team',
      }),
      '5',
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
      `${'{backspace}'.repeat(mockValueStream.name.length)}`,
    )

    expect(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
    ).toBeEnabled()
    expect(
      screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
    ).toBeEnabled()
    expect(
      screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
    ).toHaveValue('')
    expect(
      screen.getByRole('textbox', {
        name: 'Enter the number of members in your team',
      }),
    ).toBeDisabled()
    expect(
      screen.getByRole('textbox', {
        name: 'Enter the number of members in your team',
      }),
    ).toHaveValue('')
    expect(
      screen.getByRole('combobox', { name: 'Select Your Team Admins' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('combobox', { name: 'Select Ticket Boards' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('combobox', { name: 'Select Repositories' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('combobox', { name: 'Select Pipelines' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    ).toBeDisabled()
  })
})

describe('Form validation', () => {
  describe('team name field', () => {
    it('should not allow submission if team name is taken', async () => {
      renderComponent()

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${mockOrganization.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
        `${mockValueStream.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
        mockTeam.name,
      )

      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Enter the number of members in your team',
        }),
        '5',
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Team Admins' }),
        'basic{arrowdown}{enter}',
      )

      expect(
        screen.getByText(`${mockTeam.name} already exists`),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })
  })

  describe('team size field', () => {
    it('should not allow for submission if team size is invalid', async () => {
      renderComponent()

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${mockOrganization.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
        `${mockValueStream.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
        'foo bar',
      )

      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Enter the number of members in your team',
        }),
        '0',
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Team Admins' }),
        'basic{arrowdown}{enter}',
      )

      expect(
        screen.getByText('Input must be a positive number!'),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })
  })

  describe('team admins field', () => {
    it('should not allow for submission if team admins are not filled', async () => {
      renderComponent()

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${mockOrganization.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
        `${mockValueStream.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
        'foo bar',
      )

      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Enter the number of members in your team',
        }),
        '5',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })

    it('should be disabled if SSO is disabled', async () => {
      useAPIContextMock.mockReturnValue({
        allUsers: allMockUsers.result,
        organizationList: MockOrganizations.result,
        featureFlags: { ssoEnabled: false },
      })
      renderComponent()

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${mockOrganization.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
        `${mockValueStream.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
        'foo bar',
      )

      await userEvent.type(
        screen.getByRole('textbox', {
          name: 'Enter the number of members in your team',
        }),
        '5',
      )

      expect(
        screen.getByRole('combobox', { name: 'Select Your Team Admins' }),
      ).toBeDisabled()
      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })
})

describe('Form submission', () => {
  it('should redirect to /admin on success', async () => {
    createTeamMock.mockResolvedValue({ dont: 'CareWhatTheResponseIs' })
    const mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
    renderComponent()

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
      `${mockOrganization.name}{arrowdown}{enter}`,
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Value Stream' }),
      `${mockValueStream.name}{arrowdown}{enter}`,
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter Your Team Name' }),
      'foo bar',
    )

    await userEvent.type(
      screen.getByRole('textbox', {
        name: 'Enter the number of members in your team',
      }),
      '5',
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Team Admins' }),
      'basic{arrowdown}{enter}',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })
})
