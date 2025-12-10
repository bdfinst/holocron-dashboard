import globalConfig from 'globalConfig'
import { updatePayRates } from 'api'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { screen, waitForElementToBeRemoved } from '@testing-library/react'
import UploadEffortRate from '.'

jest.mock('loglevel')

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
  updatePayRates: jest.fn(),
}))

const updatePayRatesMock = updatePayRates as jest.Mock

const { METRICS_SETTINGS } = globalConfig
const { FTE_RATE_UNIT } = METRICS_SETTINGS

const createMockFile = (csvString: string) =>
  new File([csvString], 'foo.bar.csv', {
    type: 'text/csv',
  })

describe('UploadEffortRate', () => {
  beforeEach(() => {
    updatePayRatesMock.mockResolvedValue({})

    MockFiles.mockReturnValue([
      createMockFile(
        `email,rate\nsomeone@domain.com,42\nsomeone@domain2.com,${FTE_RATE_UNIT}52`,
      ),
    ])
  })

  it('should show an error alert if uploading file fails due to file content validation', async () => {
    MockFiles.mockReturnValue([
      createMockFile(
        'email,rate\nsomeone@domain.com,<script>alert("xss")</script>',
      ),
    ])

    RenderWithWrapper(<UploadEffortRate />)

    await userEvent.click(screen.getByLabelText('Upload FTE Rates'))

    await userEvent.click(screen.getByLabelText('Submit Files'))

    const errorAlert = await screen.findByLabelText('Error Alert')

    expect(errorAlert).toHaveTextContent(
      'Failed to parse csv: please upload the format mentioned in the drop zone description.',
    )
  })

  it('should show an error alert if uploading file fails due to api', async () => {
    updatePayRatesMock.mockRejectedValue(new Error('oops.'))

    RenderWithWrapper(<UploadEffortRate />)

    await userEvent.click(screen.getByLabelText('Upload FTE Rates'))

    await userEvent.click(screen.getByLabelText('Submit Files'))

    const errorAlert = await screen.findByLabelText('Error Alert')

    expect(errorAlert).toHaveTextContent('Error submitting.')
    expect(updatePayRatesMock).toHaveBeenCalledTimes(1)
    await waitForElementToBeRemoved(errorAlert)
  })

  it('should a success snackbar if files were upload passes', async () => {
    RenderWithWrapper(<UploadEffortRate />)

    await userEvent.click(screen.getByLabelText('Upload FTE Rates'))

    await userEvent.click(screen.getByLabelText('Submit Files'))

    const successAlert = await screen.findByLabelText('Success Alert')

    expect(successAlert).toHaveTextContent('Successfully uploaded rates!')
    await waitForElementToBeRemoved(successAlert)
  })
})
