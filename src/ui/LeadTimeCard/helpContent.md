# Lead Time & Throughput

## Definition

- [Lead time](https://dojoconsortium.org/metrics/lead-time/) is the total time between when a request is added to the backlog and when it is delivered to the end-user.
- [Throughput](https://dojoconsortium.org/metrics/velocity/): The average number of issues related to new features or maintenance delivered to production

## Goal of Measuring

- Delivering more, smaller batches of work makes it more likely that we'll deliver things that are needed and less likely we'll deliver things that are not needed.
- Long lead times mean that the work on the backlog is less likely to be relevant when it is finally delivered.
- More, smaller tasks give us faster product and quality feedback so we can adjust more rapidly.

## Tips for Improvement

- Comparing lead time to throughput can give insights into planning issues. A continually growing backlog indicates an over-allocated team and steps should be taken to reorganize the team or
  improve efficiency to reduce the effort required to deliver and improve customer satisfaction.
- If throughput and lead time are both increasing, this can be a warning of future burnout as the team attempts to
  compensate for too much work being accepted into the flow.
- Review stale stories on the backlog to see if they are still needed and remove them if not

## Data Source

Data is aggregated from the workflow management tools used by the organization

## Data Quality Issues

If work is not added to the backlog when requested and / or the work is not tracked as it is done then the reporting will not reflect reality.
