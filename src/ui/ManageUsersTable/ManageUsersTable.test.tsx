import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { User, useAPIContext } from 'api'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { adminUser, allMockUsers, basicUser } from '__mocks__/Users'
import type { MatcherFunction } from 'expect'
import ManageUsersTable from '.'

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Redirect: ({ to }: { to: string }) => <div data-testid={to} />,
}))

jest.mock('./DeleteUserButton', () => ({
  __esModule: true,
  default: ({
    users,
    deSelectUsers,
    bulkDelete,
  }: {
    users: User[]
    deSelectUsers: (users: User[]) => void
    bulkDelete?: boolean
  }) =>
    bulkDelete ? (
      <button
        type="button"
        onClick={() => deSelectUsers(users)}
        data-testid="delete-bulk-users"
      />
    ) : (
      <button
        type="button"
        onClick={() => deSelectUsers(users)}
        data-testid={`delete-user-${users[0].username}`}
      />
    ),
}))

const useAPIContextMock = useAPIContext as jest.Mock

// For some reason the checkbox React declares uses "data-indeterminate" instead of "indeterminate" like .toBePartiallChecked() wants for some sort of portability reason
// A custom helper is defined here for readability later on
const toBeIndeterminate: MatcherFunction = function (received) {
  const element = received as HTMLElement
  const isPartiallyChecked =
    element.getAttribute('data-indeterminate') === 'true'

  return {
    message: () =>
      isPartiallyChecked
        ? `Expected ${this.utils.printReceived(element)} not to be partially checked`
        : `Expected ${this.utils.printReceived(element)} to be partially checked`,
    pass: isPartiallyChecked,
  }
}

expect.extend({ toBeIndeterminate })

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeIndeterminate(): R
    }
  }
}

describe('ManageUsersTable', () => {
  beforeEach(() => {
    useAPIContextMock.mockReturnValue({
      allUsers: allMockUsers.result,
    })
  })

  describe('UsersTable UI', () => {
    it('should show a No Users Found message if no users', () => {
      useAPIContextMock.mockReturnValue({
        allUsers: [],
      })

      RenderWithWrapper(<ManageUsersTable />)

      expect(screen.getByText('No Users Found')).toBeInTheDocument()
    })

    it('should have the required columns', () => {
      RenderWithWrapper(<ManageUsersTable />)

      expect(
        screen.getByRole('columnheader', { name: 'select all users' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', { name: 'Username' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', { name: 'Actions' }),
      ).toBeInTheDocument()

      expect(screen.getAllByRole('columnheader').length).toEqual(3)
    })
  })

  describe('UsersTable checkbox logic', () => {
    it('should show user is checked after it is selected', async () => {
      RenderWithWrapper(<ManageUsersTable />)

      await userEvent.click(
        screen.getByLabelText(`row-${basicUser.id}-checkbox`),
      )
      expect(screen.getByLabelText('number selected')).toHaveTextContent(
        '1 selected',
      )
      expect(
        screen.getByLabelText(`User Table Row-${basicUser.id}`),
      ).toBeChecked()
      expect(screen.getByLabelText('select all users')).toBeIndeterminate()
    })

    it('should show user is unchecked after it is selected twice', async () => {
      RenderWithWrapper(<ManageUsersTable />)

      await userEvent.click(
        screen.getByLabelText(`row-${basicUser.id}-checkbox`),
      )
      await userEvent.click(
        screen.getByLabelText(`row-${basicUser.id}-checkbox`),
      )
      expect(screen.queryByLabelText('number selected')).not.toBeInTheDocument()
      expect(
        screen.getByLabelText(`User Table Row-${basicUser.id}`),
      ).not.toBeChecked()
      expect(screen.getByLabelText('select all users')).not.toBeIndeterminate()
    })

    it('show all users as checked if select all is clicked', async () => {
      RenderWithWrapper(<ManageUsersTable />)

      await userEvent.click(screen.getByLabelText('select all users'))
      expect(screen.queryByLabelText('number selected')).toHaveTextContent(
        `${allMockUsers.result.length} selected`,
      )
      screen
        .getAllByLabelText(/User Table Row/i)
        .forEach(userTableRow => expect(userTableRow).toBeChecked())
      expect(screen.getByLabelText('select all users')).toBeChecked()
      expect(screen.getByLabelText('select all users')).not.toBeIndeterminate()
    })

    it('should deselect all users as if select all is clicked twice', async () => {
      RenderWithWrapper(<ManageUsersTable />)

      await userEvent.click(screen.getByLabelText('select all users'))
      await userEvent.click(screen.getByLabelText('select all users'))
      expect(screen.queryByLabelText('number selected')).not.toBeInTheDocument()
      screen
        .getAllByLabelText(/User Table Row/i)
        .forEach(userTableRow => expect(userTableRow).not.toBeChecked())
      expect(screen.getByLabelText('select all users')).not.toBeChecked()
      expect(screen.getByLabelText('select all users')).not.toBeIndeterminate()
    })
  })

  describe('after deleting user logic', () => {
    it('should still preserve the order of selected items on deletion success if more than one item selected', async () => {
      RenderWithWrapper(<ManageUsersTable />)

      await userEvent.click(
        screen.getByLabelText(`row-${basicUser.id}-checkbox`),
      )
      await userEvent.click(
        screen.getByLabelText(`row-${adminUser.id}-checkbox`),
      )
      expect(screen.queryByLabelText('number selected')).toHaveTextContent(
        `${[basicUser, adminUser].length} selected`,
      )

      await userEvent.click(
        screen.getByTestId(`delete-user-${basicUser.username}`),
      )

      expect(screen.queryByLabelText('number selected')).toHaveTextContent(
        `${[adminUser].length} selected`,
      )
      expect(
        screen.getByLabelText(`User Table Row-${adminUser.id}`),
      ).toBeChecked()
    })
  })
})
