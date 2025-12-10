import { screen } from '@testing-library/react'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import userEvent from '@testing-library/user-event'
import { useAPIContext } from 'api'
import Sidebar from '.'
import { OrgLeadershipUserRoutes } from './routes'

jest.mock('ui/HeaderBar', () => ({
  __esModule: true,
  ConfigurationButtons: [
    { key: 'button', render: () => <div data-testid="config-button" /> },
  ],
}))

jest.mock('ui/DeliveryMetricsDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="DeliveryMetricsDashboard" />,
}))

jest.mock('ui/CostMetricsHomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="CostMetricsHomePage" />,
}))

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock

describe('Menu drawer', () => {
  describe('basic user and sidebar functionality', () => {
    beforeEach(() => {
      useAPIContextMock.mockReturnValue({
        featureFlags: { FEATURE_COST_METRICS: true },
        currentUser: {
          isAdmin: false,
          isOrgLeadership: false,
        },
      })
    })

    it('Should render drawer open with a close button and at least one link', () => {
      RenderWithWrapper(<Sidebar onClick={jest.fn()} open />)
      expect(screen.getAllByLabelText(/close drawer/i)[0]).toBeInTheDocument()
      expect(screen.getAllByLabelText(/close drawer/i)[1]).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')[0]).toBeInTheDocument()
    })

    it('should not show privileged options to users without permission', () => {
      RenderWithWrapper(<Sidebar onClick={jest.fn()} open />)
      OrgLeadershipUserRoutes.forEach(({ sidebarName }) => {
        expect(
          screen.queryByRole('link', { name: sidebarName }),
        ).not.toBeInTheDocument()
      })
    })

    it('Should call onClick function when click is outside of drawer', async () => {
      const mockClose = jest.fn()
      RenderWithWrapper(<Sidebar onClick={mockClose} open />)
      await userEvent.click(screen.getByLabelText('backdrop'))
      expect(mockClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Org Leadership user sidebar', () => {
    beforeEach(() => {
      useAPIContextMock.mockReturnValue({
        featureFlags: { FEATURE_COST_METRICS: true },
        currentUser: {
          isAdmin: false,
          isOrgLeadership: true,
        },
      })
    })

    it('should show privileged options for org leader', () => {
      RenderWithWrapper(<Sidebar onClick={jest.fn()} open />)
      OrgLeadershipUserRoutes.forEach(({ sidebarName }) => {
        expect(
          screen.getByRole('link', { name: sidebarName }),
        ).toBeInTheDocument()
      })
    })
  })
})
