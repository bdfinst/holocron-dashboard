import { Stack, TableCell, TableRow } from '@mui/material'
import {
  Organization,
  deleteOrganization,
  useCurrentUserPermissions,
  useAPIContext,
} from 'api'
import { useCallback } from 'react'
import GroupEntityDeleteButton from 'utils/GroupEntityDeleteButton'
import GroupEntityTable from 'utils/GroupEntityTable'
import {
  GroupEntityUpdateButton,
  GroupEntityViewCostMetricsButton,
  GroupEntityViewMetricsButton,
} from 'utils/GroupEntityLinkButtons'

const OnboardOrganizationWidget = () => {
  const { organizationList, featureFlags } = useAPIContext()
  const {
    canCreateOrganization,
    canUpdateOrganization,
    canDeleteOrganization,
    canViewOrganizationMetrics,
    canViewOrganizationCostMetrics,
  } = useCurrentUserPermissions()

  const renderRow = useCallback(
    (organization: Organization) => (
      <TableRow key={organization.id}>
        <TableCell>{organization.name}</TableCell>
        <TableCell>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="center"
            alignItems="center"
          >
            <GroupEntityDeleteButton<Organization>
              canDelete={canDeleteOrganization(organization.id)}
              apiDeleteFn={deleteOrganization}
              groupEntityCategory="organization"
              groupEntity={organization}
            />
            <GroupEntityUpdateButton
              hasAccess={canUpdateOrganization(organization.id)}
              groupEntityName={organization.name}
              groupEntityCategory="organization"
              link={`/admin/update-organization/${organization.name}`}
            />
            <GroupEntityViewMetricsButton
              hasAccess={canViewOrganizationMetrics(organization.id)}
              groupEntityName={organization.name}
              groupEntityCategory="organization"
              link={`/delivery-metrics/${organization.name}`}
            />
            {featureFlags.FEATURE_COST_METRICS &&
              canViewOrganizationCostMetrics(organization.id) && (
                <GroupEntityViewCostMetricsButton
                  hasAccess
                  groupEntityName={organization.name}
                  groupEntityCategory="organization"
                  link={`/costs/${organization.name}`}
                />
              )}
          </Stack>
        </TableCell>
      </TableRow>
    ),
    [
      canUpdateOrganization,
      canDeleteOrganization,
      canViewOrganizationMetrics,
      canViewOrganizationCostMetrics,
      featureFlags.FEATURE_COST_METRICS,
    ],
  )

  return (
    <GroupEntityTable<Organization>
      canCreate={canCreateOrganization()}
      columns={[
        {
          title: 'Organization',
          tipText: 'Name of the organization',
          align: 'left',
        },
        {
          title: 'Actions',
          align: 'center',
        },
      ]}
      entities={organizationList}
      groupEntityCategory="organization"
      addGroupEntityLink="/admin/add-organization"
      renderRow={renderRow}
    />
  )
}

export default OnboardOrganizationWidget
