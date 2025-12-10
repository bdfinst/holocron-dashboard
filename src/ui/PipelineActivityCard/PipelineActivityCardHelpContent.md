# Pipeline Activity

This provides a tactical view of repository activity to help with CI practices. Our primary focus is to keep pipelines clean so that we can deploy changes on demand.

- **Build Status**: If any build is broken or has warning this will alert. The list of broken pipelines can be found in the detail view.
- **Stale Branches**: Branches that have not been removed within 24 hours of creation. Good practice for CI is that branches are short-lived. List of old branches can be found in the detail view.
- **Stale Code Reviews**: Code reviews that are open for more than 1 hour. Good practice for CI is to process code reviews ASAP when paired programming is not being used. The list of old code reviews can be found in the detail view.
- **Stale Pipelines**: Pipelines that have not run in the last 7 days. Pipelines can become broken due to new security findings. Good practice is to schedule builds at least once per week to identify new security findings early. Details of the stale pipelines can be found in the detail view.

## Data Source

Data is aggregated from the source repository and build information

## Possible Data Quality Issues

- Not all repositories are aligned to the team
- Not all pipelines are aligned to the team
