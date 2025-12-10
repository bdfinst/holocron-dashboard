import { createOrganization, useAPIContext } from 'api'
import { allMockUsers } from '__mocks__/Users'
import MockOrganizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { useNavigate } from 'react-router-dom'
import CreateOrganizationForm from './OrganizationForm'

jest.mock('loglevel')

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  createOrganization: jest.fn(),
  useAPIContext: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const createOrganizationMock = createOrganization as jest.Mock
const mockNavigate = jest.fn()

const [organization] = MockOrganizations.result

beforeEach(() => {
  useAPIContextMock.mockReturnValue({
    allUsers: allMockUsers.result,
    organizationList: MockOrganizations.result,
    featureFlags: { ssoEnabled: true },
  })
})

describe('CreateOrganizationForm', () => {
  describe('Form validation', () => {
    describe('organization name field', () => {
      it('should not allow user to submit if organization name exists', async () => {
        RenderWithWrapper(<CreateOrganizationForm />, {})
        await userEvent.type(
          screen.getByRole('textbox', { name: 'Enter Organization Name' }),
          organization.name,
        )

        expect(
          screen.getByText(`${organization.name} already exists`),
        ).toBeInTheDocument()

        expect(
          screen.getByRole('button', { name: 'Submit Your Form' }),
        ).toBeDisabled()
      })
    })

    describe('organization admins field', () => {
      it('should not allow for submission if user has not filled organization admins', async () => {
        RenderWithWrapper(<CreateOrganizationForm />, {})
        await userEvent.type(
          screen.getByRole('textbox', { name: 'Enter Organization Name' }),
          'foo-bar',
        )

        expect(
          screen.getByRole('button', { name: 'Submit Your Form' }),
        ).toBeDisabled()
      })

      it('should be disabled if sso is disabled', async () => {
        useAPIContextMock.mockReturnValue({
          allUsers: allMockUsers.result,
          organizationList: MockOrganizations.result,
          featureFlags: { ssoEnabled: false },
        })
        RenderWithWrapper(<CreateOrganizationForm />, {})

        await userEvent.type(
          screen.getByRole('textbox', { name: 'Enter Organization Name' }),
          'foo bar',
        )

        expect(
          screen.getByRole('combobox', {
            name: 'Select Your Organization Admins',
          }),
        ).toBeDisabled()

        expect(
          screen.getByRole('button', { name: 'Submit Your Form' }),
        ).toBeEnabled()
      })
    })
  })

  describe('Form submission', () => {
    it('should redirect to /admin on success', async () => {
      RenderWithWrapper(<CreateOrganizationForm />, {})
      ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)

      createOrganizationMock.mockResolvedValue({
        dont: 'CareWhatTheResponseIs',
      })

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Organization Name' }),
        'foo bar',
      )

      await userEvent.type(
        screen.getByRole('combobox', {
          name: 'Select Your Organization Admins',
        }),
        'basic{arrowdown}{enter}',
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      )

      await waitFor(() => {
        expect(createOrganizationMock).toHaveBeenCalledTimes(1)
        expect(mockNavigate).toHaveBeenCalledWith('/admin')
      })
    })
  })
})
