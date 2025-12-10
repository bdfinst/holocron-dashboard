import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import Help, { parseMarkdown } from '.'

describe('parseMarkdown', () => {
  it('should convert the first H1 to the title', () => {
    const md = `
    # Test 1
    # Test 2`

    const result = parseMarkdown(md)

    expect(result.title).toEqual('Test 1')
  })
  it('should return the body without the title text included', () => {
    const md = `
    # Test 1
    # Test 2`

    const result = parseMarkdown(md)

    expect(result.body).toContain('# Test 2')
    expect(result.body).not.toContain('# Test 1')
  })
  it('should return an empty title if no H1 element found', () => {
    const md = `Test 2`

    const result = parseMarkdown(md)

    expect(result.title).toEqual('')
  })
  it('should return an empty title if no markdown is passed', () => {
    const result = parseMarkdown()

    expect(result.title).toEqual('')
  })
})

describe('Help popup', () => {
  it('Should open Help modal when help button is clicked', async () => {
    RenderWithWrapper(<Help helpContent="Tips to improve" />)

    const helpButton = screen.getByLabelText(/help/i)

    await userEvent.click(helpButton)

    expect(screen.getByRole('dialog')).toBeVisible()
  })

  it('Should close Help modal when close button is clicked', async () => {
    // open modal
    RenderWithWrapper(<Help helpContent="Tips to improve" />)

    const helpButton = screen.getByLabelText(/help/i)

    await userEvent.click(helpButton)

    expect(screen.getByRole('dialog')).toBeVisible()

    await userEvent.click(screen.getByLabelText(/close/i))

    expect(screen.getByRole('dialog')).not.toBeVisible()
  })
})
