const reactComponentUpdateTimeout = 120000

describe('Test team CRUD', () => {
  const screenshotFolderName = 'test_team_crud'

  let organization, valueStream, team, mockUser

  beforeEach(() => {
    cy.intercept('*', req => {
      req.headers.authorization = Cypress.env('token')
    })
  })

  after(() => {
    cy.apiTearDownGroupEntities(organization, valueStream, team)
  })

  before(() => {
    cy.apiCreateMockUser()
      .then(response => {
        expect(response.status).to.eq(200)
        mockUser = JSON.parse(response.headers['x-user'])
        return cy.apiCreateOrganization({
          name: cy.utils.randomName(8),
          userIds: [mockUser.id],
        })
      })
      .then(response => {
        expect(response.status).to.eq(201)
        organization = response.body
        return cy.apiCreateValueStream({
          name: cy.utils.randomName(8),
          userIds: [mockUser.id],
          organizationId: organization.id,
        })
      })
      .then(response => {
        expect(response.status).to.eq(201)
        valueStream = response.body
      })
  })

  it('can create a team', () => {
    cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
    cy.intercept('GET', '**/api/v3/users').as('getUsers')
    cy.intercept('GET', '**/api/v3/teams').as('getTeams')
    cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
    cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
    cy.intercept('GET', '**/api/v3/ticket-boards?per_page=1000').as('getBoards')
    cy.intercept('GET', '**/api/v3/repositories?per_page=1000').as('getRepos')
    cy.intercept('GET', '**/api/v3/pipelines?per_page=1000').as('getPipelines')
    cy.intercept('GET', '**/api/v3/projects?per_page=1000').as('getProjects')
    cy.visit('/admin/add-team')
    cy.wait(
      [
        '@getSystemConfig',
        '@getUsers',
        '@getTeams',
        '@getValueStreams',
        '@getOrganizations',
        '@getBoards',
        '@getRepos',
        '@getPipelines',
        '@getProjects',
      ],
      { timeout: 300000 },
    )
      .then(() => {
        cy.get(`[id="select-organization"]`).type(
          `${organization.name}{downarrow}{enter}`,
        )
        cy.get(`[id="select-value-stream"]`).type(
          `${valueStream.name}{downarrow}{enter}`,
        )
        cy.get(`[id="enter-your-team-name"]`).type(cy.utils.randomName(8))
        cy.get(`[id="enter-the-number-of-members-in-your-team"]`).type('1')
        cy.pickOptionMUIAutocomplete(`[id="select-team-admins"]`)

        cy.screenshot(`${screenshotFolderName}/can_create_a_team_pending`)

        cy.intercept('POST', '**/api/v3/teams').as('createTeam')

        cy.get('form').submit()
        return cy.wait(
          [
            '@createTeam',
            '@getSystemConfig',
            '@getUsers',
            '@getTeams',
            '@getValueStreams',
            '@getOrganizations',
          ],
          { timeout: 300000 },
        )
      })
      .spread(createTeam => {
        expect(createTeam.response.statusCode).to.eq(201)
        team = createTeam.response.body
        cy.url().should('include', '/admin')
        cy.get('[aria-label="Search team by name"]')
          .scrollIntoView()
          .should('be.visible')
        cy.get('[aria-label="Search team by name"]').type(team.name)
        cy.get(`[aria-label="update-team-${team.name}"]`, {
          timeout: reactComponentUpdateTimeout,
        }).should('be.visible')
        cy.get(`[aria-label="delete-team-${team.name}"]`, {
          timeout: reactComponentUpdateTimeout,
        }).should('be.visible')
        cy.screenshot(`${screenshotFolderName}/can_create_a_team_done`)
      })
  })

  it('can update a team', () => {
    cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
    cy.intercept('GET', '**/api/v3/users').as('getUsers')
    cy.intercept('GET', '**/api/v3/teams').as('getTeams')
    cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
    cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
    cy.visit(
      `/admin/update-team/${organization.name}/${valueStream.name}/${team.name}`,
    )
    cy.wait(
      [
        '@getSystemConfig',
        '@getUsers',
        '@getTeams',
        '@getValueStreams',
        '@getOrganizations',
      ],
      { timeout: 300000 },
    )
      .then(() => {
        cy.get(`[id="enter-the-number-of-members-in-your-team"]`).type(
          '{backspace}2',
        )
        cy.screenshot(`${screenshotFolderName}/can_update_a_team_pending`)
        cy.intercept('PUT', `**/api/v3/teams/${team.id}`).as('updateTeam')
        cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
        cy.intercept('GET', '**/api/v3/users').as('getUsers')
        cy.intercept('GET', '**/api/v3/teams').as('getTeams')
        cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
        cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
        cy.get('form').submit()

        return cy.wait(
          [
            '@updateTeam',
            '@getSystemConfig',
            '@getUsers',
            '@getTeams',
            '@getValueStreams',
            '@getOrganizations',
          ],
          { timeout: 300000 },
        )
      })
      .spread(updateTeam => {
        expect(updateTeam.response.statusCode).to.eq(200)
        cy.get('[aria-label="Search team by name"]')
          .scrollIntoView()
          .should('be.visible')
        cy.get('[aria-label="Search team by name"]').type(team.name)
        cy.get(`[aria-label="update-team-${team.name}"]`)
          .should('be.visible')
          .click()
      })
      .then(() => {
        cy.get(`[id="enter-the-number-of-members-in-your-team"]`, {
          timeout: reactComponentUpdateTimeout,
        })
          .scrollIntoView()
          .should('be.visible')
          .and('have.value', '2')
        cy.screenshot(`${screenshotFolderName}/can_update_a_team_done`)
      })
  })

  it('can delete a team', () => {
    cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
    cy.intercept('GET', '**/api/v3/users').as('getUsers')
    cy.intercept('GET', '**/api/v3/teams').as('getTeams')
    cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
    cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
    cy.visit('/admin', { timeout: 60000 })
    cy.get('[aria-label="Search team by name"]').type(team.name)
    cy.get(`[aria-label="delete-team-${team.name}"]`).click()
    cy.get(`[aria-labelledby="confirm-dialog"]`).should('exist')
    cy.get(`[aria-label="Enter ${team.name} to Confirm Action"]`).type(
      team.name,
    )

    cy.screenshot(`${screenshotFolderName}/can_delete_a_team_pending`)

    cy.intercept('DELETE', `**/api/v3/teams/${team.id}`).as('deleteTeam')
    cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
    cy.intercept('GET', '**/api/v3/users').as('getUsers')
    cy.intercept('GET', '**/api/v3/teams').as('getTeams')
    cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
    cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
    cy.get(`[aria-label="Yes Button"]`).click()

    cy.wait(
      [
        '@deleteTeam',
        '@getSystemConfig',
        '@getUsers',
        '@getTeams',
        '@getValueStreams',
        '@getOrganizations',
      ],
      { timeout: 300000 },
    ).spread(deleteTeam => {
      expect(deleteTeam.response.statusCode).to.eq(204)
      cy.get(`[aria-labelledby="confirm-dialog"]`).should('not.exist')
      cy.get(`[aria-label="delete-team-${team.name}"]`).should('not.exist')

      cy.screenshot(`${screenshotFolderName}/can_delete_a_team_done`)
    })
  })
})
