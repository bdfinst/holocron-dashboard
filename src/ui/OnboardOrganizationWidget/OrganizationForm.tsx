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
import {
  createOrganization,
  Organization,
  updateOrganization,
  useOnUserChangeAPIData,
  User,
  useAPIContext,
  OrganizationCreateUpdatePayload,
} from 'api'
import { useToggle } from 'utils/hooks'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import globalConfig from 'globalConfig'
import { renderHighlightedOptions } from 'utils'
import { red } from '@mui/material/colors'
import StyledTooltip from 'utils/StyledTooltip'
import useOrganizationFormReducer from './useOrganizationFormReducer'

const { UI_SETTINGS } = globalConfig

const { ERROR_HIDE_DURATION } = UI_SETTINGS

const getUserLabel = (user: User) => user.username

const renderUserHighlightedOptions = renderHighlightedOptions(getUserLabel)

export type OrganizationFormProps = {
  organization?: Organization
}

const OrganizationForm = ({ organization }: OrganizationFormProps) => {
  const isUpdateForm = !!organization

  const { allUsers, featureFlags } = useAPIContext()
  const { ssoEnabled } = featureFlags

  const { state, setOrganizationAdmins, setOrganizationName, setIsSubmitting } =
    useOrganizationFormReducer(ssoEnabled, organization)

  const {
    organizationAdmins,
    organizationName,
    isSubmitting,
    isSubmitDisabled,
  } = state

  const [errorAlertIsOpen, openErrorAlert, closeErrorAlert] = useToggle()

  const navigate = useNavigate()

  const onUserChangeAPIData = useOnUserChangeAPIData()

  const mutation = useMutation(
    async (mutatedData: OrganizationCreateUpdatePayload) => {
      if (isUpdateForm && !!mutatedData.id) {
        await updateOrganization(mutatedData)
      } else if (!isUpdateForm) {
        await createOrganization(mutatedData)
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
    const mutatedData: OrganizationCreateUpdatePayload = {
      id: organization?.id,
      name: organizationName.value,
    }
    if (ssoEnabled) {
      mutatedData.userIds = organizationAdmins.value.map(user => user.id)
    }
    mutation.mutate(mutatedData)
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
            ? `Update Organization ${organization.name}`
            : 'Create Organization'}
        </Typography>
        <Stack justifyContent="center" direction="column" spacing={5}>
          <TextField
            id="enter-organization-name"
            label="Enter Organization Name"
            fullWidth
            onChange={event => setOrganizationName(event.target.value)}
            value={organizationName.value}
            error={organizationName.error}
            helperText={organizationName.helperText}
            variant="standard"
            required
          />

          <Autocomplete<User, true>
            id="select-organization-admins"
            disabled={!ssoEnabled}
            options={allUsers}
            getOptionLabel={getUserLabel}
            isOptionEqualToValue={(user1, user2) => user1.id === user2.id}
            value={organizationAdmins.value}
            onChange={(_, selectedMembers) =>
              setOrganizationAdmins(selectedMembers)
            }
            filterSelectedOptions
            multiple
            renderTags={(tags, getTagProps) =>
              tags.map((option, index) => {
                const { key: _, ...tagProps } = getTagProps({ index })
                return (
                  <StyledTooltip
                    title={getUserLabel(option)}
                    placement="top"
                    enterTouchDelay={UI_SETTINGS.TOOL_TIP_DELAY}
                    key={getUserLabel(option)}
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
                          {getUserLabel(option)}
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
                required={organizationAdmins.value.length === 0}
                error={organizationAdmins.error}
                label="Select Your Organization Admins"
                variant="standard"
              />
            )}
            renderOption={renderUserHighlightedOptions}
          />
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

export default OrganizationForm
