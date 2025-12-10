import { createValueStream, useAPIContext } from 'api'
import { allMockUsers, basicUser } from '__mocks__/Users'
import MockOrganizations, { createOrganization } from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { useNavigate } from 'react-router-dom'
import ValueStreamForm from './ValueStreamForm'
import * as useFormReducerHookModule from './useValueStreamFormReducer'

jest.mock('loglevel')

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  createValueStream: jest.fn(),
  useAPIContext: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // preserve other exports
  useNavigate: jest.fn(), // mock useNavigate
}))

const useAPIContextMock = useAPIContext as jest.Mock
const createValueStreamMock = createValueStream as jest.Mock

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
    RenderWithWrapper(<ValueStreamForm />, {})

    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel Submission' }),
    )

    expect(mockNavigate).toHaveBeenCalledWith('/admin')
  })

  it('both forms should show error snackback on failure', async () => {
    jest.spyOn(useFormReducerHookModule, 'default').mockReturnValue({
      state: {
        organization: {
          value: createOrganization({ name: 'foo' }),
          error: false,
          helperText: '',
          disabled: false,
        },
        valueStreamName: {
          value: 'foo bar',
          error: false,
          helperText: '',
          disabled: false,
        },
        valueStreamAdmins: { value: [basicUser], error: false, helperText: '' },
        isSubmitDisabled: false,
        isSubmitting: false,
      },
      setIsSubmitting: jest.fn(),
      setOrganization: jest.fn(),
      setValueStreamAdmins: jest.fn(),
      setValueStreamName: jest.fn(),
    })

    createValueStreamMock.mockRejectedValueOnce(new Error('oops.'))

    RenderWithWrapper(<ValueStreamForm />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    const errorAlert = await screen.findByRole('alert')

    expect(errorAlert).toHaveTextContent('Error submitting form.')
  })
})
