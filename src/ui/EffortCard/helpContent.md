# Relative Effort

## Definition

Relative effort is measured by the number of person-days spent per week on each type of work:

- **New features**: Any work that is focused on delivering new capabilities to the end-user.
- **Defects**: Any issues related to repairing issues that were delivered to production. These could be user reported or self-reported.
- **Maintenance**: Work related to housekeeping such as updating dependencies, reducing application complexity, improving delivery automation, or working on team improvement items.
- **Unplanned work**: Work other than defects that causes us to react and context switch from planned work. This can include walk-ups, urgent customer requests, etc.
- **Person-days**: The number of days between when something started and was completed excluding weekends.

## Goal of Measuring

- **Capacity planning**: Understand the team's capacity for new work and identify when excessive defects or unplanned work is impacting the ability to sustainably deliver value.
- **Identify future issues**: The goal is to maintain a healthy ratio of new features to maintenance. If work is focused only on new features at the expense of maintenance, then defects and unplanned work will steadily increase.

## Data Source

Data is aggregated from the workflow management tools used by the organization. Use issue types in Jira or issue labels in GitLab to identify the types of work.

- Unplanned: `Unplanned`
- Maintenance: `Maintenance`
- Defects: `Bug` or `Anomaly`

All other types are assumed to be feature work.

## Possible Data Quality Issues

- The wrong issue type is used for work
- Issues are not updated when their status changes
- When pairing or mobbing, not everyone is represented on the issue.
