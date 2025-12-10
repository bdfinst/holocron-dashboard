import { Autocomplete, Paper, TextField } from '@mui/material'
import { Team, TeamView, withFeatureFlag } from 'api'
import StyledTooltip from 'utils/StyledTooltip'
import config from 'globalConfig'

const TeamAutocompletePaper = ({ children }: { children: React.ReactNode }) => (
  <Paper
    sx={{
      '& .MuiAutocomplete-listbox': {
        // styles applied to the current selected option
        "& .MuiAutocomplete-option[aria-selected='true']": {
          bgcolor: theme => theme.palette.secondary.main,
          '&.Mui-focused': {
            bgcolor: theme => theme.palette.secondary.main,
          },
        },
      },
    }}
  >
    {children}
  </Paper>
)

export type TeamAutocompleteProps = {
  options: Team[] | (Team | TeamView)[]
  value?: Team | (Team | TeamView)
  onTeamChange: (team: Team) => void
  onTeamViewChange: (teamView: TeamView) => void
}

export const groupTeamWithTeamViews = (
  subsetTeamList: Team[],
  teamViews: TeamView[],
) => {
  const teamIdToTeamViewsTable: { [teamId: number]: TeamView[] } = {}

  for (const team of subsetTeamList) {
    teamIdToTeamViewsTable[team.id] = []
  }

  for (const teamView of teamViews) {
    if (teamView.viewOwnerId in teamIdToTeamViewsTable) {
      teamIdToTeamViewsTable[teamView.viewOwnerId].push(teamView)
    }
  }

  const result: (Team | TeamView)[] = []

  for (const team of subsetTeamList) {
    const teamViewsForTeam = teamIdToTeamViewsTable[team.id]
    result.push(team, ...teamViewsForTeam)
  }

  return result
}

export const TeamAutocompleteFeatureTeamViews = ({
  options,
  value,
  onTeamChange,
  onTeamViewChange,
}: {
  options: (Team | TeamView)[]
  value?: Team | TeamView
  onTeamChange: (team: Team) => void
  onTeamViewChange: (teamView: TeamView) => void
}) => (
  <StyledTooltip
    title="Select a Team or Team View. Team Views are directly under Team."
    placement="top"
    enterTouchDelay={config.UI_SETTINGS.TOOL_TIP_DELAY}
  >
    <Autocomplete<Team | TeamView>
      id="select-a-team-or-team-view"
      selectOnFocus
      handleHomeEndKeys
      autoHighlight
      clearOnBlur
      PaperComponent={TeamAutocompletePaper}
      options={options}
      value={value}
      isOptionEqualToValue={(option, currentValue) => {
        const optionIsTeamView = !!option && 'viewOwnerId' in option
        const optionIsTeam = !!option && !('viewOwnerId' in option)
        const currentValueIsTeamView =
          !!currentValue && 'viewOwnerId' in currentValue
        const currentValueIsTeam =
          !!currentValue && !('viewOwnerId' in currentValue)
        return (
          (optionIsTeamView &&
            currentValueIsTeamView &&
            option.id === currentValue.id) ||
          (optionIsTeam && currentValueIsTeam && option.id === currentValue.id)
        )
      }}
      getOptionLabel={option => option.name}
      onChange={(_, selectedValue) => {
        const isTeamView = !!selectedValue && 'viewOwnerId' in selectedValue
        if (isTeamView) {
          onTeamViewChange(selectedValue)
        } else {
          onTeamChange(selectedValue as Team | null)
        }
      }}
      renderOption={(props: any, option) => {
        const isTeam = !('viewOwnerId' in option)
        const { key, ...optionProps } = props
        return isTeam ? (
          <li key={key} {...optionProps}>
            {option.name}
          </li>
        ) : (
          <li key={key} {...optionProps}>
            &nbsp;&nbsp;{option.name}
          </li>
        )
      }}
      renderInput={params => (
        <TextField
          variant="standard"
          label="Select a Team or a Team View"
          {...params}
        />
      )}
    />
  </StyledTooltip>
)

export const TeamAutocomplete = ({
  options,
  value,
  onTeamChange,
}: {
  options: Team[]
  value?: Team
  onTeamChange: (team: Team) => void
  onTeamViewChange: (teamView: TeamView) => void
}) => (
  <Autocomplete<Team>
    id="select-a-team"
    selectOnFocus
    handleHomeEndKeys
    autoHighlight
    clearOnBlur
    options={options}
    value={value}
    isOptionEqualToValue={(option, currentValue) =>
      option.id === currentValue?.id
    }
    getOptionLabel={option => option.name}
    onChange={(_, selectedValue) => {
      onTeamChange(selectedValue)
    }}
    renderInput={params => (
      <TextField variant="standard" label="Select a Team" {...params} />
    )}
  />
)

export default withFeatureFlag<TeamAutocompleteProps>({
  featureFlagName: 'FEATURE_TEAM_VIEWS',
  WrappedComponent: TeamAutocompleteFeatureTeamViews,
  FeatureNotAllowedComponent: TeamAutocomplete,
})
