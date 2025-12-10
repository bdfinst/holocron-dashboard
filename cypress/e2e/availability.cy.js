describe('Test page availability', () => {
  beforeEach(() => {
    cy.intercept('*', req => {
      req.headers.authorization = Cypress.env('token')
    })
  })

  const screenshotFolderName = 'test_page_availability'

  it('can reach the frontend', () => {
    // all the requests frontend should initially be making
    // when user visit the page.
    cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
    cy.intercept('GET', '**/api/v3/users').as('getUsers')
    cy.intercept('GET', '**/api/v3/teams').as('getTeams')
    cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
    cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
    cy.visit('/')
    cy.wait(
      [
        '@getSystemConfig',
        '@getUsers',
        '@getTeams',
        '@getValueStreams',
        '@getOrganizations',
      ],
      { timeout: 300000 },
    ).then(() => {
      // should be able to see the main logo on the header
      cy.get(`[aria-label='Holocron Logo']`).should('be.visible')
      cy.screenshot(`${screenshotFolderName}/can_reach_the_frontend`)
    })
  })
})
