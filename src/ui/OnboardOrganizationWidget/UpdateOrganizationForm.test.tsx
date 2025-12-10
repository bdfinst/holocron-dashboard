import { updateOrganization, useAPIContext } from 'api'
import { allMockUsers } from '__mocks__/Users'
import MockOrganizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { useNavigate } from 'react-router-dom'
import UpdateOrganizationForm from './OrganizationForm'

jest.mock('loglevel')

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  updateOrganization: jest.fn(),
  useAPIContext: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // preserve other exports
  useNavigate: jest.fn(), // mock useNavigate
}))

const useAPIContextMock = useAPIContext as jest.Mock
const updateOrganizationMock = updateOrganization as jest.Mock

const [organization, anotherOrganization] = MockOrganizations.result

beforeEach(() => {
  useAPIContextMock.mockReturnValue({
    allUsers: allMockUsers.result,
    organizationList: MockOrganizations.result,
    featureFlags: { ssoEnabled: true },
  })
})

describe('UpdateOrganizationForm', () => {
  describe('Form validation', () => {
    describe('organization name field', () => {
      it('should not allow for submission if organization name already exists', async () => {
        RenderWithWrapper(
          <UpdateOrganizationForm organization={organization} />,
          {},
        )
        await userEvent.type(
          screen.getByRole('textbox', { name: 'Enter Organization Name' }),
          `${'{backspace}'.repeat(organization.name.length)}${
            anotherOrganization.name
          }`,
        )

        expect(
          screen.getByText(`${anotherOrganization.name} already exists`),
        ).toBeInTheDocument()

        expect(
          screen.getByRole('button', { name: 'Submit Your Form' }),
        ).toBeDisabled()
      })

      it('should allow for submission if organization name changes to valid one', async () => {
        RenderWithWrapper(
          <UpdateOrganizationForm organization={organization} />,
          {},
        )
        await userEvent.type(
          screen.getByRole('textbox', { name: 'Enter Organization Name' }),
          `${'{backspace}'.repeat(organization.name.length)}foo bar`,
        )

        expect(
          screen.getByRole('button', { name: 'Submit Your Form' }),
        ).toBeEnabled()
      })
    })

    describe('organization admins field', () => {
      it('should allow for submission if organization admin change', async () => {
        RenderWithWrapper(
          <UpdateOrganizationForm organization={organization} />,
          {},
        )
        await userEvent.type(
          screen.getByRole('combobox', {
            name: 'Select Your Organization Admins',
          }),
          'basic{arrowdown}{enter}',
        )

        expect(
          screen.getByRole('button', { name: 'Submit Your Form' }),
        ).toBeEnabled()
      })

      it('should be disabled if soo is disabled', () => {
        useAPIContextMock.mockReturnValue({
          allUsers: allMockUsers.result,
          organizationList: MockOrganizations.result,
          featureFlags: { ssoEnabled: false },
        })
        RenderWithWrapper(
          <UpdateOrganizationForm organization={organization} />,
          {},
        )

        expect(
          screen.getByRole('combobox', {
            name: 'Select Your Organization Admins',
          }),
        ).toBeDisabled()
      })
    })
  })

  describe('Form submission', () => {
    it('should redirect to /admin on success', async () => {
      const mockNavigate = jest.fn()

      ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
      updateOrganizationMock.mockResolvedValue({
        dont: 'CareWhatResponseWeGet',
      })
      RenderWithWrapper(
        <UpdateOrganizationForm organization={organization} />,
        {},
      )
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Organization Name' }),
        `${'{backspace}'.repeat(organization.name.length)}foo bar`,
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      )

      await waitFor(() => {
        expect(updateOrganizationMock).toHaveBeenCalledTimes(1)

        expect(mockNavigate).toHaveBeenCalledWith('/admin')
      })
    })
  })
})
