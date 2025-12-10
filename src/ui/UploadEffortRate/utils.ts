import { PayRate } from 'api'
import globalConfig from 'globalConfig'
import Papa, { ParseResult } from 'papaparse'

const { METRICS_SETTINGS } = globalConfig
const { FTE_RATE_UNIT } = METRICS_SETTINGS

export const FILE_PARSING_ERROR_MESSAGES = {
  INVALID_CSV:
    'please upload the format mentioned in the drop zone description.',
}

type CSVPayRateRow = {
  email: string
  rate: string
}

const readCSVFile = async (file: File): Promise<ParseResult<CSVPayRateRow>> =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      delimiter: ',',
      newline: '\n',
      skipEmptyLines: true,
      header: true,
      complete: (result: ParseResult<CSVPayRateRow>) => {
        resolve(result)
      },
      error: reject,
    })
  })

const hasValidRate = ({ rate }: CSVPayRateRow) => {
  const rateIsCurrency = rate.startsWith(FTE_RATE_UNIT)
  if (rateIsCurrency) {
    const [, amount] = rate.split(FTE_RATE_UNIT)
    return !Number.isNaN(amount) && Number(amount) > 0
  }
  return !Number.isNaN(rate) && Number(rate) > 0
}

const rateToNumericAmount = (rate: string) => {
  const rateIsCurrency = rate.startsWith(FTE_RATE_UNIT)
  if (rateIsCurrency) {
    const [, amount] = rate.split(FTE_RATE_UNIT)
    return Number(Number(amount).toFixed(2))
  }
  return Number(Number(rate).toFixed(2))
}

export const getPayRatesFromFile = async (file: File): Promise<PayRate[]> => {
  try {
    const {
      data: csvRows,
      meta,
      errors: csvParsingErrors,
    } = await readCSVFile(file)
    const expectedCSVHeaders = { email: true, rate: true }
    const csvHeadersAreValid =
      !meta.aborted &&
      meta.fields &&
      meta.fields.length === Object.keys(expectedCSVHeaders).length &&
      meta.fields.every(field => field in expectedCSVHeaders)

    if (!csvHeadersAreValid || csvParsingErrors.length > 0) {
      throw new Error(FILE_PARSING_ERROR_MESSAGES.INVALID_CSV)
    }

    const dataIsValid = csvRows.length > 0 && csvRows.every(hasValidRate)

    if (!dataIsValid) {
      throw new Error(FILE_PARSING_ERROR_MESSAGES.INVALID_CSV)
    }

    return csvRows.map(row => ({
      email: row.email,
      rate: rateToNumericAmount(row.rate),
    }))
  } catch (error) {
    // needed to just show a generic error message to the user.
    // and not expose the error.
    throw new Error(FILE_PARSING_ERROR_MESSAGES.INVALID_CSV)
  }
}
