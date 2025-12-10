import {
  isPosIntValidation,
  USER_INPUT_ERR_MSGS,
  getUserInputValidaton,
} from '.'

describe('Testing positive integer user input validation', () => {
  it('should not be valid if user input is not a number', () => {
    const { isValid, errorMessage } = isPosIntValidation(
      '<script>alert("XSS")<script>',
    )
    expect(isValid).toBe(false)
    expect(errorMessage).toEqual(USER_INPUT_ERR_MSGS.NOT_A_NUMBER)
  })
  it('should not be valid if user input is a floating point number', () => {
    const { isValid, errorMessage } = isPosIntValidation('2.1')
    expect(isValid).toBe(false)
    expect(errorMessage).toEqual(USER_INPUT_ERR_MSGS.NOT_AN_INTEGER)
  })
  it('should not be valid if user input execeeds the safe integer value to avoid overflow', () => {
    const { isValid, errorMessage } = isPosIntValidation('999999999999999999')
    expect(isValid).toBe(false)
    expect(errorMessage).toEqual(USER_INPUT_ERR_MSGS.EXCEEDS_NUMERIC_VALUE)
  })
  it('should not be valid if user input is negative', () => {
    const { isValid, errorMessage } = isPosIntValidation('-1')
    expect(isValid).toBe(false)
    expect(errorMessage).toEqual(USER_INPUT_ERR_MSGS.MUST_BE_POS)
  })
  it('should be valid if user input is a positive number', () => {
    const { isValid, errorMessage } = isPosIntValidation('2')
    expect(isValid).toBe(true)
    expect(errorMessage).toBe(USER_INPUT_ERR_MSGS.NO_ISSUES_MSG)
  })
})

describe('User string input validation', () => {
  it('should invlidate with invalid characters if illegal characters are in user input', () => {
    const { isValid, errorMessage } = getUserInputValidaton(
      '<script>console.log("XSS")</script>',
    )
    expect(isValid).toBe(false)
    expect(errorMessage).toEqual(USER_INPUT_ERR_MSGS.INVALID_CHARS)
  })
  it('should invlidate for inputs beyond the character limit', () => {
    const { isValid, errorMessage } = getUserInputValidaton(
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    )
    expect(isValid).toBe(false)
    expect(errorMessage).toEqual(USER_INPUT_ERR_MSGS.EXCEEDS_CHAR_LIMIT)
  })
  it('should invlidate for user input that is all white spaces', () => {
    const { isValid, errorMessage } = getUserInputValidaton(
      '                    ',
    )
    expect(isValid).toBe(false)
    expect(errorMessage).toEqual(USER_INPUT_ERR_MSGS.ALL_WHITE_SPACES)
  })
})
