import React, { useState, useEffect } from 'react'
import {
  Team,
  CollectorTarget,
  createTeamView,
  updateTeamView,
  useOnUserChangeAPIData,
  TeamView,
  useCollectorTargetsContext,
  HolocronLoadingScreen,
} from 'api'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { useToggle } from 'utils/hooks'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { red } from '@mui/material/colors'
import globalConfig from 'globalConfig'
import CollectorTargetsAutocomplete from 'utils/CollectorTargetsAutocomplete'
import useTeamViewFormReducer from './useTeamViewFormReducer'

const { UI_SETTINGS } = globalConfig
const { ERROR_HIDE_DURATION } = UI_SETTINGS

const collectorTargetFormatter = ({ name, url, teamId }: CollectorTarget) =>
  teamId ? `USED ${name} [url : ${url}]` : `${name} [url : ${url}]`

const getCollectorTargetId = (c: CollectorTarget) => c.id

export type TeamViewFormProps = {
  team: Team
  teamView?: TeamView
  previousTeamViewTicketBoards?: CollectorTarget[]
  previousTeamViewRepositories?: CollectorTarget[]
  previousTeamViewPipelines?: CollectorTarget[]
  previousTeamViewProjects?: CollectorTarget[]
}

const TeamViewForm = ({
  team: previousTeam,
  teamView: previousTeamView,
  previousTeamViewTicketBoards,
  previousTeamViewRepositories,
  previousTeamViewPipelines,
  previousTeamViewProjects,
}: TeamViewFormProps) => {
  const {
    ticketBoards: allTicketBoards,
    repositories: allRepositories,
    pipelines: allPipelines,
    projects: allProjects,
    isLoading,
    error,
  } = useCollectorTargetsContext()

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

  const isUpdateForm = !!previousTeamView
  const {
    state,
    setTeamViewName,
    setTicketBoards,
    setRepositories,
    setPipelines,
    setProjects,
    setIsSubmitting,
  } = useTeamViewFormReducer(
    previousTeam,
    previousTeamView,
    previousTeamViewTicketBoards,
    previousTeamViewRepositories,
    previousTeamViewPipelines,
    previousTeamViewProjects,
  )
  const {
    teamViewName,
    repositories,
    pipelines,
    projects,
    ticketBoards,
    isSubmitting,
    isSubmitDisabled,
  } = state

  const navigate = useNavigate()

  const onUserChangeAPIData = useOnUserChangeAPIData()
  const [errorAlertIsOpen, openErrorAlert, closeErrorAlert] = useToggle()

  const mutation = useMutation(
    async (mutatedData: {
      id?: number
      name: string
      viewOwnerId: number
      collectorTargetIds: number[]
    }) => {
      if (isUpdateForm && !!mutatedData.id) {
        await updateTeamView(mutatedData)
      } else if (!isUpdateForm) {
        await createTeamView(mutatedData)
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

  const handleSubmitForm: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault()
    setIsSubmitting(true)
    const mutatedData = {
      id: previousTeamView?.id,
      name: teamViewName.value,
      viewOwnerId: previousTeam.id,
      collectorTargetIds: [
        ...ticketBoards.map(getCollectorTargetId),
        ...repositories.map(getCollectorTargetId),
        ...pipelines.map(getCollectorTargetId),
        ...projects.map(getCollectorTargetId),
      ],
    }
    mutation.mutate(mutatedData)
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">Error loading collector targets.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ width: { xs: '100%', sm: '80%' }, mx: 'auto' }}>
      <form onSubmit={handleSubmitForm}>
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
          {isUpdateForm
            ? `Update Team View ${previousTeamView.name}`
            : 'Create Team View'}
        </Typography>
        <Stack justifyContent="center" direction="column" spacing={5}>
          <TextField
            id="enter-your-team-view-name"
            label="Enter Your Team View Name"
            fullWidth
            onChange={event => setTeamViewName(event.target.value)}
            value={teamViewName.value}
            error={teamViewName.error}
            helperText={teamViewName.helperText}
            variant="standard"
            required
            inputProps={{
              'aria-label': 'Enter Your Team View Name',
            }}
          />
          <Stack position="relative">
            <HolocronLoadingScreen
              fullScreen={false}
              showLogo={false}
              text="Loading collector targets..."
              visible={showLoading}
            />
            <CollectorTargetsAutocomplete
              id="select-ticket-boards"
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

export default TeamViewForm

export const usePreviousTeamViewData = ({ teamView: previousTeamView }) => {
  const { ticketBoards, repositories, pipelines, projects, isLoading, error } =
    useCollectorTargetsContext()

  if (!error && !isLoading) {
    return {
      data: {
        ticketBoards,
        repositories,
        pipelines,
        projects,
        previousTeamViewTicketBoards: ticketBoards.filter(
          t => t.teamId === previousTeamView.id,
        ),
        previousTeamViewRepositories: repositories.filter(
          r => r.teamId === previousTeamView.id,
        ),
        previousTeamViewPipelines: pipelines.filter(
          p => p.teamId === previousTeamView.id,
        ),
        previousTeamViewProjects: projects.filter(
          p => p.teamId === previousTeamView.id,
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
