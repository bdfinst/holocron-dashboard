# Code Review Trend

## Definition

Tracks the trend of how long (in days) until the merge request is merged.

## Goal of Measuring

For CI to be effective, code reviews should be processed ASAP.

## Tips for Improvement

In regulated environments, it's often a compliance requirement that at least two people are involved with every change. Code review is the least impactful way to do this.

There are three basic flows for code review:

- **Pair Programming**: This is the most efficient form of code review because there is no wait for the code review to start. Waiting between process steps is where most waste occurs.
- **Synchronous Peer Review**: This is the process where the reviewer and the developer collaborate to review the code at the same time. This eliminates misunderstandings and minor corrections can be accomplished during the review. This is less efficient than pairing.
- **Asynchronous Peer Review**: This is the process where a code review is requested and then a reviewer reviews the code and then submits questions and comments back to the developer. This flow is the least efficient flow of code review and can lead to many back-and-forth cycles with corresponding delays between each. this is not recommended for teams wishing to be high-performing.

## Data Source

- Data is averaged from the team's source repositories.

## Possible Data Quality Issues

- If the team has not listed all of its source repositories, this could be inaccurate.
