import React from 'react'
import { render, screen } from '@testing-library/react'
import MockTicketBoards from '__mocks__/TicketBoards'
import MockRepositories from '__mocks__/Repos'
import MockPipelines from '__mocks__/Pipelines'
import MockProjects from '__mocks__/CodeAnalysisProjects'
import { useCollectorTargets } from './hooks'
import CollectorTargetsProvider, {
  useCollectorTargetsContext,
} from './CollectorTargetsProvider'

// Mock the hooks
jest.mock('./hooks', () => ({
  useCollectorTargets: jest.fn(),
}))

const useCollectorTargetsMock = useCollectorTargets as jest.MockedFunction<
  typeof useCollectorTargets
>

// Mock component to test context consumption
const MockComponent = () => {
  const { ticketBoards, repositories, pipelines, projects, isLoading, error } =
    useCollectorTargetsContext()
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return (
    <div>
      <div data-testid="ticket-boards-count">{ticketBoards.length}</div>
      <div data-testid="repositories-count">{repositories.length}</div>
      <div data-testid="pipelines-count">{pipelines.length}</div>
      <div data-testid="projects-count">{projects.length}</div>
    </div>
  )
}

describe('CollectorTargetsProvider', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render children with collector targets data', () => {
    useCollectorTargetsMock.mockReturnValue({
      data: {
        ticketBoards: MockTicketBoards.result,
        repositories: MockRepositories.result,
        pipelines: MockPipelines.result,
        projects: MockProjects.result,
      },
      isLoading: false,
      hasErrored: false,
      hasErroredOnRefetch: false,
      isRefetching: false,
    })

    render(
      <CollectorTargetsProvider>
        <MockComponent />
      </CollectorTargetsProvider>,
    )

    expect(screen.getByTestId('ticket-boards-count')).toHaveTextContent(
      MockTicketBoards.result.length.toString(),
    )
    expect(screen.getByTestId('repositories-count')).toHaveTextContent(
      MockRepositories.result.length.toString(),
    )
    expect(screen.getByTestId('pipelines-count')).toHaveTextContent(
      MockPipelines.result.length.toString(),
    )
    expect(screen.getByTestId('projects-count')).toHaveTextContent(
      MockProjects.result.length.toString(),
    )
  })

  it('should render loading state', () => {
    useCollectorTargetsMock.mockReturnValue({
      data: null,
      isLoading: true,
      hasErrored: false,
      hasErroredOnRefetch: false,
      isRefetching: false,
    })

    render(
      <CollectorTargetsProvider>
        <MockComponent />
      </CollectorTargetsProvider>,
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render error state', () => {
    useCollectorTargetsMock.mockReturnValue({
      data: null,
      isLoading: false,
      hasErrored: true,
      hasErroredOnRefetch: false,
      isRefetching: false,
    })

    render(
      <CollectorTargetsProvider>
        <MockComponent />
      </CollectorTargetsProvider>,
    )

    expect(
      screen.getByText('Error: Failed to load collector targets'),
    ).toBeInTheDocument()
  })

  it('should provide empty arrays when data is null', () => {
    useCollectorTargetsMock.mockReturnValue({
      data: null,
      isLoading: false,
      hasErrored: false,
      hasErroredOnRefetch: false,
      isRefetching: false,
    })

    render(
      <CollectorTargetsProvider>
        <MockComponent />
      </CollectorTargetsProvider>,
    )

    expect(screen.getByTestId('ticket-boards-count')).toHaveTextContent('0')
    expect(screen.getByTestId('repositories-count')).toHaveTextContent('0')
    expect(screen.getByTestId('pipelines-count')).toHaveTextContent('0')
    expect(screen.getByTestId('projects-count')).toHaveTextContent('0')
  })
})

describe('useCollectorTargetsContext', () => {
  it('should throw an error when used outside of CollectorTargetsProvider', () => {
    // Suppress console error to avoid noisy output
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    expect(() => render(<MockComponent />)).toThrow(
      'useCollectorTargetsContext must be used within a CollectorTargetsProvider',
    )

    consoleErrorSpy.mockRestore()
  })
})
