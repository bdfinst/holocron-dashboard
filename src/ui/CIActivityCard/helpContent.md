# Code Integration Frequency

## Definition

[Code Integration Frequency](https://dojoconsortium.org/metrics/integration-frequency/) tracks how often tested, production-worthy code changes are integrated into the trunk. The minimum threshold for [continuous integration](https://minimumcd.org/minimumcd/#continuous-integration) is at least once per day for each developer on
the team.

## Goal of Measuring

- **Reduce the size of change:** Smaller changes improve the effectiveness of code review, give faster quality feedback, and reduce the chances of defects introduced during change conflict resolution.
- **Improve work decomposition:** Solving the problem of how to deliver smaller changes uncovers issues with work decomposition. Solving the problem of work decomposition improves the quality of the requirements

## Tips for Improvement

- Use a [Continuous Integration](https://minimumcd.org/minimumcd/#continuous-integration) workflow
- Use [Behavior Driven Development](https://www.youtube.com/watch?v=9P5WG8CkPrQ) to decompose and better understand the work.
- Use [Test Driven Development](https://www.youtube.com/watch?v=ESHn53myB88) to guide smaller changes and better application architecture.
- Use [feature flags, branch by abstraction, or other techniques](https://youtu.be/v4Ijkq6Myfc?t=678) to separate deployment from release.

## Data Source

- Data is aggregated from the team's source repositories.

## Possible Data Quality Issues

- If the team has not listed all of its source repositories, this could be inaccurate.
