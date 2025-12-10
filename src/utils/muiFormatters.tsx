import parse from 'autosuggest-highlight/parse'
import match from 'autosuggest-highlight/match'
import { HTMLAttributes, ReactNode } from 'react'
import { AutocompleteRenderOptionState } from '@mui/material'

type DatabaseItemBase = { id: number }
type Match = { text: string; highlight: boolean }

const renderHighlightedOptions =
  <AutocompleteOption extends DatabaseItemBase>(
    optionFormatter: (option: AutocompleteOption) => string,
    getOptionKey = (option: AutocompleteOption) => `${option.id}`,
  ) =>
  (
    props: HTMLAttributes<HTMLLIElement>,
    option: AutocompleteOption,
    state: AutocompleteRenderOptionState,
  ): ReactNode => {
    const formattedOption = optionFormatter(option)
    const matches: Match[] = match(formattedOption, state.inputValue)
    const parts: Match[] = parse(formattedOption, matches)

    return (
      <li {...props} key={getOptionKey(option)}>
        <div>
          {parts.map((part, index) => (
            <span
              // Doing this because this was on MUI docs for autocomplete
              // and believe this should not pose a problem because
              // we are highlighting only the characters based on the index
              // eslint-disable-next-line react/no-array-index-key
              key={`highlighted-part-${part.text}-${index}`}
              style={{
                fontWeight: part.highlight ? 700 : 400,
              }}
            >
              {part.text}
            </span>
          ))}
        </div>
      </li>
    )
  }

export default renderHighlightedOptions
