import {
  Autocomplete,
  AutocompleteProps,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  createFilterOptions,
} from '@mui/material'
import { CollectorTarget } from 'api'
import StyledTooltip from 'utils/StyledTooltip'
import { useState } from 'react'
import globalConfig from 'globalConfig'
import parse from 'autosuggest-highlight/parse'
import match from 'autosuggest-highlight/match'
import { useTablePaginationState } from 'utils/hooks'

type DynamicOption = {
  isDynamicOption: boolean
  inputValue: string
  optionLabel: string
}

const { UI_SETTINGS } = globalConfig

const isDynamicOption = (option: DynamicOption | CollectorTarget) =>
  'isDynamicOption' in option

const filter = createFilterOptions<CollectorTarget | DynamicOption>()

export type CollectorTargetsAutocompleteProps = AutocompleteProps<
  CollectorTarget,
  true,
  false,
  false
>

export const BulkAddCollectorTargetsDialog = ({
  preSelected,
  onAdd,
  open,
  onClose,
}: {
  preSelected: CollectorTarget[]
  onAdd: (result: CollectorTarget[]) => void
  open: boolean
  onClose: () => void
}) => {
  const [selectedCollectorTargets, setSelectedCollectorTargets] = useState(() =>
    preSelected.map(collectorTarget => ({
      ...collectorTarget,
      isSelected: true,
    })),
  )

  const {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    onPageChange,
    onRowsPerPageChange,
  } = useTablePaginationState()

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle id="select-collector-targets">
        Please Confirm Selection
      </DialogTitle>
      <DialogContent dividers aria-labelledby="Add Collector Targets Dialog">
        <Stack spacing={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    aria-label="Column name Name"
                    sx={{ backgroundColor: theme => theme.palette.header }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    align="left"
                    aria-label="Column name Url"
                    sx={{ backgroundColor: theme => theme.palette.header }}
                  >
                    Url
                  </TableCell>
                  <TableCell
                    align="left"
                    aria-label="Column name Selected"
                    sx={{ backgroundColor: theme => theme.palette.header }}
                  >
                    Selected
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {selectedCollectorTargets
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(collectorTarget => (
                    <TableRow
                      key={`Collector Target Row ${collectorTarget.name} [url : ${collectorTarget.url}]`}
                    >
                      <TableCell
                        aria-label={`Collector Target Column Name with entry ${collectorTarget.name}`}
                      >
                        {collectorTarget.name}
                      </TableCell>
                      <TableCell
                        aria-label={`Collector Target Column Url with entry ${collectorTarget.url}`}
                      >
                        {collectorTarget.url}
                      </TableCell>
                      <TableCell
                        padding="checkbox"
                        aria-label={`Collector Target ${
                          collectorTarget.name
                        } with url ${collectorTarget.url} with entry ${
                          collectorTarget.isSelected
                            ? 'selected'
                            : 'not selected'
                        }`}
                      >
                        <Checkbox
                          onClick={() => {
                            setSelectedCollectorTargets(
                              selectedCollectorTargets.map(t =>
                                t.id !== collectorTarget.id
                                  ? t
                                  : {
                                      ...collectorTarget,
                                      isSelected: !collectorTarget.isSelected,
                                    },
                              ),
                            )
                          }}
                          checked={collectorTarget.isSelected}
                          color="success"
                          inputProps={{
                            'aria-label': 'controlled',
                          }}
                          aria-label={
                            collectorTarget.isSelected
                              ? `deselect collector target ${collectorTarget.name} with url ${collectorTarget.url}`
                              : `select collector target ${collectorTarget.name} with url ${collectorTarget.url}`
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={selectedCollectorTargets.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
          <Stack
            direction={{ sx: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              aria-label="Cancel"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              color="primary"
              type="submit"
              aria-label="Submit Your Options"
              onClick={() => {
                const userSelectedOptions = selectedCollectorTargets
                  .filter(t => t.isSelected)
                  .map(t => {
                    const { isSelected: _, ...collectorTarget } = t
                    return collectorTarget
                  })
                onAdd(userSelectedOptions)
                onClose()
              }}
              disabled={selectedCollectorTargets.every(t => !t.isSelected)}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

const CollectorTargetsAutocomplete = (
  props: CollectorTargetsAutocompleteProps,
) => {
  const [dynamicSelectedCollectorTargets, setDynamicSelectedCollectorTargets] =
    useState<CollectorTarget[]>([])

  const {
    options: allCollectorTargets,
    getOptionLabel: getCollectorTargetOptionLabel,
    getOptionDisabled: getCollectorTargetOptionDisabled,
    isOptionEqualToValue: isCollectorTargetOptionEqualToValue,
    value: selectedCollectorTargets,
    onChange: onCollectorTargetsChange,
    ...additionalProps
  } = props

  const getOptionsThatMatchDynamicOption = (dynamicOption: DynamicOption) => {
    const selectedCollectorTargetsIdTable: { [id: number]: boolean } = {}
    selectedCollectorTargets.forEach(collectorTarget => {
      selectedCollectorTargetsIdTable[collectorTarget.id] = true
    })
    return allCollectorTargets.filter(option => {
      const isAlreadySelectedOption =
        !!selectedCollectorTargetsIdTable[option.id]
      return (
        !getCollectorTargetOptionDisabled(option) &&
        !isAlreadySelectedOption &&
        getCollectorTargetOptionLabel(option).includes(dynamicOption.inputValue)
      )
    })
  }

  const getOptionLabel = (option: CollectorTarget | DynamicOption) => {
    if (isDynamicOption(option)) {
      return (option as DynamicOption).optionLabel
    }
    return getCollectorTargetOptionLabel(option as CollectorTarget)
  }

  return (
    <>
      <Autocomplete<CollectorTarget | DynamicOption, true, false, false>
        {...additionalProps}
        options={allCollectorTargets}
        getOptionDisabled={option => {
          if (isDynamicOption(option)) {
            return false
          }
          return getCollectorTargetOptionDisabled(option as CollectorTarget)
        }}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, other) =>
          !isDynamicOption(option) &&
          !isDynamicOption(other) &&
          isCollectorTargetOptionEqualToValue(
            option as CollectorTarget,
            other as CollectorTarget,
          )
        }
        value={selectedCollectorTargets}
        onChange={(_, newValuesFromOption, __) => {
          const dynamicOption = newValuesFromOption.find(isDynamicOption)
          const newValuesHasDynamicOption = !!dynamicOption
          if (newValuesHasDynamicOption) {
            setDynamicSelectedCollectorTargets(
              getOptionsThatMatchDynamicOption(dynamicOption as DynamicOption),
            )
          } else {
            onCollectorTargetsChange(
              _,
              newValuesFromOption as CollectorTarget[],
              __,
            )
          }
        }}
        filterOptions={(allOptions, params) => {
          const filtered = filter(allOptions, params)
          const { inputValue } = params
          const hasMatchesForDynamicOption = allOptions.some(
            option =>
              !isDynamicOption(option) &&
              getCollectorTargetOptionLabel(option as CollectorTarget) !==
                inputValue &&
              !getCollectorTargetOptionDisabled(option as CollectorTarget) &&
              getCollectorTargetOptionLabel(option as CollectorTarget).includes(
                inputValue,
              ),
          )
          if (
            inputValue !== '' &&
            filtered.length !== 0 &&
            hasMatchesForDynamicOption
          ) {
            const dynamicOption = {
              optionLabel: `Select all that contains "${inputValue}"`,
              inputValue,
              isDynamicOption: true,
            }
            return [dynamicOption, ...filtered]
          }
          return filtered
        }}
        renderTags={(tags, getTagProps) =>
          tags.map((option, index) => {
            const { key: _, ...tagProps } = getTagProps({ index })
            const tagContent = `${(option as CollectorTarget).name} [url : ${
              (option as CollectorTarget).url
            }]`
            return (
              <StyledTooltip
                title={tagContent}
                placement="top"
                enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
                key={tagContent}
              >
                <Chip
                  label={
                    <Box
                      sx={{
                        maxWidth: '100px',
                        minWidth: '3%',
                        whiteSpace: 'noWrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {tagContent}
                    </Box>
                  }
                  {...tagProps}
                />
              </StyledTooltip>
            )
          })
        }
        renderOption={(renderOptionProps, option, state) => {
          const formattedOption = getOptionLabel(option)
          const matches: { text: string; highlight: boolean }[] = match(
            formattedOption,
            state.inputValue,
          )
          const parts: { text: string; highlight: boolean }[] = parse(
            formattedOption,
            matches,
          )
          const optionKey = isDynamicOption(option)
            ? (option as DynamicOption).optionLabel
            : `${(option as CollectorTarget).id}`

          return (
            <li {...renderOptionProps} key={optionKey}>
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
        }}
      />
      {dynamicSelectedCollectorTargets.length > 0 && (
        <BulkAddCollectorTargetsDialog
          preSelected={dynamicSelectedCollectorTargets}
          onAdd={finalSelection => {
            onCollectorTargetsChange(
              null,
              [...selectedCollectorTargets, ...finalSelection],
              'selectOption',
            )
          }}
          open={dynamicSelectedCollectorTargets.length > 0}
          onClose={() => setDynamicSelectedCollectorTargets([])}
        />
      )}
    </>
  )
}

export default CollectorTargetsAutocomplete
