import { Matcher, screen } from '@testing-library/react'
import { useState } from 'react'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'

import { TextField } from '@mui/material'
import { CollectorTarget } from 'api'
import CollectorTargetsAutocomplete, { BulkAddCollectorTargetsDialog } from '.'

const options: CollectorTarget[] = [
  {
    id: 1,
    name: 'foo',
    teamId: undefined,
    url: 'https://foo.com',
  },
  {
    id: 2,
    name: 'bar',
    teamId: undefined,
    url: 'https://bar.com',
  },
  {
    id: 3,
    name: 'biz',
    teamId: undefined,
    url: 'https://biz.com',
  },
  {
    id: 4,
    name: 'baz',
    teamId: undefined,
    url: 'https://baz.com',
  },
  {
    id: 5,
    name: 'D For disabled 1',
    teamId: 1,
    url: 'https://D-for-disabled-1.com',
  },
  {
    id: 6,
    name: 'D for disabled 2',
    teamId: 1,
    url: 'https://D-for-disabled-2.com',
  },
  {
    id: 7,
    name: 'Luxion',
    teamId: undefined,
    url: 'https://Luxion.com',
  },
]

const getOptionLabel = (option: CollectorTarget) =>
  `${option.name} [url : ${option.url}]`

const MockComponent = () => {
  const [selectedOptions, setSelectedOptions] = useState([])

  return (
    <CollectorTargetsAutocomplete
      id="select-options"
      disabled={false}
      options={options}
      multiple
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      filterSelectedOptions
      getOptionDisabled={option => !!option.teamId}
      getOptionLabel={getOptionLabel}
      value={selectedOptions}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_, v) => {
        setSelectedOptions(v)
      }}
      renderInput={params => (
        <TextField {...params} label="Select Options" variant="standard" />
      )}
    />
  )
}

// match that element has text if the text is broken up
// we ignore the content here because the content could
// be broken up
const textMatcher =
  (textToMatch: string): Matcher =>
  (_, element) => {
    const elementHasText = element.textContent === textToMatch
    // filtering out only the parent nodes to avoid
    // multiple match
    const childrenDontHaveText = Array.from(element.children).every(
      child => child.textContent !== textToMatch,
    )

    return elementHasText && childrenDontHaveText
  }

