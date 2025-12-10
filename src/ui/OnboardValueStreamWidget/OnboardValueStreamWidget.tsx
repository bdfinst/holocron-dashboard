import { Stack, TableCell, TableRow } from '@mui/material'
import {
  useCurrentUserPermissions,
  useGroupEntityRouteParams,
  useAPIContext,
  ValueStream,
  deleteValueStream,
} from 'api'
import { useCallback } from 'react'
import GroupEntityDeleteButton from 'utils/GroupEntityDeleteButton'
import GroupEntityTable from 'utils/GroupEntityTable'
import {
  GroupEntityUpdateButton,
  GroupEntityViewCostMetricsButton,
  GroupEntityViewMetricsButton,
} from 'utils/GroupEntityLinkButtons'

const OnboardValueStreamWidget = () => {
  const { valueStreamList, featureFlags } = useAPIContext()
  const {
    canCreateValueStream,
    canUpdateValueStream,
    canDeleteValueStream,
    canViewValueStreamMetrics,
    canViewValueStreamCostMetrics,
  } = useCurrentUserPermissions()
  const { getVSParamsForVSId } = useGroupEntityRouteParams()

  const renderRow = useCallback(
    (valueStream: ValueStream) => {
      const { organizationName } = getVSParamsForVSId(valueStream.id)
      return (
        <TableRow key={valueStream.id}>
          <TableCell>{organizationName}</TableCell>
          <TableCell>{valueStream.name}</TableCell>
          <TableCell>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="center"
              alignItems="center"
            >
              <GroupEntityDeleteButton<ValueStream>
                canDelete={canDeleteValueStream(valueStream.id)}
                apiDeleteFn={deleteValueStream}
                groupEntityCategory="value stream"
                groupEntity={valueStream}
              />
              <GroupEntityUpdateButton
                hasAccess={canUpdateValueStream(valueStream.id)}
                link={`/admin/update-valuestream/${organizationName}/${valueStream.name}`}
                groupEntityCategory="value stream"
                groupEntityName={valueStream.name}
              />
              <GroupEntityViewMetricsButton
                hasAccess={canViewValueStreamMetrics(valueStream.id)}
                link={`/delivery-metrics/${organizationName}/${valueStream.name}`}
                groupEntityCategory="value stream"
                groupEntityName={valueStream.name}
              />
              {featureFlags.FEATURE_COST_METRICS &&
                canViewValueStreamCostMetrics(valueStream.id) && (
                  <GroupEntityViewCostMetricsButton
                    hasAccess
                    link={`/costs/${organizationName}/${valueStream.name}`}
                    groupEntityCategory="value stream"
                    groupEntityName={valueStream.name}
                  />
                )}
            </Stack>
          </TableCell>
        </TableRow>
      )
    },
    [
      canUpdateValueStream,
      canDeleteValueStream,
      getVSParamsForVSId,
      canViewValueStreamMetrics,
      canViewValueStreamCostMetrics,
      featureFlags.FEATURE_COST_METRICS,
    ],
  )

  return (
    <GroupEntityTable<ValueStream>
      canCreate={canCreateValueStream()}
      columns={[
        {
          title: 'Organization',
          tipText: 'What Organization a Value Stream belongs to',
          align: 'left',
        },
        {
          title: 'Value Stream',
          tipText: 'Name of the Value Stream',
          align: 'left',
        },
        {
          title: 'Actions',
          align: 'center',
        },
      ]}
      entities={valueStreamList}
      groupEntityCategory="value stream"
      addGroupEntityLink="/admin/add-valuestream"
      renderRow={renderRow}
    />
  )
}

export default OnboardValueStreamWidget
