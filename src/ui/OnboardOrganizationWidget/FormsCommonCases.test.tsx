import { createOrganization, useAPIContext } from 'api'
import { allMockUsers, basicUser } from '__mocks__/Users'
import MockOrganizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { useNavigate } from 'react-router-dom'
import CreateOrganizationForm from './OrganizationForm'
import * as useFormReducerHookModule from './useOrganizationFormReducer'

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

beforeAll(() => {
  useAPIContextMock.mockReturnValue({
    allUsers: allMockUsers.result,
    organizationList: MockOrganizations.result,
    featureFlags: { ssoEnabled: true },
  })
})

describe('Forms Common Cases', () => {
  it('both forms should redirect to /admin on cancel', async () => {
    const mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
    RenderWithWrapper(<CreateOrganizationForm />, {})

    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel Submission' }),
    )

    expect(mockNavigate).toHaveBeenCalledWith('/admin')
  })

  it('both forms should show error snackbar on failure', async () => {
    jest.spyOn(useFormReducerHookModule, 'default').mockReturnValue({
      state: {
        organizationName: { value: 'foo bar', error: false, helperText: '' },
        organizationAdmins: {
          value: [basicUser],
          error: false,
          helperText: '',
        },
        isSubmitting: false,
        isSubmitDisabled: false,
      },
      setIsSubmitting: jest.fn(),
      setOrganizationAdmins: jest.fn(),
      setOrganizationName: jest.fn(),
    })

    createOrganizationMock.mockRejectedValue(new Error('oops.'))

    RenderWithWrapper(<CreateOrganizationForm />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    const errorAlert = await screen.findByRole('alert')

    expect(createOrganizationMock).toHaveBeenCalledTimes(1)
    expect(errorAlert).toHaveTextContent('Error submitting form.')
  })
})
