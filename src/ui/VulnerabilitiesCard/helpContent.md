# Software Vulnerability

## Definition

- [Software Vulnerability](https://csrc.nist.gov/glossary/term/software_vulnerability) is a security flaw, glitch or weakness found in software code that could be exploited by an attacker.

## Goal of Measuring

- If vulnerabilities are increasing as more code is being committed to projects, then teams need to take action to mitigate vulnerabilities.
- If vulnerabilities are decreasing or steady, then the team is in good shape of maintaining their project while they are producing features.
- Ideally, there should be a decreasing trend or 0 vulnerabilities trend for the current week in high severity vulnerabilities which can be seen in the detailed view of this graph. The medium and low severity vulnerability are not a priority, but could be mitigated as well with patches in dependency or code improvements.

## Tips for Improvement

- Review vulnerabilities and fix them as needed using tools such as Sonarqube, Fority, Anchor etc.
- The only cases when high severity vulnerability trend rising are acceptable are if they are dev dependencies. Patch all vulnerabilities whether in the code or in a dependency.

## Data Source

Data is not aggregated and only shown in team view from code scanning tools such as Sonarqube, Fortify, Anchor etc.
