import { render, screen } from '@testing-library/react'
import { adminUser, allMockUsers } from '__mocks__/Users'
import MockTeams from '__mocks__/Teams'
import MockValueStreams from '__mocks__/ValueStreams'
import MockOrganizations from '__mocks__/Organizations'
import MockTeamViews from '__mocks__/TeamViews'
import MockCollectors from '__mocks__/Collectors'
import { useAPIContext, useRequiredAPIData } from './hooks'
import APIContextProvider from './APIContextProvider'

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useRequiredAPIData: jest.fn(),
}))

const useRequiredAPIDataMock = useRequiredAPIData as jest.MockedFunction<
  typeof useRequiredAPIData
>

const MockComponent = () => {
  const { currentUser } = useAPIContext()
  return <div data-testid={`foo-bar-${currentUser.username}`} />
}

describe('APIContextProvider', () => {
  it('should render the children given the data from api', () => {
    useRequiredAPIDataMock.mockReturnValue({
      data: {
        currentUser: adminUser,
        allUsers: allMockUsers.result,
        teamList: MockTeams.result,
        valueStreamList: MockValueStreams.result,
        organizationList: MockOrganizations.result,
        featureFlags: {},
        teamViews: MockTeamViews.result,
        collectors: MockCollectors.result,
      },
      isLoading: false,
      hasErrored: false,
      hasErroredOnRefetch: false,
      isRefetching: false,
    })
    render(
      <APIContextProvider>
        <MockComponent />
      </APIContextProvider>,
    )
    expect(
      screen.getByTestId(`foo-bar-${adminUser.username}`),
    ).toBeInTheDocument()
  })
})
