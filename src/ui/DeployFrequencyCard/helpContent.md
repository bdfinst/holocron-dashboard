# Deploy Frequency

## Definition

- [Delivery Frequency](https://dojoconsortium.org/metrics/release-frequency/) is the number of production deliveries made during the reporting period as a trend over time relative to the number of developers on the team.

## Goal of Measuring

Delivering smaller batches of work more frequently has several leading and lagging advantages.

- Smaller changes fail in smaller ways and give faster feedback for value delivered.
- Continuously releasing small changes allows us to verify that we have the ability to release a critical change when required without using workarounds.
- Improving this requires us to improve how we test, break down work, work as a team, etc.

## Tips for Improvement

- Improve quality gates to make them more efficient
- Improve [continuous integration](https://minimumcd.org/minimumcd/#continuous-integration) workflows.

## Data Source

Data is aggregated from pipeline activity.

## Possible Data Quality Issues

Will report low if not all pipelines are identified by the tool.
