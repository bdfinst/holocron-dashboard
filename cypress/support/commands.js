/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const timeout = 240000

cy.utils = {
  randomName: strLen =>
    `cypress-${Math.round(36 ** (strLen + 1) - Math.random() * 36 ** strLen)
      .toString(36)
      .slice(1)}`,
}

Cypress.Commands.add('apiCreateMockUser', () => {
  cy.request({
    url: '/api/v3/collectors',
    headers: {
      Authorization: Cypress.env('token'),
    },
  })
})

Cypress.Commands.add('apiCreateOrganization', body =>
  cy.request({
    method: 'POST',
    url: `/api/v3/organizations`,
    body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: Cypress.env('token'),
    },
    failOnStatusCode: false,
  }),
)

Cypress.Commands.add('apiDeleteOrganization', organizationId =>
  cy.request({
    method: 'DELETE',
    url: `/api/v3/organizations/${organizationId}`,
    headers: {
      Authorization: Cypress.env('token'),
    },
    failOnStatusCode: false,
  }),
)

Cypress.Commands.add('apiCreateValueStream', body =>
  cy.request({
    method: 'POST',
    url: `/api/v3/value-streams`,
    body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: Cypress.env('token'),
    },
    failOnStatusCode: false,
  }),
)

Cypress.Commands.add('apiDeleteValueStream', valueStreamId =>
  cy.request({
    method: 'DELETE',
    url: `/api/v3/value-streams/${valueStreamId}`,
    headers: {
      Authorization: Cypress.env('token'),
    },
    failOnStatusCode: false,
  }),
)

Cypress.Commands.add('apiDeleteTeam', teamId =>
  cy.request({
    method: 'DELETE',
    url: `/api/v3/teams/${teamId}`,
    headers: {
      Authorization: Cypress.env('token'),
    },
    failOnStatusCode: false,
  }),
)

Cypress.Commands.add(
  'apiTearDownGroupEntities',
  (organization, valueStream, team) => {
    if (!!team && !!valueStream && !!organization) {
      return cy
        .apiDeleteTeam(team.id)
        .then(response => {
          expect(response.status).to.eq(204)
          return cy.apiDeleteValueStream(valueStream.id)
        })
        .then(response => {
          expect(response.status).to.eq(204)
          return cy.apiDeleteOrganization(organization.id)
        })
        .then(response => {
          expect(response.status).to.eq(204)
        })
    } else if (!team && !!valueStream && !!organization) {
      return cy
        .apiDeleteValueStream(valueStream.id)
        .then(response => {
          expect(response.status).to.eq(204)
          return cy.apiDeleteOrganization(organization.id)
        })
        .then(response => {
          expect(response.status).to.eq(204)
        })
    } else if (!team && !valueStream && !!organization) {
      return cy.apiDeleteOrganization(organization.id).then(response => {
        expect(response.status).to.eq(204)
      })
    }
    return cy.wrap(null)
  },
)

Cypress.Commands.add('pickOptionMUIAutocomplete', selector => {
  // select the first item in the autocomplete
  // and make sure options exist otherwise the tests will fail
  cy.get(selector).click({ force: true })
  cy.get(`li[data-option-index="0"]`).click({ force: true })
})
