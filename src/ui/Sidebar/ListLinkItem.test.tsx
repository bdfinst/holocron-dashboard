import { screen } from '@testing-library/react'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'

import ListLinkItem from './ListLinkItem'

describe('Menu items', () => {
  it('Should render link with Home text and icon', () => {
    RenderWithWrapper(
      <ListLinkItem icon={<img alt="" />} to="/" primary="Home" />,
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
  })
  it('Should show an admin option', () => {
    RenderWithWrapper(
      <ListLinkItem icon={<img alt="" />} to="/admin" primary="Admin" />,
    )
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })
})
