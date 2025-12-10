import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { red } from '@mui/material/colors'
import { useToggle } from 'utils/hooks'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import {
  createTeam,
  useOnUserChangeAPIData,
  CollectorTarget,
  Organization,
  ValueStream,
  User,
  Team,
  updateTeam,
  useAPIContext,
  TeamCreateUpdatePayload,
  useCollectorTargetsContext,
  HolocronLoadingScreen,
} from 'api'
import globalConfig from 'globalConfig'
import { renderHighlightedOptions } from 'utils'
import CollectorTargetsAutocomplete from 'utils/CollectorTargetsAutocomplete'
import StyledTooltip from 'utils/StyledTooltip'
import OnboardTeamViewWidget from 'ui/OnboardTeamViewWidget'
import UploadTeamMembersFile from 'ui/UploadTeamMembersFile'
import { useEffect, useState } from 'react'
import useTeamFormReducer from './useTeamFormReducer'

const { UI_SETTINGS } = globalConfig
const { ERROR_HIDE_DURATION } = UI_SETTINGS

const collectorTargetFormatter = ({ name, url, teamId }: CollectorTarget) =>
  teamId ? `USED ${name} [url : ${url}]` : `${name} [url : ${url}]`

const userFormatter = (user: User) => user.username

const renderUserHighlightedOptions = renderHighlightedOptions(userFormatter)

const renderOrganizationHighlightedOptions = renderHighlightedOptions(
  (org: Organization) => org.name,
)

const renderValueStreamHighlightedOptions = renderHighlightedOptions(
  (vs: ValueStream) => vs.name,
)

const getCollectorTargetId = (c: CollectorTarget) => c.id

export type TeamFormProps = {
  organization?: Organization
  valueStream?: ValueStream
  team?: Team
  previousTeamTicketBoards?: CollectorTarget[]
  previousTeamRepositories?: CollectorTarget[]
  previousTeamPipelines?: CollectorTarget[]
  previousTeamProjects?: CollectorTarget[]
}

