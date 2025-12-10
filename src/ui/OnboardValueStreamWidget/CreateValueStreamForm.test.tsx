import { createValueStream, useAPIContext } from 'api'
import { allMockUsers } from '__mocks__/Users'
import MockOrganizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import MockValueStreams from '__mocks__/ValueStreams'
import { useNavigate } from 'react-router-dom'
import CreateValueStreamForm from './ValueStreamForm'

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

const [mockOrganization] = MockOrganizations.result
const [mockValueStream] = MockValueStreams.result

beforeEach(() => {
  useAPIContextMock.mockReturnValue({
    allUsers: allMockUsers.result,
    organizationList: MockOrganizations.result,
    featureFlags: { ssoEnabled: true },
  })
})

describe('Form initial state', () => {
  it('should have only organization selection field enabled', () => {
    RenderWithWrapper(<CreateValueStreamForm />)

    expect(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
    ).toBeEnabled()

    expect(
      screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
    ).toBeDisabled()

    expect(
      screen.getByRole('combobox', {
        name: 'Select Your Value Stream Admins',
      }),
    ).toBeDisabled()
  })
})

describe('Form effects', () => {
  it('changing organization should reset the fields', async () => {
    RenderWithWrapper(<CreateValueStreamForm />)

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
      `${mockOrganization.name}{arrowdown}{enter}`,
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
      'foo bar',
    )

    await userEvent.type(
      screen.getByRole('combobox', {
        name: 'Select Your Value Stream Admins',
      }),
      'basic{arrowdown}{enter}',
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
      `${'{backspace}'.repeat(mockOrganization.name.length)}`,
    )

    expect(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
    ).toBeEnabled()
    expect(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
    ).toHaveValue('')

    expect(
      screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
    ).toHaveValue('')

    expect(
      screen.getByRole('combobox', {
        name: 'Select Your Value Stream Admins',
      }),
    ).toBeDisabled()
  })
})

describe('Form validation', () => {
  describe('value stream name field', () => {
    it('should not allow submission if value stream name is taken', async () => {
      RenderWithWrapper(<CreateValueStreamForm />)

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${mockOrganization.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
        `${mockValueStream.name}`,
      )

      await userEvent.type(
        screen.getByRole('combobox', {
          name: 'Select Your Value Stream Admins',
        }),
        'basic{arrowdown}{enter}',
      )

      expect(
        screen.getByText(`${mockValueStream.name} already exists`),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })
  })

  describe('value stream admins field', () => {
    it('should not allow submission if value stream admins are not filled', async () => {
      RenderWithWrapper(<CreateValueStreamForm />)

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${mockOrganization.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
        'foo bar',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })

    it('should be disabled if sso is not enabled', async () => {
      useAPIContextMock.mockReturnValue({
        allUsers: allMockUsers.result,
        organizationList: MockOrganizations.result,
        featureFlags: { ssoEnabled: false },
      })
      RenderWithWrapper(<CreateValueStreamForm />)

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${mockOrganization.name}{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
        'foo bar',
      )

      expect(
        screen.getByRole('combobox', {
          name: 'Select Your Value Stream Admins',
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
    const mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)

    RenderWithWrapper(<CreateValueStreamForm />, {})

    createValueStreamMock.mockResolvedValueOnce({
      dont: 'CareWhatTheResponseIs',
    })

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
      `${mockOrganization.name}{arrowdown}{enter}`,
    )

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
      'foo bar',
    )

    await userEvent.type(
      screen.getByRole('combobox', {
        name: 'Select Your Value Stream Admins',
      }),
      'basic{arrowdown}{enter}',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })
})
