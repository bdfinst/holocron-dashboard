import globalConfig from 'globalConfig'
import { FILE_PARSING_ERROR_MESSAGES, getPayRatesFromFile } from './utils'

const { METRICS_SETTINGS } = globalConfig
const { FTE_RATE_UNIT } = METRICS_SETTINGS

const createMockFile = (csvString: string) =>
  new File([csvString], 'foo.bar.csv', {
    type: 'text/csv',
  })

describe('getPayRatesFromFile', () => {
  describe('rejected file inputs', () => {
    it('should throw error on invalid csv', async () => {
      await expect(
        getPayRatesFromFile(createMockFile('email,rate\nfoo,bar,22,')),
      ).rejects.toThrowError(FILE_PARSING_ERROR_MESSAGES.INVALID_CSV)
    })

    it('should throw error on csv headers that are invalid', async () => {
      await expect(
        getPayRatesFromFile(createMockFile('foo,bar\nsomeone@domain.com,22')),
      ).rejects.toThrowError(FILE_PARSING_ERROR_MESSAGES.INVALID_CSV)
    })

    it('should throw failed to parse error if there are no rows in csv', async () => {
      await expect(
        getPayRatesFromFile(createMockFile(`email,rate\n`)),
      ).rejects.toThrowError(FILE_PARSING_ERROR_MESSAGES.INVALID_CSV)
    })

    it('should throw failed to parse error if the csv rate is invalid', async () => {
      await expect(
        getPayRatesFromFile(
          createMockFile(
            'email,rate\nsomeone@domain.com,<script>alert("xss")</script>',
          ),
        ),
      ).rejects.toThrowError(FILE_PARSING_ERROR_MESSAGES.INVALID_CSV)
    })

    it('should throw failed to parse error if a column rate  is not greater than 0', async () => {
      await expect(
        getPayRatesFromFile(
          createMockFile(
            'email,rate\nsomeone@domain.com,1\nsomeone@domian2.com,-2',
          ),
        ),
      ).rejects.toThrowError(FILE_PARSING_ERROR_MESSAGES.INVALID_CSV)
    })
  })

  describe('accepted file inputs', () => {
    it('should accept files with currency in rate column', async () => {
      await expect(
        getPayRatesFromFile(
          createMockFile(
            `email,rate\nsomeone@domain.com,42\nsomeone@domain2.com,${FTE_RATE_UNIT}52`,
          ),
        ),
      ).resolves.toEqual([
        { email: 'someone@domain.com', rate: 42 },
        { email: 'someone@domain2.com', rate: 52 },
      ])
    })

    it('should accept files without currency in rate column', async () => {
      await expect(
        getPayRatesFromFile(
          createMockFile(
            `email,rate\nsomeone@domain.com,42\nsomeone@domain2.com,52`,
          ),
        ),
      ).resolves.toEqual([
        { email: 'someone@domain.com', rate: 42 },
        { email: 'someone@domain2.com', rate: 52 },
      ])
    })

    it('should accept rate columns that are decimals', async () => {
      await expect(
        getPayRatesFromFile(
          createMockFile(
            `email,rate\nsomeone@domain.com,42\nsomeone@domain2.com,52.55`,
          ),
        ),
      ).resolves.toEqual([
        { email: 'someone@domain.com', rate: 42 },
        { email: 'someone@domain2.com', rate: 52.55 },
      ])
    })
  })
})
