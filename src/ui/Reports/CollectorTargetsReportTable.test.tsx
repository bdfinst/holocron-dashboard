import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { CollectorTarget } from 'api'
import CollectorTargetsReportTable from './CollectorTargetsReportTable'

const mockCollectorTargets: CollectorTarget[] = [
  {
    id: 6,
    name: 'foo.bar.6',
    url: 'https://foo.bar.6.com',
    teamId: null,
  },
  {
    id: 1,
    name: 'foo.bar.1',
    url: 'https://foo.bar.1.com',
    teamId: 1,
  },
  {
    id: 2,
    name: 'foo.bar.2',
    url: 'https://foo.bar.2.com',
    teamId: null,
  },
  {
    id: 3,
    name: 'foo.bar.3',
    url: 'https://foo.bar.3.com',
    teamId: null,
  },
  {
    id: 5,
    name: 'foo.bar.5',
    url: 'https://foo.bar.5.com',
    teamId: null,
  },
  {
    id: 4,
    name: 'foo.bar.4',
    url: 'https://foo.bar.4.com',
    teamId: null,
  },
]

const getUsageStatusText = (c: CollectorTarget) =>
  c.teamId ? 'Used' : 'Unused'

const defaultRowsPerPage = 5

const sortFn = (
  a: CollectorTarget,
  b: CollectorTarget,
  sortProperty: keyof Pick<CollectorTarget, 'name' | 'url'>,
  descending: boolean,
) => {
  let comparison = 0
  if (a[sortProperty] < b[sortProperty]) {
    comparison = -1
  } else if (a[sortProperty] > b[sortProperty]) {
    comparison = 1
  }
  if (descending) {
    comparison *= -1
  }
  return comparison
}

describe('Table Pagination', () => {
  it('should move onto the next page', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Go to next page',
      }),
    )

    const initiallyExpectedSortedRows = [...mockCollectorTargets].sort((a, b) =>
      sortFn(a, b, 'name', false),
    )
    initiallyExpectedSortedRows.slice(0, defaultRowsPerPage).forEach(item => {
      expect(
        screen.queryByRole('row', {
          name: `${item.name} ${item.url} ${getUsageStatusText(item)}`,
        }),
      ).not.toBeInTheDocument()
    })
    initiallyExpectedSortedRows.slice(defaultRowsPerPage).forEach(item => {
      expect(
        screen.getByRole('row', {
          name: `${item.name} ${item.url} ${getUsageStatusText(item)}`,
        }),
      ).toBeInTheDocument()
    })
  })

  it('should allow for the change in the rows per page', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    const initiallyExpectedSortedRows = [...mockCollectorTargets].sort((a, b) =>
      sortFn(a, b, 'name', false),
    )

    initiallyExpectedSortedRows.slice(defaultRowsPerPage).forEach(item => {
      expect(
        screen.queryByRole('row', {
          name: `${item.name} ${item.url} ${getUsageStatusText(item)}`,
        }),
      ).not.toBeInTheDocument()
    })

    await userEvent.click(
      screen.getByRole('combobox', {
        name: `Rows per page:`,
      }),
    )

    const listbox = within(screen.getByRole('listbox'))

    await userEvent.click(listbox.getByText(/10/i))

    initiallyExpectedSortedRows.slice(defaultRowsPerPage).forEach(item => {
      expect(
        screen.getByRole('row', {
          name: `${item.name} ${item.url} ${getUsageStatusText(item)}`,
        }),
      ).toBeInTheDocument()
    })
  })
})

