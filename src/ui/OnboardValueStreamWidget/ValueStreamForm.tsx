import {
  Alert,
  Autocomplete,
  Chip,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material'
import { red } from '@mui/material/colors'
import {
  useAPIContext,
  Organization,
  User,
  ValueStream,
  createValueStream,
  updateValueStream,
  useOnUserChangeAPIData,
  ValueStreamCreateUpdatePayload,
} from 'api'
import { useToggle } from 'utils/hooks'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import globalConfig from 'globalConfig'
import { renderHighlightedOptions } from 'utils'
import useValueStreamFormReducer from './useValueStreamFormReducer'

const { UI_SETTINGS } = globalConfig
const { ERROR_HIDE_DURATION } = UI_SETTINGS

const getUserLabel = (user: User) => user.username

const renderUserHighlightedOptions = renderHighlightedOptions(getUserLabel)

const renderOrganizationHighlightedOptions = renderHighlightedOptions(
  (org: Organization) => org.name,
)

export type ValueStreamFormProps = {
  organization?: Organization
  valueStream?: ValueStream
}

const ValueStreamForm = ({
  organization: valueStreamToUpdateOrganization,
  valueStream: valueStreamToUpdate,
}: ValueStreamFormProps) => {
  const isUpdateForm = !!valueStreamToUpdate

  const { allUsers, organizationList, featureFlags } = useAPIContext()
  const { ssoEnabled } = featureFlags
  const {
    state,
    setOrganization,
    setValueStreamName,
    setValueStreamAdmins,
    setIsSubmitting,
  } = useValueStreamFormReducer(
    ssoEnabled,
    valueStreamToUpdateOrganization,
    valueStreamToUpdate,
  )

  const {
    organization,
    valueStreamName,
    valueStreamAdmins,
    isSubmitting,
    isSubmitDisabled,
  } = state

  const [errorAlertIsOpen, openErrorAlert, closeErrorAlert] = useToggle()
  const navigate = useNavigate()
  const onUserChangeAPIData = useOnUserChangeAPIData()
  const mutation = useMutation(
    async (mutatedData: ValueStreamCreateUpdatePayload) => {
      if (isUpdateForm && !!mutatedData.id) {
        await updateValueStream(mutatedData)
      } else if (!isUpdateForm) {
        await createValueStream(mutatedData)
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
    const mutatedData: ValueStreamCreateUpdatePayload = {
      id: valueStreamToUpdate?.id,
      organizationId: organization.value.id,
      name: valueStreamName.value,
    }
    if (ssoEnabled) {
      mutatedData.userIds = valueStreamAdmins.value.map(u => u.id)
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
            ? `Update Value Stream ${valueStreamToUpdate.name}`
            : 'Create Value Stream'}
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
            value={organization.value}
            onChange={(_, selectedOrg) => {
              setOrganization(selectedOrg)
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="Select Your Organization"
                variant="standard"
                error={!organization}
                required={!organization}
              />
            )}
            renderOption={renderOrganizationHighlightedOptions}
          />

          <TextField
            id="enter-your-value-stream-name"
            label="Enter Your Value Stream Name"
            fullWidth
            onChange={event => setValueStreamName(event.target.value)}
            value={valueStreamName.value}
            error={valueStreamName.error}
            helperText={valueStreamName.helperText}
            variant="standard"
            required
            disabled={valueStreamName.disabled}
            inputProps={{
              'aria-label': 'Enter Your Value Stream Name',
            }}
          />
          <Autocomplete
            id="select-valuestream-admins"
            options={allUsers}
            getOptionLabel={getUserLabel}
            isOptionEqualToValue={(user1, user2) => user1.id === user2.id}
            value={valueStreamAdmins.value}
            onChange={(_, selectedMembers) =>
              setValueStreamAdmins(selectedMembers)
            }
            filterSelectedOptions
            multiple
            disabled={valueStreamName.disabled || !ssoEnabled}
            renderTags={(tags, getTagProps) =>
              tags.map((option, index) => {
                const { key: _, ...tagProps } = getTagProps({ index })
                return (
                  <Tooltip
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
                  </Tooltip>
                )
              })
            }
            renderInput={params => (
              <TextField
                {...params}
                required={valueStreamAdmins.value.length === 0}
                error={valueStreamAdmins.error}
                label="Select Your Value Stream Admins"
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

export default ValueStreamForm
