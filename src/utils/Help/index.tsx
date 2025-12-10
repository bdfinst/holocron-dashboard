import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  IconProps,
  Stack,
} from '@mui/material'
import { CloseIcon, HelpIcon } from 'utils/icons'
import { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import ReactMarkdown from 'react-markdown'
import StyledTooltip from 'utils/StyledTooltip'
import config from 'globalConfig'
import remarkGFM from 'remark-gfm'
import { useToggle } from 'utils/hooks'

const initHelp = {
  body: '',
  title: '',
}

export type HelpProps = {
  helpContent: string
  fontSize?: IconProps['fontSize']
}

const MarkdownLink = ({
  href,
  rel = 'noopener noreferrer',
  target = '_blank',
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const theme = useTheme()

  return (
    <a
      style={{ color: theme.palette.link }}
      href={href}
      rel={rel}
      target={target}
      {...rest}
    >
      {children}
    </a>
  )
}

export const parseMarkdown = (markdown = ' ') => {
  const MARKDOWN_TITLE_CODE = '#'
  const titleCodeFirstIdx = markdown.indexOf(MARKDOWN_TITLE_CODE)
  const titleCodeFirstIdxWasFound = titleCodeFirstIdx !== -1
  const titleNewLineIdx = titleCodeFirstIdxWasFound
    ? markdown.indexOf('\n', titleCodeFirstIdx)
    : -1
  const indexesAreValid = titleCodeFirstIdxWasFound && titleNewLineIdx !== -1

  return {
    title: indexesAreValid
      ? markdown
          .slice(titleCodeFirstIdx + 1, titleNewLineIdx)
          .trimStart()
          .trimEnd()
      : '',
    body: indexesAreValid ? markdown.slice(titleNewLineIdx + 1) : '',
  }
}

const Help = ({ helpContent, fontSize = 'medium' }: HelpProps) => {
  const [isModalOpen, open, close] = useToggle()
  const [helpData, setHelpData] = useState(initHelp)

  useEffect(() => {
    setHelpData(parseMarkdown(helpContent))
  }, [helpContent])

  return (
    <>
      <StyledTooltip
        title="Information and improvement tips"
        placement="top"
        enterDelay={config.UI_SETTINGS.TOOL_TIP_DELAY}
      >
        <IconButton aria-label="help" onClick={open} size="large">
          <HelpIcon fontSize={fontSize} />
        </IconButton>
      </StyledTooltip>
      <Dialog
        onClose={close}
        aria-labelledby="help-dialog-title"
        open={isModalOpen}
        id="help-dialog-title"
      >
        <DialogTitle variant="h4" sx={{ p: theme => theme.spacing(2) }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {helpData.title && <>{helpData.title}</>}
            <IconButton
              aria-label="close"
              onClick={close}
              size="large"
              sx={{ color: theme => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: theme => theme.spacing(2) }}>
          <div>
            <ReactMarkdown
              remarkPlugins={[remarkGFM]}
              components={{
                a: MarkdownLink,
              }}
            >
              {helpData.body}
            </ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Help
