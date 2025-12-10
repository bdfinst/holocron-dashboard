import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Organizations from '__mocks__/Organizations'
import RenderWithWrapper from '__mocks__/RenderWithWrapper'
import { Route } from 'react-router-dom'
import { GroupEntityAddButton, GroupEntityUpdateButton } from '.'

const [organization] = Organizations.result

describe('GroupEntityLinkButtons', () => {
  describe('Button permissions', () => {
    it('should allow users with permissions to click the button', () => {
      RenderWithWrapper(
        <>
          <GroupEntityUpdateButton
            hasAccess
            groupEntityCategory="organization"
            groupEntityName={organization.name}
            link="/path/to/org-settings"
          />
          <GroupEntityAddButton
            hasAccess
            groupEntityCategory="organization"
            link="/path/to/add-org"
          />
        </>,
      )

      expect(
        screen.getByLabelText(`update-organization-${organization.name}`),
      ).toBeEnabled()
      expect(screen.getByLabelText('Add organization')).toBeEnabled()
    })

    it('should not allow users without permissions to click the buttons', () => {
      RenderWithWrapper(
        <>
          <GroupEntityUpdateButton
            hasAccess={false}
            groupEntityCategory="organization"
            groupEntityName={organization.name}
            link="/path/to/org-settings"
          />
          <GroupEntityAddButton
            hasAccess={false}
            groupEntityCategory="organization"
            link="/path/to/add-org"
          />
        </>,
      )

      expect(
        screen.getByLabelText(`update-organization-${organization.name}`),
      ).toBeDisabled()
      expect(screen.getByLabelText('Add organization')).toBeDisabled()
    })
  })

  describe('Button functionality', () => {
    it('should redirect to the said link', async () => {
      RenderWithWrapper(null, { initialEntries: ['/'] }, [
        <Route
          key="group-home"
          path="/"
          element={
            <GroupEntityUpdateButton
              hasAccess
              groupEntityCategory="organization"
              groupEntityName={organization.name}
              link="/path/to/org-settings"
            />
          }
        />,
        <Route
          key="new-group-page"
          path="/path/to/org-settings"
          element={<div>Other Org Settings</div>}
        />,
      ])

      await userEvent.click(
        screen.getByLabelText(`update-organization-${organization.name}`),
      )
      expect(screen.getByText('Other Org Settings')).toBeInTheDocument()
    })
  })
})
