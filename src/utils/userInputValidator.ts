import globalConfig from 'globalConfig'

const { SECURITY_SETTINGS } = globalConfig
const { MAX_USER_INPUT_CHAR_LIMIT } = SECURITY_SETTINGS

type ValidationFunction = (input: string) => {
  isValid: boolean
  errorMessage: string
}

/**
 * test to make sure input matches only letters, numbers, dashes, underscores and white spaces
 */
const hasValidCharacters = (inputValue: string): boolean =>
  /^[A-Za-z0-9_-\s]*$/.test(inputValue)

const isAllWhiteSpaces = (inputValue: string): boolean =>
  !inputValue.replace(/\s/g, '').length

const exceedsMaxCharLimit = (inputValue: string): boolean =>
  inputValue.length > MAX_USER_INPUT_CHAR_LIMIT

export const ERR_MSGS = {
  INVALID_CHARS:
    'Input must only include letters, numbers, underscores and dashes!',
  ALL_WHITE_SPACES: 'Input must not consist of only white spaces!',
  EXCEEDS_CHAR_LIMIT: `Input must not be greater than ${MAX_USER_INPUT_CHAR_LIMIT} characters long!`,
  EXCEEDS_NUMERIC_VALUE: 'Input must be representable as IEEE-754 max number!',
  NOT_A_NUMBER: 'Input must be a number!',
  MUST_BE_POS: 'Input must be a positive number!',
  NOT_AN_INTEGER: 'Input must be an integer!',
  NO_ISSUES_MSG: '',
}

const isIntValidation: ValidationFunction = userInput => {
  const userInputAsNumber = Number(userInput)
  switch (true) {
    case Number.isNaN(userInputAsNumber):
      return { isValid: false, errorMessage: ERR_MSGS.NOT_A_NUMBER }
    case !Number.isInteger(userInputAsNumber):
      return { isValid: false, errorMessage: ERR_MSGS.NOT_AN_INTEGER }
    case !Number.isSafeInteger(userInputAsNumber):
      return { isValid: false, errorMessage: ERR_MSGS.EXCEEDS_NUMERIC_VALUE }
    default:
      return { isValid: true, errorMessage: ERR_MSGS.NO_ISSUES_MSG }
  }
}

export const isPosIntValidation: ValidationFunction = userInput => {
  const validation = isIntValidation(userInput)
  return validation.isValid && Number(userInput) <= 0
    ? {
        isValid: false,
        errorMessage: ERR_MSGS.MUST_BE_POS,
      }
    : validation
}

export const withBasicStrValidation =
  (
    hasValidCharsFunction: (input: string) => boolean,
    errMsg: string,
  ): ValidationFunction =>
  (userInput: string): { isValid: boolean; errorMessage: string } => {
    switch (true) {
      case !hasValidCharsFunction(userInput):
        return { isValid: false, errorMessage: errMsg }
      case isAllWhiteSpaces(userInput):
        return { isValid: false, errorMessage: ERR_MSGS.ALL_WHITE_SPACES }
      case exceedsMaxCharLimit(userInput):
        return { isValid: false, errorMessage: ERR_MSGS.EXCEEDS_CHAR_LIMIT }
      default:
        return { isValid: true, errorMessage: ERR_MSGS.NO_ISSUES_MSG }
    }
  }

/**
 * Checks if user input for string is all white spaces,
 * exceeds max character limit,
 * or does not have valid characters for whitelisted.
 */
export const getUserInputValidaton = withBasicStrValidation(
  hasValidCharacters,
  ERR_MSGS.INVALID_CHARS,
)
