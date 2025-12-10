type MemberFormatFromFile = {
  username: string
  name: string
  start_date: string
  end_date: string
}

const MemberFormatFromFileSchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    name: { type: 'string' },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
  },
}

export enum FileParsingErrorMessages {
  INVALID_JSON = 'invalid json',
  INVALID_SCHEMA = 'json does not match expected schema.',
}

const isMemberStartDateValid = (dateString: string): boolean => {
  const millisecondsSinceStart = Date.parse(dateString)
  return !Number.isNaN(millisecondsSinceStart)
}

const isMemberEndDateValid = (dateString: string): boolean => {
  const emptyStringRegex = /^\s*$/
  return isMemberStartDateValid(dateString) || emptyStringRegex.test(dateString)
}

const isFileJSONContentValid = (json: unknown) => {
  if (typeof json !== 'object') {
    return false
  }
  const entries = Object.entries(json)
  if (entries.length < 1) {
    return false
  }
  for (const [, member] of entries) {
    if (typeof member !== MemberFormatFromFileSchema.type) {
      return false
    }
    const memberPropertiesAndValues = Object.entries(member)
    const memberIsValidType = memberPropertiesAndValues.every(
      ([memberProperty, memberPropertyValue]) =>
        memberProperty in MemberFormatFromFileSchema.properties &&
        typeof memberPropertyValue ===
          MemberFormatFromFileSchema.properties[memberProperty].type,
    )
    if (!memberIsValidType) {
      return false
    }
    if (
      !isMemberEndDateValid(member.end_date as string) ||
      !isMemberStartDateValid(member.start_date as string)
    ) {
      return false
    }
  }

  return true
}

const readFileContents = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result as string)
    })
    reader.onerror = reject
    reader.readAsText(file, 'UTF-8')
  })

export const getMembersFromFile = async (
  file: File,
): Promise<MemberFormatFromFile[]> => {
  try {
    const fileContents = await readFileContents(file)
    const fileJSON = JSON.parse(fileContents)
    if (!isFileJSONContentValid(fileJSON)) {
      throw new Error(FileParsingErrorMessages.INVALID_SCHEMA)
    }
    return Object.values(fileJSON)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === FileParsingErrorMessages.INVALID_SCHEMA
    ) {
      throw error
    }
    throw new Error(FileParsingErrorMessages.INVALID_JSON)
  }
}