describe('Table Sorting', () => {
  it('should sort by name ascending', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    // initially sorted ascending, so will have to sort descending first
    await userEvent.click(screen.getByLabelText('Sort by Name Descending'))

    const sortAscendingArrow = await screen.findByLabelText(
      'Sort by Name Ascending',
    )

    await userEvent.click(sortAscendingArrow)

    const rows = screen.getAllByRole('row')
    const expectedRowOrder = [
      'foo.bar.1',
      'foo.bar.2',
      'foo.bar.3',
      'foo.bar.4',
      'foo.bar.5',
    ]
    expect(rows).toHaveLength(expectedRowOrder.length + 1) // due to header
    const [_header, ...dataRows] = rows
    dataRows.forEach((row, i) => {
      expect(row).toHaveTextContent(expectedRowOrder[i])
    })
  })

  it('should sort by name descending', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    await userEvent.click(screen.getByLabelText('Sort by Name Descending'))

    const rows = screen.getAllByRole('row')
    const expectedRowOrder = [
      'foo.bar.6',
      'foo.bar.5',
      'foo.bar.4',
      'foo.bar.3',
      'foo.bar.2',
    ]
    expect(rows).toHaveLength(expectedRowOrder.length + 1) // due to header
    const [_header, ...dataRows] = rows
    dataRows.forEach((row, i) => {
      expect(row).toHaveTextContent(expectedRowOrder[i])
    })
  })

  it('should sort by url ascending', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )
    // initially sorted ascending, so will have to sort descending first
    await userEvent.click(screen.getByLabelText('Sort by Url Descending'))

    const sortAscendingArrow = await screen.findByLabelText(
      'Sort by Url Ascending',
    )

    await userEvent.click(sortAscendingArrow)

    const rows = screen.getAllByRole('row')
    const expectedRowOrder = [
      'https://foo.bar.1.com',
      'https://foo.bar.2.com',
      'https://foo.bar.3.com',
      'https://foo.bar.4.com',
      'https://foo.bar.5.com',
    ]
    expect(rows).toHaveLength(expectedRowOrder.length + 1) // due to header
    const [_header, ...dataRows] = rows
    dataRows.forEach((row, i) => {
      expect(row).toHaveTextContent(expectedRowOrder[i])
    })
  })

  it('should sort by url descending', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    await userEvent.click(screen.getByLabelText('Sort by Url Descending'))

    const rows = screen.getAllByRole('row')
    const expectedRowOrder = [
      'https://foo.bar.6.com',
      'https://foo.bar.5.com',
      'https://foo.bar.4.com',
      'https://foo.bar.3.com',
      'https://foo.bar.2.com',
    ]
    expect(rows).toHaveLength(expectedRowOrder.length + 1) // due to header
    const [_header, ...dataRows] = rows
    dataRows.forEach((row, i) => {
      expect(row).toHaveTextContent(expectedRowOrder[i])
    })
  })
})

describe('Table Filtering', () => {
  it('should allow searching by name', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    await userEvent.type(screen.getByLabelText('Search by Name'), 'foo.bar.1')

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(2)
    const [_header, row] = rows
    expect(row).toHaveTextContent('foo.bar.1')
  })

  it('should allow searching by url', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    await userEvent.type(
      screen.getByLabelText('Search by Url'),
      'https://foo.bar.1.com',
    )

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(2)
    const [_header, row] = rows
    expect(row).toHaveTextContent('https://foo.bar.1.com')
  })

  it('should show no items found if search could not be matched', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    await userEvent.type(screen.getByLabelText('Search by Url'), 'not found')

    expect(screen.getByLabelText('No items found')).toBeInTheDocument()
  })

  it('should allow filtering by all status', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    await userEvent.click(
      within(screen.getByLabelText('Select Status Category')).getByRole(
        'combobox',
      ),
    )

    let listbox = within(screen.getByRole('listbox'))

    await userEvent.click(listbox.getByText('Used'))

    const [_header1, ...dataRows] = screen.getAllByRole('row')
    const usedRows = mockCollectorTargets.filter(t => !!t.teamId)
    expect(dataRows).toHaveLength(usedRows.length)

    // changing back to all
    await userEvent.click(
      within(screen.getByLabelText('Select Status Category')).getByRole(
        'combobox',
      ),
    )

    listbox = within(screen.getByRole('listbox'))

    await userEvent.click(listbox.getByText('All'))
    const [_header2, ...newDataRows] = screen.getAllByRole('row')
    const firstPageRows = mockCollectorTargets.slice(0, defaultRowsPerPage)
    expect(newDataRows).toHaveLength(firstPageRows.length)
  })

  it('should allow filtering by used status', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    await userEvent.click(
      within(screen.getByLabelText('Select Status Category')).getByRole(
        'combobox',
      ),
    )

    const listbox = within(screen.getByRole('listbox'))

    await userEvent.click(listbox.getByText('Used'))

    const [_header, ...dataRows] = screen.getAllByRole('row')
    expect(dataRows).toHaveLength(
      mockCollectorTargets.filter(t => !!t.teamId).length,
    )
    dataRows.forEach(row => {
      expect(row).toHaveTextContent('foo.bar.1')
    })
  })

  it('should allow filtering by unused status', async () => {
    RenderWithWrapper(
      <CollectorTargetsReportTable collectorTargets={mockCollectorTargets} />,
    )

    await userEvent.click(
      within(screen.getByLabelText('Select Status Category')).getByRole(
        'combobox',
      ),
    )

    const listbox = within(screen.getByRole('listbox'))

    await userEvent.click(listbox.getByText('Unused'))

    const [_header, ...dataRows] = screen.getAllByRole('row')
    expect(dataRows).toHaveLength(
      mockCollectorTargets.filter(t => !t.teamId).length,
    )
    dataRows.forEach(row => {
      expect(row).not.toHaveTextContent('foo.bar.1')
    })
  })
})
