import { screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { updateTeamMembers } from 'api'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import UploadTeamMembersFile from './UploadTeamMembersFile'

jest.mock('loglevel')

jest.mock('./helpContent.md', () => 'help content')

jest.mock('globalConfig', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('globalConfig').default,
    UI_SETTINGS: {
      ...jest.requireActual('globalConfig').default.UI_SETTINGS,
      ERROR_HIDE_DURATION: 700,
      SUCCESS_HIDE_DURATION: 700,
    },
  },
}))

const MockFiles = jest.fn()

jest.mock('utils/DropzoneForm', () => ({
  __esModule: true,
  default: ({
    onFilesSubmit,
    DropzoneHelpMessage,
  }: {
    onFilesSubmit: (files: File[]) => void
    DropzoneHelpMessage: React.ComponentType
  }) => (
    <>
      <DropzoneHelpMessage />
      <button
        type="button"
        aria-label="Submit Files"
        onClick={() => {
          onFilesSubmit(MockFiles())
        }}
      />
    </>
  ),
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  updateTeamMembers: jest.fn(),
}))

const updateTeamMembersMock = updateTeamMembers as jest.Mock

const createMockFile = (fileContents: string) =>
  new File([fileContents], 'foo.bar.json', {
    type: 'application/json',
  })

describe('UploadTeamMembersFile', () => {
  beforeEach(() => {
    updateTeamMembersMock.mockResolvedValue({})

    MockFiles.mockReturnValue([
      createMockFile(
        JSON.stringify({
          foo: {
            username: 'foo',
            name: 'foo',
            start_date: '2014-12-13',
            end_date: '',
          },
          bar: {
            username: 'foo',
            name: 'foo',
            start_date: '2014-12-13',
            end_date: '2014-12-15',
          },
        }),
      ),
    ])
  })

  it('should show an error alert if uploading file fails due to file content validation', async () => {
    MockFiles.mockReturnValue([
      createMockFile(
        JSON.stringify({
          foo: 'bar',
        }),
      ),
    ])

    RenderWithWrapper(<UploadTeamMembersFile teamId={1} />)

    await userEvent.click(screen.getByLabelText('Upload Team Members File'))

    await userEvent.click(screen.getByLabelText('Submit Files'))

    const errorAlert = await screen.findByLabelText('Error Alert')

    expect(errorAlert).toHaveTextContent(
      'Json file format error: json does not match expected schema.',
    )
  })

  it('should show an error alert if uploading file fails due to api', async () => {
    updateTeamMembersMock.mockRejectedValue(new Error('oops.'))

    RenderWithWrapper(<UploadTeamMembersFile teamId={1} />)

    await userEvent.click(screen.getByLabelText('Upload Team Members File'))

    await userEvent.click(screen.getByLabelText('Submit Files'))

    const errorAlert = await screen.findByLabelText('Error Alert')

    expect(errorAlert).toHaveTextContent('Error submitting.')
    expect(updateTeamMembersMock).toHaveBeenCalledTimes(1)
    await waitForElementToBeRemoved(errorAlert)
  })

  it('should show a success alert if uploading results in a success', async () => {
    RenderWithWrapper(<UploadTeamMembersFile teamId={1} />)

    await userEvent.click(screen.getByLabelText('Upload Team Members File'))

    await userEvent.click(screen.getByLabelText('Submit Files'))

    const successAlert = await screen.findByLabelText('Success Alert')

    expect(successAlert).toHaveTextContent(
      'Successfully uploaded team members!',
    )

    await waitForElementToBeRemoved(successAlert)
  })
})
