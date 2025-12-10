const KEY_PREFIX = 'ls-holocron'

const cache = {
  /**
   * local storage key for theme
   */
  THEME: `${KEY_PREFIX}-theme`,
  /**
   * local storage key for theme
   */
  IS_GRAYSCALE: `${KEY_PREFIX}-is-grayscale`,
  /**
   * local storage key for preferred organization id to view
   */
  ORGANIZATION_ID: `${KEY_PREFIX}-organization-id`,
  /**
   * local storage key for preferred organization id for cost metrics view
   */
  COST_ORGANIZATION_ID: `${KEY_PREFIX}-cost-organization-id`,
  /**
   * local storage key for preferred valuestream id to view
   */
  VALUESTREAM_ID: `${KEY_PREFIX}-valuestream-id`,
  /**
   * local storage key for preferred valuestream id for cost metrics view
   */
  COST_VALUESTREAM_ID: `${KEY_PREFIX}-cost-valuestream-id`,
  /*
   * local storage key for preferred team id to view
   * */
  TEAM_ID: `${KEY_PREFIX}-team-id`,
  /**
   * local storage key for preferred cost team id to view
   */
  COST_TEAM_ID: `${KEY_PREFIX}-cost-team-id`,
  /**
   * local storage key for week range
   */
  WEEK_RANGE: `${KEY_PREFIX}-week-range`,
}

export default cache
