import { Typography } from '@mui/material'
import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DropzoneForm from '.'

jest.mock('globalConfig', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('globalConfig').default,
    UI_SETTINGS: {
      ...jest.requireActual('globalConfig').default.UI_SETTINGS,
      ERROR_HIDE_DURATION: 700,
      SUCCESS_HIDE_DURATION: 700,
    },
    SECURITY_SETTINGS: {
      MAX_FILE_SIZE_UPLOAD: 20,
    },
  },
}))

describe('DropzoneForm', () => {
  const onFilesSubmit = jest.fn()

  const renderComponent = () => {
    render(
      <DropzoneForm
        maxFilesUserCanUpload={2}
        onFilesSubmit={onFilesSubmit}
        isSubmitting={false}
        DropzoneHelpMessage={() => (
          <Typography aria-label="drag-and-drop-here">
            Drag and Drop here.
          </Typography>
        )}
        inputElementFileTypeAccept=""
        inputElementId="dropzone-input"
        inputElementFileTypeAcceptExtensions={['.json']}
      />,
    )
  }

  afterEach(() => {
    onFilesSubmit.mockReset()
  })

  describe('input validation', () => {
    it('should not allow invalid file extension type to be uploaded', async () => {
      renderComponent()
      const files = [
        new File(['fizz,buzz'], 'fizz.buzz.csv', {
          type: '.csv',
        }),
      ]

      await userEvent.upload(
        screen.getByLabelText('Upload File Input Box'),
        files,
        {},
      )

      const errorAlert = await screen.findByRole('alert')

      expect(errorAlert).toHaveTextContent(
        /Some files do not have a valid extension/i,
      )
    })

    it('should not allow more than MAX_FILES amount of files to be uploaded', async () => {
      renderComponent()
      const files = [
        new File([JSON.stringify({ foo: 'bar' })], 'foo.bar.json', {
          type: 'application/json',
        }),
        new File([JSON.stringify({ biz: 'baz' })], 'biz.baz.json', {
          type: 'application/json',
        }),
        new File([JSON.stringify({ fizz: 'buzz' })], 'fizz.buzz.json', {
          type: 'application/json',
        }),
      ]

      await userEvent.upload(
        screen.getByLabelText('Upload File Input Box'),
        files,
      )

      const errorAlert = await screen.findByRole('alert')

      expect(errorAlert).toHaveTextContent(/More than [0-9] uploaded/i)
    })

    it('should not allow files that exceed MAX_SIZE_LIMIT from config to be uploaded', async () => {
      renderComponent()
      const files = [
        new File(
          [JSON.stringify({ foo: 'bar', biz: 'baz', fizz: 'buzz' })],
          'foo.bar.json',
          {
            type: 'application/json',
          },
        ),
      ]

      await userEvent.upload(
        screen.getByLabelText('Upload File Input Box'),
        files,
      )

      const errorAlert = await screen.findByRole('alert')

      expect(errorAlert).toHaveTextContent(/File cannot be more than 20 bytes/i)
    })

    it('should ignore duplicate file uploads', async () => {
      renderComponent()
      const files = [
        new File([JSON.stringify({ foo: 'bar' })], 'foo.bar.json', {
          type: 'application/json',
        }),
      ]

      await userEvent.upload(
        screen.getByLabelText('Upload File Input Box'),
        files,
      )

      await userEvent.upload(
        screen.getByLabelText('Upload File Input Box'),
        files,
      )

      expect(screen.getByLabelText('Remove foo.bar.json')).toBeInTheDocument()
    })
  })

  describe('UX file upload', () => {
    it('should also allow users to drag and drop file', () => {
      renderComponent()
      fireEvent.dragOver(screen.getByLabelText('Drag and Drop File Area'))
      fireEvent.drop(screen.getByLabelText('Drag and Drop File Area'), {
        dataTransfer: {
          files: [
            new File([JSON.stringify({ foo: 'bar' })], 'foo.bar.json', {
              type: 'application/json',
            }),
          ],
        },
      })

      expect(screen.getByLabelText('Remove foo.bar.json')).toBeInTheDocument()
    })

    it('should allow users to add more files', async () => {
      renderComponent()
      await userEvent.upload(screen.getByLabelText('Upload File Input Box'), [
        new File([JSON.stringify({ foo: 'bar' })], 'foo.bar.json', {
          type: 'application/json',
        }),
      ])

      expect(screen.getByLabelText('Remove foo.bar.json')).toBeInTheDocument()

      await userEvent.upload(screen.getByLabelText('Upload File Input Box'), [
        new File([JSON.stringify({ bizz: 'baz' })], 'bizz.baz.json', {
          type: 'application/json',
        }),
      ])

      expect(screen.getByLabelText('Remove foo.bar.json')).toBeInTheDocument()
      expect(screen.getByLabelText('Remove bizz.baz.json')).toBeInTheDocument()
    })

    it('should allow users to remove files that have been dropped', async () => {
      renderComponent()
      const files = [
        new File([JSON.stringify({ foo: 'bar' })], 'foo.bar.json', {
          type: 'application/json',
        }),
      ]

      await userEvent.upload(
        screen.getByLabelText('Upload File Input Box'),
        files,
      )

      expect(screen.getByLabelText('Remove foo.bar.json')).toBeInTheDocument()

      await userEvent.click(screen.getByLabelText('Remove foo.bar.json'))

      expect(
        screen.queryByLabelText('Remove foo.bar.json'),
      ).not.toBeInTheDocument()
    })

    it('should close the error after displaying it for a brief moment', async () => {
      renderComponent()
      const files = [
        new File(
          [JSON.stringify({ foo: 'bar', biz: 'baz', fizz: 'buzz' })],
          'foo.bar.json',
          {
            type: 'application/json',
          },
        ),
      ]

      await userEvent.upload(
        screen.getByLabelText('Upload File Input Box'),
        files,
      )

      const errorAlert = await screen.findByRole('alert')

      expect(errorAlert).toHaveTextContent(/File cannot be more than 20 bytes/i)

      await waitForElementToBeRemoved(screen.queryByRole('alert'))
    })
  })

  describe('confirming submission', () => {
    it('should send the user back to the upload screen when they hit no on submission, and reset their files', async () => {
      renderComponent()
      const files = [
        new File([JSON.stringify({ foo: 'bar' })], 'foo.bar.json', {
          type: 'application/json',
        }),
      ]

      await userEvent.upload(
        screen.getByLabelText('Upload File Input Box'),
        files,
      )

      await userEvent.click(screen.getByLabelText('Go To Next Steps'))

      await userEvent.click(screen.getByLabelText('No Do Not Submit'))

      expect(
        screen.queryByLabelText('Remove foo.bar.json'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText('No Do Not Submit'),
      ).not.toBeInTheDocument()
      expect(screen.getByLabelText('Upload File Input Box')).toBeInTheDocument()
    })

    it('should call onFilesSubmit if user decides to submit files', async () => {
      renderComponent()
      const files = [
        new File([JSON.stringify({ foo: 'bar' })], 'foo.bar.json', {
          type: 'application/json',
        }),
      ]

      await userEvent.upload(
        screen.getByLabelText('Upload File Input Box'),
        files,
      )

      await userEvent.click(screen.getByLabelText('Go To Next Steps'))

      await userEvent.click(screen.getByLabelText('Yes Submit Files'))

      expect(onFilesSubmit).toHaveBeenCalledTimes(1)
      expect(onFilesSubmit).toHaveBeenCalledWith(files)
    })
  })
})
