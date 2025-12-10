import { screen, waitFor } from '@testing-library/react'
import { deleteUser } from 'api'
import userEvent from '@testing-library/user-event'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { adminUser, basicUser } from '__mocks__/Users'
import DeleteUserButton from './DeleteUserButton'

jest.mock('loglevel')

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  deleteUser: jest.fn(),
}))

jest.mock('reactQueryConfig', () => {
  const config = jest.requireActual('reactQueryConfig').default
  const { USE_QUERY_CONFIG } = config
  return {
    __esModule: true,
    default: {
      // keep everything in config
      ...config,
      // only change this
      USE_QUERY_CONFIG: {
        ...USE_QUERY_CONFIG,
        retry: 0,
      },
      LOGGER: {
        ...config.LOGGER,
        error: jest.fn(),
      },
    },
  }
})

const deleteUserMock = deleteUser as jest.Mock

afterEach(() => {
  deleteUserMock.mockReset()
})

describe('DeleteUserButton', () => {
  const confirmationMessage = `Are you sure you want to Delete user ${basicUser.username}?`

  it('should send a request to delete the given user when the button is clicked', async () => {
    deleteUserMock.mockResolvedValue({})

    RenderWithWrapper(
      <DeleteUserButton users={[basicUser]} deSelectUsers={jest.fn()} />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: `delete-user-${basicUser.username}` }),
    )

    expect(screen.getByText(confirmationMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Yes Button' }))

    await waitFor(() => {
      expect(screen.queryByText(confirmationMessage)).not.toBeInTheDocument()
    })

    expect(deleteUserMock).toHaveBeenCalledTimes(1)
    expect(deleteUserMock).toHaveBeenCalledWith(basicUser)
  })
})

describe('DeleteUserButton bulkDelete', () => {
  const confirmationMessage =
    'Are you sure you want to Delete the selected users?'

  it('should send a request to delete the given user when the button is clicked', async () => {
    deleteUserMock.mockResolvedValue({})

    RenderWithWrapper(
      <DeleteUserButton
        users={[basicUser, adminUser]}
        deSelectUsers={jest.fn()}
        bulkDelete
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'delete-user-bulk' }),
    )

    expect(screen.getByText(confirmationMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Yes Button' }))

    await waitFor(() => {
      expect(screen.queryByText(confirmationMessage)).not.toBeInTheDocument()
    })

    expect(deleteUserMock).toHaveBeenCalledTimes(2)
    expect(deleteUserMock).toHaveBeenCalledWith(basicUser)
    expect(deleteUserMock).toHaveBeenCalledWith(adminUser)
  })
})

describe('DeleteUserButton errors', () => {
  const confirmationMessage = `Are you sure you want to Delete user ${basicUser.username}?`

  it('it should show error alert on failure', async () => {
    deleteUserMock.mockRejectedValue(new Error('oops.'))

    RenderWithWrapper(
      <DeleteUserButton users={[basicUser]} deSelectUsers={jest.fn()} />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: `delete-user-${basicUser.username}` }),
    )

    expect(screen.getByText(confirmationMessage)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Yes Button' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Error deleting.')
    })

    expect(deleteUserMock).toHaveBeenCalledTimes(1)
    expect(deleteUserMock).toHaveBeenCalledWith(basicUser)
  })
})
