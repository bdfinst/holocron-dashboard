import log from 'loglevel'

const KEY_PREFIX = 'holocron'
const tenMinutesInMilliSecs = 1000 * 60 * 10

const query = {
  GROUP_ENTITIES: `${KEY_PREFIX}-group-entities`,
  /**
   * depricated: teams key for react query,
   * will have to use GROUP_ENTITY key instead
   */
  TEAMS: `${KEY_PREFIX}-teams`,
  /**
   * metrics key for react query
   */
  METRICS: `${KEY_PREFIX}-metrics`,
  /**
   * collector targets key for react query
   */
  COLLECTOR_TARGETS: `${KEY_PREFIX}-collector-targets`,
  /**
   * the default configuration for
   * useQuery() hook
   */
  USE_QUERY_CONFIG: {
    /** only fetch the data three times on initial render */
    retry: 3,
    refetchInterval: tenMinutesInMilliSecs,
    refetchOnWindowFocus: false,
  },
  /**
   * logger to set logger
   */
  LOGGER: {
    log: () => log.debug('fetch debug'),
    warn: () => log.warn('fetch warn'),
    error: () => log.error('fetch error'),
  },
}

export default query
