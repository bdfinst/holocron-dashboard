import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useTheme,
  Snackbar,
  Alert,
  styled,
} from '@mui/material'
import { CloseIcon, SettingsIcon } from 'utils/icons'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useAPIContext, updateCollector } from 'api'
import { alpha } from '@mui/material/styles'
import useCollectorFormReducer from './useCollectorFormReducer'
import LoadingOverlay from './LoadingOverlay'

const ConfigureCollectors = () => {
  const theme = useTheme()
  const { collectors } = useAPIContext()

  const {
    state,
    setSelectedCollector,
    setSelectedTab,
    updateCollectorField,
    setNotification,
    setCollectors,
    setOpen,
    setIsSubmitting,
  } = useCollectorFormReducer(collectors)

  const {
    collectors: sortedCollectors,
    selectedTab,
    selectedCollector,
    open,
    notification,
  } = state

  const navigate = useNavigate()

  const StyledTabs = styled(Tabs)(({ theme }) => ({
    '& .MuiTab-root': {
      color: theme.palette.text.primary,
      minWidth: 120,
    },
    '& .MuiTabs-flexContainer': {
      flexWrap: 'wrap',
    },
    '& .MuiTab-root.Mui-selected': {
      color: theme.palette.text.primary,
      backgroundColor:
        theme.palette.mode === 'light'
          ? theme.palette.grey[300]
          : theme.palette.background.default,
    },
  }))

  const mutation = useMutation(
    async (collectorId: number) => {
      const updatedFields = collectorFields.reduce((acc, { key }) => {
        acc[key] = selectedCollector[key]
        return acc
      }, {})

      const updateData = {
        ...updatedFields,
        name: selectedCollector.name,
        target: selectedCollector.target,
      }

      const response = await updateCollector(collectorId, updateData)
      return response.data
    },
    {
      onSuccess: updatedCollector => {
        const updatedCollectors = sortedCollectors.map(collector =>
          collector.id === updatedCollector.id ? updatedCollector : collector,
        )
        setIsSubmitting(false)
        setCollectors(updatedCollectors)
        setSelectedCollector(updatedCollector)
        setNotification(
          `Collector ${updatedCollector.name} updated successfully`,
          'success',
        )
        navigate('/admin')
      },
      onError: () => {
        setIsSubmitting(false)
        setNotification('Error updating collector', 'error')
      },
    },
  )

  const handleOpen = () => {
    setOpen(true)
    setSelectedCollector(sortedCollectors[selectedTab])
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
    setSelectedCollector(sortedCollectors[newValue])
  }

  const handleInputChange = (field, value) => {
    const numericValue = value !== '' ? Number(value) : null
    if (numericValue === null || !isNaN(numericValue)) {
      updateCollectorField(field, numericValue)
    }
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    mutation.mutate(selectedCollector.id)
  }

  const handleNotificationClose = () => {
    setNotification('', 'success')
  }

  const collectorFields = [
    { key: 'collectorIntervalSeconds', label: 'Collector Interval (seconds)' },
    {
      key: 'collectorTargetsIntrvlSecs',
      label: 'Collector Target Interval (seconds)',
    },
    { key: 'lookBackDays', label: 'Look Back Days' },
    { key: 'maxRequestsPerMinute', label: 'Max Requests Per Minute' },
  ]

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        size="small"
        sx={{ width: 'fit-content' }}
        startIcon={<SettingsIcon />}
        aria-label="Configure Collectors"
        data-testid="configure-collectors-button"
      >
        Configure Collectors
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: 800,
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            position: 'relative',
          },
        }}
      >
        <form onSubmit={handleSave}>
          <DialogTitle>
            Collector Configuration
            <IconButton
              aria-label="Close"
              onClick={handleClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {state.isSubmitting && <LoadingOverlay />}
            <StyledTabs
              value={selectedTab}
              onChange={handleTabChange}
              data-testid="styled-tabs"
            >
              {sortedCollectors.map((collector, index) => (
                <Tab
                  key={collector.id}
                  label={collector.name}
                  value={index}
                  role="tab"
                  aria-selected={selectedTab === index}
                  data-testid={`tab-${collector.name}`}
                />
              ))}
            </StyledTabs>
            {selectedCollector && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Field</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {collectorFields.map(({ key, label }) => (
                      <TableRow key={key}>
                        <TableCell>{label}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            aria-label={label}
                            value={selectedCollector[key] ?? ''}
                            onChange={e =>
                              handleInputChange(key, e.target.value)
                            }
                            fullWidth
                            placeholder={
                              selectedCollector[key] === null
                                ? 'Not currently configured in the database'
                                : ''
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={state.isSubmitting}
              aria-label="Save"
            >
              Save
            </Button>
          </DialogContent>
        </form>
      </Dialog>
      <Snackbar
        open={notification.open && notification.message !== ''}
        autoHideDuration={3000}
        onClose={handleNotificationClose}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ConfigureCollectors