describe('CollectorTargetsAutocomplete', () => {
  describe('Creating dynamic filter option', () => {
    it('should not create the option, if there are only disabled options in filtered options', async () => {
      RenderWithWrapper(<MockComponent />)

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Options' }),
        'D',
      )

      // making sure only the disabled items are shown
      options
        .filter(option => option.teamId)
        .forEach(option => {
          expect(
            screen.getByText(textMatcher(getOptionLabel(option))),
          ).toBeInTheDocument()
        })
      options
        .filter(option => !option.teamId)
        .forEach(option => {
          expect(
            screen.queryByText(textMatcher(getOptionLabel(option))),
          ).not.toBeInTheDocument()
        })
      // and making sure that select all that contains is not shown
      expect(
        screen.queryByText(textMatcher('Select all that contains "D"')),
      ).not.toBeInTheDocument()
    })

    it('should not create the option, if there are no options upon filtering', async () => {
      RenderWithWrapper(<MockComponent />)

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Options' }),
        'nonexistant',
      )
      // making sure no options exists
      options.forEach(option => {
        expect(
          screen.queryByText(textMatcher(getOptionLabel(option))),
        ).not.toBeInTheDocument()
      })
      expect(
        screen.queryByText(
          textMatcher('Select all that contains "nonexistant"'),
        ),
      ).not.toBeInTheDocument()
    })

    it('should not create the option, if user has not input any value', async () => {
      RenderWithWrapper(<MockComponent />)

      await userEvent.click(
        screen.getByRole('combobox', { name: 'Select Options' }),
      )

      // making sure all options exists
      options.forEach(option => {
        expect(
          screen.getByText(textMatcher(getOptionLabel(option))),
        ).toBeInTheDocument()
      })
      // but the option to select all empty string is nonexistant
      expect(
        screen.queryByText(textMatcher('Select all that contains ""')),
      ).not.toBeInTheDocument()
    })

    it('should not create the option, if there is an exact match', async () => {
      RenderWithWrapper(<MockComponent />)
      const [fooOption] = options

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Options' }),
        'foo [[url : https://foo.com]', // double brackets because
        // brackets is a special character for user event
      )

      options
        .filter(option => getOptionLabel(option) !== getOptionLabel(fooOption))
        .forEach(option => {
          expect(
            screen.queryByText(textMatcher(getOptionLabel(option))),
          ).not.toBeInTheDocument()
        })
      expect(
        screen.getByText(textMatcher(getOptionLabel(fooOption))),
      ).toBeInTheDocument()

      expect(
        screen.queryByText(textMatcher('Select all that contains "foo"')),
      ).not.toBeInTheDocument()
    })

    it('should create the option otherwise', async () => {
      RenderWithWrapper(<MockComponent />)

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Options' }),
        'b',
      )

      expect(
        screen.getByText(textMatcher('Select all that contains "b"')),
      ).toBeInTheDocument()
    })
  })

  describe('Dialog popup', () => {
    it('should open the dialog box upon clicking "Select all that contains ..." option', async () => {
      RenderWithWrapper(<MockComponent />)

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Options' }),
        'b',
      )

      await userEvent.click(
        screen.getByText(textMatcher('Select all that contains "b"')),
      )

      // wait for the submit button to come up on the screen
      await screen.findByRole('button', {
        name: 'Submit Your Options',
      })
    })

    it('if the users hits submit on the submit button, the dialog should close and field should be populated', async () => {
      RenderWithWrapper(<MockComponent />)

      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Options' }),
        'b',
      )

      await userEvent.click(
        screen.getByText(textMatcher('Select all that contains "b"')),
      )

      // wait for the submit button to come up on the screen
      const dialogSubmitButton = await screen.findByRole('button', {
        name: 'Submit Your Options',
      })

      await userEvent.click(dialogSubmitButton)

      // make sure all the matching options that are not disabled
      // are selected.
      options
        .filter(
          option => !option.teamId && getOptionLabel(option).includes('b'),
        )
        .forEach(option => {
          expect(
            screen.getByRole('button', { name: getOptionLabel(option) }),
          ).toBeInTheDocument()
        })
    })

    it('should work with both single selection and multiple selection', async () => {
      RenderWithWrapper(<MockComponent />)

      // 1) single select an item
      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Options' }),
        'foo [[url : https://foo.com]{arrowdown}{enter}', // double brackets because
        // brackets is a special character for user event
      )

      // 2) multiple select items
      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Options' }),
        'b',
      )

      await userEvent.click(
        screen.getByText(textMatcher('Select all that contains "b"')),
      )

      // wait for the submit button to come up on the screen
      const dialogSubmitButton = await screen.findByRole('button', {
        name: 'Submit Your Options',
      })

      await userEvent.click(dialogSubmitButton)

      // 3) single select an item again to make sure nothing is broken
      await userEvent.type(
        screen.getByRole('combobox', { name: 'Select Options' }),
        'Luxion [[url : https://Luxion.com]{arrowdown}{enter}', // double brackets because
        // brackets is a special character for user event
      )

      // make sure single selected items are selected
      expect(
        screen.getByRole('button', {
          name: getOptionLabel(options.find(o => o.name === 'foo')),
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: getOptionLabel(options.find(o => o.name === 'Luxion')),
        }),
      ).toBeInTheDocument()
      // make sure multi-selected, non-disabled items are selected
      options
        .filter(
          option => !option.teamId && getOptionLabel(option).includes('b'),
        )
        .forEach(option => {
          expect(
            screen.getByRole('button', { name: getOptionLabel(option) }),
          ).toBeInTheDocument()
        })
    })
  })
})

describe('BulkAddCollectorTargetsDialog', () => {
  it('should allow users to deselect items from the list', async () => {
    RenderWithWrapper(
      <BulkAddCollectorTargetsDialog
        preSelected={options.filter(o => o.name === 'bar')}
        onAdd={jest.fn()}
        open
        onClose={jest.fn()}
      />,
    )

    expect(
      screen.getByLabelText(
        'deselect collector target bar with url https://bar.com',
      ),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByLabelText(
        'deselect collector target bar with url https://bar.com',
      ),
    )

    expect(
      screen.queryByLabelText(
        'deselect collector target bar with url https://bar.com',
      ),
    ).not.toBeInTheDocument()
    expect(
      screen.getByLabelText(
        'select collector target bar with url https://bar.com',
      ),
    ).toBeInTheDocument()
  })

  it('should not allow users to submit if none of the options are selected', async () => {
    RenderWithWrapper(
      <BulkAddCollectorTargetsDialog
        preSelected={options.filter(o => o.name === 'foo')}
        onAdd={jest.fn()}
        open
        onClose={jest.fn()}
      />,
    )
    await userEvent.click(
      screen.getByLabelText(
        'deselect collector target foo with url https://foo.com',
      ),
    )
    expect(
      screen.getByRole('button', {
        name: 'Submit Your Options',
      }),
    ).toBeDisabled()
  })
})
