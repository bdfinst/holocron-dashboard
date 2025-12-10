import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import MockTeams from '__mocks__/Teams'
import MockTeamViews from '__mocks__/TeamViews'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { useAPIContext, CollectorTargetsProvider } from 'api'
import { Route } from 'react-router-dom'
import CreateTeamViewForm from './TeamViewForm'

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

const useAPIContextMock = useAPIContext as jest.Mock

beforeAll(() => {
  useAPIContextMock.mockReturnValue({
    teamViews: MockTeamViews.result,
  })
})

const [mockTeam] = MockTeams.result
const takenTeamView = MockTeamViews.result.find(
  t => t.viewOwnerId === mockTeam.id,
)

describe('Form validation', () => {
  describe('name field', () => {
    it('should not allow submission if team view name is already taken', async () => {
      RenderWithWrapper(
        <CollectorTargetsProvider>
          <CreateTeamViewForm team={mockTeam} />
        </CollectorTargetsProvider>,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Team View Name' }),
        takenTeamView.name,
      )

      expect(
        screen.getByText(`${takenTeamView.name} already exists`),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })
  })
})

describe('Form submission', () => {
  it('should redirect to /admin on submit', async () => {
    RenderWithWrapper(null, { initialEntries: ['/admin/add-team'] }, [
      <Route
        key="home"
        path="/admin/add-team"
        element={
          <CollectorTargetsProvider>
            <CreateTeamViewForm team={mockTeam} />
          </CollectorTargetsProvider>
        }
      />,
      <Route key="admin" path="/admin" element={<div>Admin Page</div>} />,
    ])

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter Your Team View Name' }),
      'foo bar',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    await waitFor(() => {
      expect(screen.getByText('Admin Page')).toBeInTheDocument()
    })
  })
})
