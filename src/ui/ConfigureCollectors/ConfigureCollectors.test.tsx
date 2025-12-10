import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter as Router } from 'react-router-dom'
import { APIContext, useAPIContext } from 'api'
import Collectors from '__mocks__/Collectors'
import { allMockUsers } from '__mocks__/Users'
import React, { act } from 'react'
import { useMutation } from 'react-query'
import ConfigureCollectors from './index'

jest.mock('react-query', () => ({
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
  })),
  setLogger: jest.fn(),
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
  updateCollector: jest.fn(),
}))

const mockCollectors = Collectors.result
const mockUsers = allMockUsers.result

const mockAPIContext = {
  currentUser: {
    id: 1,
    name: 'Test User',
    isAdmin: true,
    isOrgLeadership: true,
    username: 'testuser',
  },
  allUsers: mockUsers,
  teamList: [],
  valueStreamList: [],
  organizationList: [],
  featureFlags: {},
  teamViews: [],
  collectors: mockCollectors,
}

beforeAll(() => {
  ;(useAPIContext as jest.Mock).mockReturnValue(mockAPIContext)
})

const renderComponent = () => {
  render(
    <Router>
      <APIContext.Provider value={mockAPIContext}>
        <ConfigureCollectors />
      </APIContext.Provider>
    </Router>,
  )
}

describe('ConfigureCollectors', () => {
  let mutateMock: jest.Mock

  beforeEach(() => {
    mutateMock = jest.fn((variables, { onSuccess }) => {
      const response = {
        data: {
          id: 1,
          name: 'Updated Collector',
          target: 'updated-target',
          collectorIntervalSeconds: 30,
          collectorTargetsIntrvlSecs: 60,
          lookBackDays: 7,
          maxRequestsPerMinute: 120,
        },
      }
      onSuccess(response.data)
    })
    ;(useMutation as jest.Mock).mockImplementation((mutateFn, options) => ({
      mutate: variables => mutateMock(variables, options),
    }))
  })
  it('should open the configuration dialog when "Configure Collectors" button is clicked', async () => {
    renderComponent()
    const button = screen.getByTestId('configure-collectors-button')
    await userEvent.click(button)
    expect(screen.getByText('Collector Configuration')).toBeInTheDocument()
  })

  it('should close the configuration dialog when the close button is clicked', async () => {
    renderComponent()
    const configureButton = screen.getByLabelText('Configure Collectors')
    fireEvent.click(configureButton)
    await waitFor(() =>
      expect(screen.getByLabelText('Close')).toBeInTheDocument(),
    )
    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    await waitFor(() => {
      expect(screen.queryByLabelText('Close')).not.toBeInTheDocument()
    })
  })

  it('should change tabs when a different collector is selected', async () => {
    renderComponent()
    const configureButton = screen.getByLabelText('Configure Collectors')
    fireEvent.click(configureButton)
    await waitFor(() =>
      expect(screen.getByLabelText('Close')).toBeInTheDocument(),
    )

    const initialTab = screen.getByTestId('tab-sonarqube.project_analysis')
    const targetTab = screen.getByTestId('tab-jira.workflow')

    expect(initialTab).toHaveAttribute('aria-selected', 'true')
    expect(targetTab).toHaveAttribute('aria-selected', 'false')

    fireEvent.click(targetTab)

    const updatedInitialTab = screen.getByTestId(
      'tab-sonarqube.project_analysis',
    )
    const updatedTargetTab = screen.getByTestId('tab-jira.workflow')

    expect(updatedTargetTab).toHaveAttribute('aria-selected', 'true')
    expect(updatedInitialTab).toHaveAttribute('aria-selected', 'false')
  })

  it('should update input fields when changed', async () => {
    renderComponent()
    const configureButton = screen.getByLabelText('Configure Collectors')
    fireEvent.click(configureButton)
    await waitFor(() =>
      expect(screen.getByLabelText('Close')).toBeInTheDocument(),
    )

    const inputField = screen
      .getByLabelText('Collector Interval (seconds)')
      .querySelector('input') as HTMLInputElement

    fireEvent.change(inputField, { target: { value: '42' } })

    expect(inputField).toHaveValue(42)
  })

  it('should call handleSave when the save button is clicked and trigger onSuccess', async () => {
    renderComponent()

    const configureButton = screen.getByLabelText('Configure Collectors')
    fireEvent.click(configureButton)

    await waitFor(() =>
      expect(screen.getByLabelText('Close')).toBeInTheDocument(),
    )

    const saveButton = screen.getByRole('button', { name: 'Save' })

    await waitFor(async () => {
      fireEvent.click(saveButton)
    })

    expect(mutateMock).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(
        screen.getByText('Collector Updated Collector updated successfully'),
      ).toBeInTheDocument()
    })
  })

  it('should show error notification on failed save', async () => {
    renderComponent()

    const configureButton = screen.getByLabelText('Configure Collectors')
    fireEvent.click(configureButton)

    await waitFor(() =>
      expect(screen.getByLabelText('Close')).toBeInTheDocument(),
    )

    const saveButton = screen.getByRole('button', { name: 'Save' })

    await waitFor(async () => {
      fireEvent.click(saveButton)
    })

    expect(mutateMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      mutateMock.mock.calls[0][1].onError()
    })

    await waitFor(() => {
      expect(screen.getByText('Error updating collector')).toBeInTheDocument()
    })
  })
})
