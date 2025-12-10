import { TableCell, TableRow } from '@mui/material'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { Route } from 'react-router-dom'
import GroupEntityTable from '.'

const organizationEntities = [
  { name: 'test1', id: 1, valuestreams: [] },
  { name: 'test2', id: 2, valuestreams: [] },
  { name: 'test3', id: 3, valuestreams: [] },
  { name: 'test4', id: 4, valuestreams: [] },
  { name: 'test5', id: 5, valuestreams: [] },
  { name: 'test6', id: 6, valuestreams: [] },
]

const defaultRowsPerPageInComponent = 5

const MockEntityTable = () => (
  <GroupEntityTable
    canCreate
    columns={[
      {
        title: 'Name',
        tipText: 'The name of the entity',
        align: 'left',
      },
    ]}
    entities={organizationEntities}
    renderRow={entity => (
      <TableRow key={entity.name}>
        <TableCell>{entity.name}</TableCell>
      </TableRow>
    )}
    groupEntityCategory="organization"
    addGroupEntityLink="/add-organization"
  />
)

describe('Entity table', () => {
  it('should show the list of entities', () => {
    RenderWithWrapper(<MockEntityTable />)
    for (let i = 1; i < defaultRowsPerPageInComponent; i += 1) {
      expect(screen.getByText(`test${i}`)).toBeInTheDocument()
    }
  })

  it('should let the user filter entity by name', async () => {
    RenderWithWrapper(<MockEntityTable />)

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search organization by name' }),
      'test1',
    )

    expect(screen.getByText('test1')).toBeInTheDocument()
    for (let i = 2; i < organizationEntities.length; i += 1) {
      expect(screen.queryByText(`test${i}`)).not.toBeInTheDocument()
    }
  })

  it('should show the no entities found ui if no entities were found on filter', async () => {
    RenderWithWrapper(<MockEntityTable />)

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search organization by name' }),
      'Non Existant Entity',
    )

    expect(screen.getByText(/No Items Found/i)).toBeInTheDocument()
  })

  it('should allow the user to go to the next page', async () => {
    RenderWithWrapper(<MockEntityTable />)

    await userEvent.click(screen.getByLabelText(/next page/i))

    for (let i = 0; i < defaultRowsPerPageInComponent; i += 1) {
      expect(screen.queryByText(`test${i}`)).not.toBeInTheDocument()
    }

    expect(screen.getByText('test6')).toBeInTheDocument()
  })

  it('should allow the user to change the number of rows per page', async () => {
    RenderWithWrapper(<MockEntityTable />)
    expect(screen.getAllByText(/test/i)).toHaveLength(5)

    await userEvent.click(
      screen.getByRole('combobox', { name: 'Rows per page:' }),
    )
    const listbox = within(screen.getByRole('listbox'))
    await userEvent.click(listbox.getByText(/10/i))

    expect(screen.getAllByText(/test/i)).toHaveLength(6)
  })

  it('should allow the user to navigate to creating a new entity', async () => {
    RenderWithWrapper(null, { initialEntries: ['/'] }, [
      <Route key="home" path="/" element={<MockEntityTable />} />,
      <Route
        key="add-org"
        path="/add-organization"
        element={<div>Add Organization</div>}
      />,
    ])

    await userEvent.click(screen.getByLabelText('Add organization'))

    await waitFor(() => {
      expect(screen.getByText('Add Organization')).toBeInTheDocument()
    })
  })
})