const TeamForm = ({
  organization: previousOrganization,
  valueStream: previousValueStream,
  team: previousTeam,
  previousTeamTicketBoards,
  previousTeamRepositories,
  previousTeamPipelines,
  previousTeamProjects,
}: TeamFormProps) => {
  const {
    ticketBoards: allTicketBoards,
    repositories: allRepositories,
    pipelines: allPipelines,
    projects: allProjects,
    isLoading,
    error,
  } = useCollectorTargetsContext()
  const isUpdateForm = !!previousTeam

  const { organizationList, allUsers, featureFlags } = useAPIContext()
  const { ssoEnabled } = featureFlags
  const [showLoading, setShowLoading] = useState(isLoading)
  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
    } else {
      const timer = setTimeout(() => setShowLoading(false), 300)
      return () => clearTimeout(timer)
    }
    return () => {}
  }, [isLoading])
  const {
    state,
    setTeamName,
    setOrganization,
    setValueStream,
    setTicketBoards,
    setRepositories,
    setPipelines,
    setProjects,
    setTeamSize,
    setTeamAdmins,
    setIsSubmitting,
  } = useTeamFormReducer({
    ssoEnabled,
    previousOrganization,
    previousValueStream,
    previousTeam,
    previousTeamTicketBoards,
    previousTeamRepositories,
    previousTeamPipelines,
    previousTeamProjects,
  })
  const {
    organization,
    valueStream,
    teamName,
    teamSize,
    teamAdmins,
    ticketBoards,
    repositories,
    pipelines,
    projects,
    isSubmitting,
    isSubmitDisabled,
  } = state

  const onUserChangeAPIData = useOnUserChangeAPIData()
  const [errorAlertIsOpen, openErrorAlert, closeErrorAlert] = useToggle()

  const navigate = useNavigate()

  const mutation = useMutation(
    async (mutatedData: TeamCreateUpdatePayload) => {
      if (isUpdateForm && !!mutatedData.id) {
        await updateTeam(mutatedData)
      } else if (!isUpdateForm) {
        await createTeam(mutatedData)
      }
      await onUserChangeAPIData()
    },
    {
      onSuccess: () => {
        setIsSubmitting(false)
        navigate('/admin')
      },
      onError: () => {
        setIsSubmitting(false)
        openErrorAlert()
      },
    },
  )

  const handleFormCancel = () => navigate('/admin')

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault()
    setIsSubmitting(true)
    const mutatedData: TeamCreateUpdatePayload = {
      id: previousTeam?.id,
      name: teamName.value,
      valueStreamId: valueStream.value.id,
      teamSize: Number(teamSize.value),
      collectorTargetIds: [
        ...ticketBoards.map(getCollectorTargetId),
        ...repositories.map(getCollectorTargetId),
        ...pipelines.map(getCollectorTargetId),
        ...projects.map(getCollectorTargetId),
      ],
    }
    if (ssoEnabled) {
      mutatedData.userIds = teamAdmins.value.map(u => u.id)
    }
    mutation.mutate(mutatedData)
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading collector targets: {error.message}
      </Typography>
    )
  }

  return (
    <Box sx={{ width: { xs: '100%', sm: '80%' }, mx: 'auto' }}>
      <form onSubmit={handleFormSubmit}>
        {errorAlertIsOpen && (
          <Snackbar
            open={errorAlertIsOpen}
            autoHideDuration={ERROR_HIDE_DURATION}
            onClose={closeErrorAlert}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              variant="filled"
              severity="error"
              sx={{ backgroundColor: red.A400 }}
            >
              Error submitting form.
            </Alert>
          </Snackbar>
        )}
        <Typography variant="h5" align="center" mb={5}>
          {isUpdateForm ? `Update Team ${previousTeam.name}` : 'Create Team'}
        </Typography>
        <Stack justifyContent="center" direction="column" spacing={5}>
          <Autocomplete
            id="select-organization"
            options={organizationList}
            getOptionLabel={org => org.name}
            isOptionEqualToValue={(org1, org2) => org1.id === org2.id}
            selectOnFocus
            handleHomeEndKeys
            autoHighlight
            clearOnBlur
            value={organization?.value || null}
            onChange={(_, v) => {
              setOrganization(v)
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Select Your Organization"
                variant="standard"
                required={!organization?.value}
                error={!!organization?.error}
              />
            )}
            renderOption={renderOrganizationHighlightedOptions}
          />
          <Autocomplete
            id="select-value-stream"
            options={organization?.value ? organization.value.valueStreams : []}
            getOptionLabel={vs => vs.name}
            isOptionEqualToValue={(vs1, vs2) => vs1.id === vs2.id}
            selectOnFocus
            handleHomeEndKeys
            autoHighlight
            clearOnBlur
            disabled={!isUpdateForm && !organization?.value}
            value={valueStream.value}
            onChange={(_, v) => {
              setValueStream(v)
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Select Your Value Stream"
                variant="standard"
                required={!valueStream}
                error={!valueStream}
              />
            )}
            renderOption={renderValueStreamHighlightedOptions}
          />
          <TextField
            id="enter-your-team-name"
            label="Enter Your Team Name"
            fullWidth
            onChange={event => setTeamName(event.target.value)}
            value={teamName.value}
            error={teamName.error}
            helperText={teamName.helperText}
            variant="standard"
            required
            disabled={teamName.disabled}
            inputProps={{
              'aria-label': 'Enter Your Team Name',
            }}
          />
          <TextField
            id="enter-the-number-of-members-in-your-team"
            label="Enter the number of members in your team"
            disabled={teamName.disabled}
            fullWidth
            onChange={event => setTeamSize(event.target.value)}
            value={teamSize.value}
            error={teamSize.error}
            helperText={teamSize.helperText}
            inputProps={{
              'aria-label': 'Enter the number of members in your team',
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            variant="standard"
            required
          />
          <Autocomplete
            id="select-team-admins"
            disabled={teamName.disabled || !ssoEnabled}
            options={allUsers}
            getOptionLabel={user => user.username}
            isOptionEqualToValue={(user1, user2) => user1.id === user2.id}
            value={teamAdmins.value}
            onChange={(_, v) => setTeamAdmins(v)}
            multiple
            filterSelectedOptions
            renderTags={(tags, getTagProps) =>
              tags.map((option, index) => {
                const { key: _, ...tagProps } = getTagProps({ index })
                return (
                  <StyledTooltip
                    title={userFormatter(option)}
                    placement="top"
                    enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
                    key={userFormatter(option)}
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
                          {userFormatter(option)}
                        </Box>
                      }
                      {...tagProps}
                    />
                  </StyledTooltip>
                )
              })
            }
            renderInput={params => (
              <TextField
                {...params}
                required={!teamAdmins.value}
                error={!teamAdmins.value}
                label="Select Your Team Admins"
                variant="standard"
              />
            )}
            renderOption={renderUserHighlightedOptions}
          />
          <Stack
            justifyContent="center"
            direction="column"
            spacing={5}
            position="relative"
          >
            {isLoading && (
              <HolocronLoadingScreen
                fullScreen={false}
                showLogo
                visible={showLoading}
                text="Loading please wait..."
              />
            )}
            <CollectorTargetsAutocomplete
              id="select-ticket-boards"
              disabled={teamName.disabled || isLoading}
              options={allTicketBoards || []}
              multiple
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              filterSelectedOptions
              getOptionDisabled={option => !!option.teamId}
              getOptionLabel={collectorTargetFormatter}
              value={ticketBoards}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, v) => {
                setTicketBoards(v)
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Select Ticket Boards"
                  variant="standard"
                />
              )}
            />
            <CollectorTargetsAutocomplete
              id="select-repositories"
              disabled={teamName.disabled || isLoading}
              options={allRepositories || []}
              multiple
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              filterSelectedOptions
              getOptionDisabled={option => !!option.teamId}
              getOptionLabel={collectorTargetFormatter}
              value={repositories}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, v) => {
                setRepositories(v)
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Select Repositories"
                  variant="standard"
                />
              )}
            />
            <CollectorTargetsAutocomplete
              id="select-pipelines"
              disabled={teamName.disabled || isLoading}
              options={allPipelines || []}
              multiple
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              filterSelectedOptions
              getOptionDisabled={option => !!option.teamId}
              getOptionLabel={collectorTargetFormatter}
              value={pipelines}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, v) => {
                setPipelines(v)
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Select Pipelines"
                  variant="standard"
                />
              )}
            />
            <CollectorTargetsAutocomplete
              id="select-code-analysis-projects"
              disabled={teamName.disabled || isLoading}
              options={allProjects || []}
              multiple
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              filterSelectedOptions
              getOptionDisabled={option => !!option.teamId}
              getOptionLabel={collectorTargetFormatter}
              value={projects}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, v) => {
                setProjects(v)
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Select Code Analysis Projects"
                  variant="standard"
                />
              )}
            />
          </Stack>
          {isUpdateForm && <UploadTeamMembersFile teamId={previousTeam.id} />}
          {isUpdateForm && <OnboardTeamViewWidget team={previousTeam} />}
          <Stack
            direction={{ sx: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              aria-label="Cancel Submission"
              onClick={handleFormCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              color="primary"
              type="submit"
              aria-label="Submit Your Form"
              disabled={isSubmitDisabled}
            >
              Submit
              {isSubmitting && <CircularProgress size={25} />}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  )
}

export default TeamForm

export const usePreviousTeamData = ({ team: previousTeam }: { team: Team }) => {
  const { ticketBoards, repositories, pipelines, projects, isLoading, error } =
    useCollectorTargetsContext()

  if (!error && !isLoading) {
    return {
      data: {
        ticketBoards,
        repositories,
        pipelines,
        projects,
        previousTeamTicketBoards: ticketBoards.filter(
          t => t.teamId === previousTeam.id,
        ),
        previousTeamRepositories: repositories.filter(
          r => r.teamId === previousTeam.id,
        ),
        previousTeamPipelines: pipelines.filter(
          p => p.teamId === previousTeam.id,
        ),
        previousTeamProjects: projects.filter(
          p => p.teamId === previousTeam.id,
        ),
      },
      isLoading: false,
      hasErrored: false,
      isRefetching: false,
      hasErroredOnRefetch: false,
    }
  }

  return {
    data: null,
    hasErrored: !!error,
    isLoading,
    isRefetching: false,
    hasErroredOnRefetch: false,
  }
}
