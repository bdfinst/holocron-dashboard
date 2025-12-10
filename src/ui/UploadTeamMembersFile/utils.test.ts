import { getMembersFromFile, FileParsingErrorMessages } from './utils'

const createMockFile = (fileContents: string) =>
  new File([fileContents], 'foo.bar.json', {
    type: 'application/json',
  })

describe('utils', () => {
  describe('getMembersFromFile', () => {
    it('should throw error if JSON could not be parsed', async () => {
      await expect(
        getMembersFromFile(createMockFile('{error: "not parsable string')),
      ).rejects.toThrowError(FileParsingErrorMessages.INVALID_JSON)
    })

    it('should throw error for non object type file contents', async () => {
      await expect(
        getMembersFromFile(createMockFile('9')),
      ).rejects.toThrowError(FileParsingErrorMessages.INVALID_SCHEMA)
    })

    it('should throw error for an empty JSON', async () => {
      await expect(
        getMembersFromFile(createMockFile(JSON.stringify({}))),
      ).rejects.toThrowError(FileParsingErrorMessages.INVALID_SCHEMA)
    })

    it('should throw error if JSON does not match schema', async () => {
      await expect(
        getMembersFromFile(createMockFile(JSON.stringify({ foo: 'bar' }))),
      ).rejects.toThrowError(FileParsingErrorMessages.INVALID_SCHEMA)
    })

    it('should throw error if date end date is not valid', async () => {
      await expect(
        getMembersFromFile(
          createMockFile(
            JSON.stringify({
              foo: {
                username: 'foo',
                name: 'foo',
                start_date: '2014-12-13',
                end_date: '',
              },
              bar: {
                username: 'bar',
                name: 'bar',
                start_date: '2014-12-13',
                end_date: 'invalid',
              },
            }),
          ),
        ),
      ).rejects.toThrowError(FileParsingErrorMessages.INVALID_SCHEMA)
    })

    it('should throw error if date start date is not valid', async () => {
      await expect(
        getMembersFromFile(
          createMockFile(
            JSON.stringify({
              foo: {
                username: 'foo',
                name: 'foo',
                start_date: '2014-12-13',
                end_date: '',
              },
              bar: {
                username: 'bar',
                name: 'bar',
                start_date: 'invalid',
                end_date: '',
              },
            }),
          ),
        ),
      ).rejects.toThrowError(FileParsingErrorMessages.INVALID_SCHEMA)
    })

    it('should throw an error if the member content is missing data', async () => {
      await expect(
        getMembersFromFile(
          createMockFile(
            JSON.stringify({
              foo: {
                username: 'foo',
                name: 'foo',
                start_date: '2014-12-13',
              },
            }),
          ),
        ),
      ).rejects.toThrowError(FileParsingErrorMessages.INVALID_SCHEMA)
      await expect(
        getMembersFromFile(
          createMockFile(
            JSON.stringify({
              foo: {
                username: 'foo',
                name: 'foo',
                end_date: '',
              },
            }),
          ),
        ),
      ).rejects.toThrowError(FileParsingErrorMessages.INVALID_SCHEMA)
    })

    it('should throw an error if the member content has extra fields', async () => {
      await expect(
        getMembersFromFile(
          createMockFile(
            JSON.stringify({
              foo: {
                username: 'foo',
                name: 'foo',
                start_date: '2014-12-13',
                end_date: '',
                bar: 5,
              },
            }),
          ),
        ),
      ).rejects.toThrowError(FileParsingErrorMessages.INVALID_SCHEMA)
    })

    it('should return with data and no error otherwise', async () => {
      const teamMembersData = {
        foo: {
          username: 'foo',
          name: 'foo',
          start_date: '2014-12-13',
          end_date: '',
        },
        bar: {
          username: 'bar',
          name: 'bar',
          start_date: '2014-12-13',
          end_date: '2014-12-11',
        },
        biz: {
          username: 'biz',
          name: 'biz',
          start_date: '2014-12-15',
          end_date: '',
        },
        baz: {
          username: 'baz',
          name: 'baz',
          start_date: '2014-12-16',
          end_date: '',
        },
      }
      await expect(
        getMembersFromFile(createMockFile(JSON.stringify(teamMembersData))),
      ).resolves.toEqual(Object.values(teamMembersData))
    })
  })
})
