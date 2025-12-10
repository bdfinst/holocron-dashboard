import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { deleteOrganization } from 'api'
import Organizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import GroupEntityDeleteButton from '.'

jest.mock('loglevel')

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  deleteOrganization: jest.fn(),
}))

const deleteOrganizationMock = deleteOrganization as jest.Mock

describe('GroupEntityDeleteButton', () => {
  describe('Button Usability', () => {
    it('should be enabled if user can use the button', () => {
      const [organization] = Organizations.result
      RenderWithWrapper(
        <GroupEntityDeleteButton
          canDelete
          apiDeleteFn={deleteOrganization}
          groupEntityCategory="organization"
          groupEntity={organization}
        />,
      )

      expect(
        screen.getByLabelText(`delete-organization-${organization.name}`),
      ).toBeEnabled()
    })

    it('should be disabled if they cannot use it', () => {
      const [organization] = Organizations.result
      RenderWithWrapper(
        <GroupEntityDeleteButton
          canDelete={false}
          apiDeleteFn={deleteOrganization}
          groupEntityCategory="organization"
          groupEntity={organization}
        />,
      )

      expect(
        screen.getByLabelText(`delete-organization-${organization.name}`),
      ).toBeDisabled()
    })
  })

  describe('Button submission', () => {
    const [organization] = Organizations.result
    const confirmationMessage = `Are you sure you want to Delete organzation name ${organization.name}`

    afterEach(() => {
      expect(deleteOrganization).toHaveBeenCalledTimes(1)
      expect(deleteOrganization).toHaveBeenCalledWith(organization)
      deleteOrganizationMock.mockReset()
    })

    it('should close model on success', async () => {
      deleteOrganizationMock.mockResolvedValue(organization)

      RenderWithWrapper(
        <GroupEntityDeleteButton
          canDelete
          apiDeleteFn={deleteOrganization}
          groupEntityCategory="organization"
          groupEntity={organization}
        />,
      )

      await userEvent.click(
        screen.getByRole('button', {
          name: `delete-organization-${organization.name}`,
        }),
      )
      await userEvent.type(
        screen.getByLabelText(`Enter ${organization.name} to Confirm Action`),
        organization.name,
      )
      await userEvent.click(screen.getByRole('button', { name: 'Yes Button' }))

      await waitFor(() => {
        expect(screen.queryByText(confirmationMessage)).not.toBeInTheDocument()
      })
    })

    it('should show error alert on failure and allow user to close alert', async () => {
      deleteOrganizationMock.mockImplementation(() => {
        throw new Error('oops.')
      })

      RenderWithWrapper(
        <GroupEntityDeleteButton
          canDelete
          apiDeleteFn={deleteOrganization}
          groupEntityCategory="organization"
          groupEntity={organization}
        />,
      )

      await userEvent.click(
        screen.getByRole('button', {
          name: `delete-organization-${organization.name}`,
        }),
      )
      await userEvent.type(
        screen.getByLabelText(`Enter ${organization.name} to Confirm Action`),
        organization.name,
      )
      await userEvent.click(screen.getByRole('button', { name: 'Yes Button' }))

      await waitFor(async () => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Error deleting organization.',
        )
        await userEvent.click(screen.getByLabelText('Close'))
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })
})
