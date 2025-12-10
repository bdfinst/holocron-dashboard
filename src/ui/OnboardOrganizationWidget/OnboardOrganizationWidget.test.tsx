import { screen } from '@testing-library/react'
import { useCurrentUserPermissions, useAPIContext } from 'api'
import Organizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import OnboardOrganizationWidget from './OnboardOrganizationWidget'

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  useAPIContext: jest.fn(),
  useCurrentUserPermissions: jest.fn(),
}))

const useAPIContextMock = useAPIContext as jest.Mock
const useCurrentUserPermissionsMock = useCurrentUserPermissions as jest.Mock

beforeAll(() => {
  useAPIContextMock.mockReturnValue({
    organizationList: Organizations.result,
    featureFlags: { FEATURE_COST_METRICS: true },
  })
  useCurrentUserPermissionsMock.mockReturnValue({
    canCreateOrganization: jest.fn().mockReturnValue(true),
    canUpdateOrganization: jest.fn().mockReturnValue(true),
    canDeleteOrganization: jest.fn().mockReturnValue(true),
    canViewOrganizationMetrics: jest.fn().mockReturnValue(true),
    canViewOrganizationCostMetrics: jest.fn().mockReturnValue(true),
  })
})

describe('OnboardOrganizationWidget', () => {
  it('should render with the list and the action buttons for each organization', () => {
    RenderWithWrapper(<OnboardOrganizationWidget />)

    Organizations.result.forEach(org => {
      expect(
        screen.getByLabelText(`delete-organization-${org.name}`),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(`update-organization-${org.name}`),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(`view-metrics-organization-${org.name}`),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(`view-cost-metrics-organization-${org.name}`),
      ).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Add organization')).toBeInTheDocument()
  })
})
