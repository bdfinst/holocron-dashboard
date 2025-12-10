import { updateValueStream, useAPIContext } from 'api'
import { allMockUsers } from '__mocks__/Users'
import MockOrganizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import MockValueStreams from '__mocks__/ValueStreams'
import { useNavigate } from 'react-router-dom'
import UpdateValueStream from './ValueStreamForm'

jest.mock('loglevel')

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  updateValueStream: jest.fn(),
  useAPIContext: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const updateValueStreamMock = updateValueStream as jest.Mock

const [mockOrganization, anotherOrganization] = MockOrganizations.result
const [mockValueStream] = MockValueStreams.result
const anotherValueStreamInSameOrg = MockValueStreams.result.find(
  v =>
    v.organizationId === mockOrganization.id && v.name !== mockValueStream.name,
)
const anotherOrganizationValueStream = MockValueStreams.result.find(
  v => v.organizationId === anotherOrganization.id,
)

beforeEach(() => {
  useAPIContextMock.mockReturnValue({
    allUsers: allMockUsers.result,
    organizationList: MockOrganizations.result,
    featureFlags: { ssoEnabled: true },
  })
})

describe('Form initial state', () => {
  it('should have all fields enabled with initial value', () => {
    RenderWithWrapper(
      <UpdateValueStream
        organization={mockOrganization}
        valueStream={mockValueStream}
      />,
    )

    expect(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
    ).toBeEnabled()
    expect(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
    ).toHaveValue(mockOrganization.name)

    expect(
      screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
    ).toBeEnabled()
    expect(
      screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
    ).toHaveValue(mockValueStream.name)

    expect(
      screen.getByRole('combobox', {
        name: 'Select Your Value Stream Admins',
      }),
    ).toBeEnabled()
    mockValueStream.users.forEach(u => {
      expect(screen.getByText(u.username)).toBeInTheDocument()
    })
  })
})

describe('Form effects', () => {
  it('changing organization should reset relevant fields', async () => {
    RenderWithWrapper(
      <UpdateValueStream
        organization={mockOrganization}
        valueStream={mockValueStream}
      />,
    )

    await userEvent.type(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
      `${'{backspace}'.repeat(mockOrganization.name.length)}`,
    )

    expect(
      screen.getByRole('combobox', { name: 'Select Your Organization' }),
    ).toHaveValue('')

    expect(
      screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
    ).toHaveValue('')
  })
})

describe('Form validation', () => {
  describe('organization field', () => {
    it('setting it together with value stream name should enable submit', async () => {
      RenderWithWrapper(
        <UpdateValueStream
          organization={mockOrganization}
          valueStream={mockValueStream}
        />,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${'{backspace}'.repeat(mockOrganization.name.length)}${
          anotherOrganization.name
        }{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
        'foo bar',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('value stream name field', () => {
    it('should not allow submission if value stream name is taken within same organization', async () => {
      RenderWithWrapper(
        <UpdateValueStream
          organization={mockOrganization}
          valueStream={mockValueStream}
        />,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
        `${'{backspace}'.repeat(mockValueStream.name.length)}${
          anotherValueStreamInSameOrg.name
        }`,
      )

      expect(
        screen.getByText(`${anotherValueStreamInSameOrg.name} already exists`),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })

    it('should not allow submission if value stream name is taken within different organization', async () => {
      RenderWithWrapper(
        <UpdateValueStream
          organization={mockOrganization}
          valueStream={mockValueStream}
        />,
      )

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Your Organization' }),
        `${'{backspace}'.repeat(mockOrganization.name.length)}${
          anotherOrganization.name
        }{arrowdown}{enter}`,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
        anotherOrganizationValueStream.name,
      )

      expect(
        screen.getByText(
          `${anotherOrganizationValueStream.name} already exists`,
        ),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })

    it('should allow submission if field gets updated', async () => {
      RenderWithWrapper(
        <UpdateValueStream
          organization={mockOrganization}
          valueStream={mockValueStream}
        />,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
        'foo bar',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })
  })

  describe('value stream admins field', () => {
    it('should not allow submission if value stream admins are not filled', async () => {
      RenderWithWrapper(
        <UpdateValueStream
          organization={mockOrganization}
          valueStream={mockValueStream}
        />,
      )

      await userEvent.type(
        screen.getByRole('combobox', {
          name: 'Select Your Value Stream Admins',
        }),
        `${'{backspace}'.repeat(mockValueStream.users.length)}`,
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeDisabled()
    })

    it('should allow submission if field gets updated', async () => {
      RenderWithWrapper(
        <UpdateValueStream
          organization={mockOrganization}
          valueStream={mockValueStream}
        />,
      )

      await userEvent.type(
        screen.getByRole('combobox', {
          name: 'Select Your Value Stream Admins',
        }),
        'basic{arrowdown}{enter}',
      )

      expect(
        screen.getByRole('button', { name: 'Submit Your Form' }),
      ).toBeEnabled()
    })

    it('should be disabled if sso is not enabled', () => {
      useAPIContextMock.mockReturnValue({
        allUsers: allMockUsers.result,
        organizationList: MockOrganizations.result,
        featureFlags: { ssoEnabled: false },
      })
      RenderWithWrapper(
        <UpdateValueStream
          organization={mockOrganization}
          valueStream={mockValueStream}
        />,
      )

      expect(
        screen.getByRole('combobox', {
          name: 'Select Your Value Stream Admins',
        }),
      ).toBeDisabled()
    })
  })
})

describe('Form submission', () => {
  it('should redirect to /admin on success', async () => {
    const mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockImplementation(() => mockNavigate)
    RenderWithWrapper(
      <UpdateValueStream
        organization={mockOrganization}
        valueStream={mockValueStream}
      />,
    )

    updateValueStreamMock.mockResolvedValueOnce({
      dont: 'CareWhatTheResponseIs',
    })

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Enter Your Value Stream Name' }),
      'foo bar',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Submit Your Form' }),
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })
})
