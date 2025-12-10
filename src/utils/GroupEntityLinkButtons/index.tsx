import StyledTooltip from 'utils/StyledTooltip'
import { Link } from 'react-router-dom'
import config from 'globalConfig'
import { IconButton } from '@mui/material'
import {
  AddCircleIcon,
  AttachMoneyIcon,
  GraphIcon,
  SettingsIcon,
} from 'utils/icons'

const createGroupEntityLinkButton = ({
  tooltipAction,
  Icon,
  ariaLabelPrefix,
}: {
  tooltipAction: string
  Icon: React.FC
  ariaLabelPrefix?: string
}) => {
  type GroupEntityLinkButtonProps = {
    /**
     * whether user has access to
     * the button
     */
    hasAccess: boolean
    /**
     * the group entity name for the button
     */
    groupEntityName?: string
    /**
     * category of the entity
     */
    groupEntityCategory: string
    /**
     * the link the button will redirect to on
     * press
     */
    link: string
  }

  const GroupEntityLinkButton: React.FC<GroupEntityLinkButtonProps> = ({
    hasAccess,
    groupEntityName,
    groupEntityCategory,
    link,
  }: GroupEntityLinkButtonProps) => {
    const ariaLabel = ariaLabelPrefix
      ? `${ariaLabelPrefix}-${groupEntityCategory}-${groupEntityName}`
      : `${tooltipAction} ${groupEntityCategory}`

    return hasAccess ? (
      <Link to={link}>
        <StyledTooltip
          title={`${tooltipAction} ${groupEntityCategory}`}
          placement="top"
          enterTouchDelay={config.UI_SETTINGS.TOOL_TIP_DELAY}
        >
          <IconButton aria-label={ariaLabel} size="large">
            <Icon />
          </IconButton>
        </StyledTooltip>
      </Link>
    ) : (
      <IconButton aria-label={ariaLabel} size="large" disabled>
        <Icon />
      </IconButton>
    )
  }
  return GroupEntityLinkButton
}

export const GroupEntityUpdateButton = createGroupEntityLinkButton({
  tooltipAction: 'Update',
  Icon: SettingsIcon,
  ariaLabelPrefix: 'update',
})

export const GroupEntityViewMetricsButton = createGroupEntityLinkButton({
  tooltipAction: 'View Metrics for',
  Icon: GraphIcon,
  ariaLabelPrefix: 'view-metrics',
})

export const GroupEntityViewCostMetricsButton = createGroupEntityLinkButton({
  tooltipAction: 'View Cost Metrics for',
  Icon: AttachMoneyIcon,
  ariaLabelPrefix: 'view-cost-metrics',
})

export const GroupEntityAddButton = createGroupEntityLinkButton({
  tooltipAction: 'Add',
  Icon: AddCircleIcon,
})
