const reactComponentUpdateTimeout = 10000

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
    // intercept these requests to wait when visiting add team page
    cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
    cy.intercept('GET', '**/api/v3/users').as('getUsers')
    cy.intercept('GET', '**/api/v3/teams').as('getTeams')
    cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
    cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
    cy.intercept('GET', '**/api/v3/ticket-boards').as('getBoards')
    cy.intercept('GET', '**/api/v3/repositories').as('getRepos')
    cy.intercept('GET', '**/api/v3/pipelines').as('getPipelines')
    cy.intercept('GET', '**/api/v3/projects').as('getProjects')
    cy.visit('/admin/add-team')

    // when all the requests are done being made
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
        // fill out the form
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

        // submit, wait for request fo finish and assert that team was created
        cy.intercept('POST', '**/api/v3/teams').as('createTeam')
        cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
        cy.intercept('GET', '**/api/v3/users').as('getUsers')
        cy.intercept('GET', '**/api/v3/teams').as('getTeams')
        cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
        cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
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
        // the update and delete button for the team should be visible if the team is created
        cy.get(`[aria-label="update-team-${team.name}"]`, {
          timeout: reactComponentUpdateTimeout,
        })
        cy.get(`[aria-label="delete-team-${team.name}"]`, {
          timeout: reactComponentUpdateTimeout,
        })
        cy.screenshot(`${screenshotFolderName}/can_create_a_team_done`)
      })
  })

  it('can update a team', () => {
    // intercept these requests to wait when visiting update team page
    cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
    cy.intercept('GET', '**/api/v3/users').as('getUsers')
    cy.intercept('GET', '**/api/v3/teams').as('getTeams')
    cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
    cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
    cy.intercept('GET', '**/api/v3/ticket-boards').as('getBoards')
    cy.intercept('GET', '**/api/v3/repositories').as('getRepos')
    cy.intercept('GET', '**/api/v3/pipelines').as('getPipelines')
    cy.intercept('GET', '**/api/v3/projects').as('getProjects')
    cy.visit(
      `/admin/update-team/${organization.name}/${valueStream.name}/${team.name}`,
    )

    // when all the requests are done being made
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
        // update the form (i.e. change the number of members in team)
        cy.get(`[id="enter-the-number-of-members-in-your-team"]`).type(
          '{backspace}2',
        )
        cy.screenshot(`${screenshotFolderName}/can_update_a_team_pending`)
        // submit, wait for request to finish
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
        cy.get('[aria-label="Search team by name"]').type(team.name)
        // wait for requests to finish after revisiting update
        // page
        cy.intercept('GET', '**/api/v3/ticket-boards').as('getBoards')
        cy.intercept('GET', '**/api/v3/repositories').as('getRepos')
        cy.intercept('GET', '**/api/v3/pipelines').as('getPipelines')
        cy.intercept('GET', '**/api/v3/projects').as('getProjects')
        cy.get(`[aria-label="update-team-${team.name}"]`).click()

        return cy.wait(
          ['@getBoards', '@getRepos', '@getPipelines', '@getProjects'],
          { timeout: 300000 },
        )
      })
      .then(() => {
        // the configuration should have changed by our change
        cy.get(`[id="enter-the-number-of-members-in-your-team"]`).should(
          'have.value',
          '2',
          { timeout: reactComponentUpdateTimeout },
        )
        cy.screenshot(`${screenshotFolderName}/can_update_a_team_done`)
      })
  })

  it('can delete a team', () => {
    // visit admin page
    cy.intercept('GET', '**/api/v3/system-config').as('getSystemConfig')
    cy.intercept('GET', '**/api/v3/users').as('getUsers')
    cy.intercept('GET', '**/api/v3/teams').as('getTeams')
    cy.intercept('GET', '**/api/v3/value-streams').as('getValueStreams')
    cy.intercept('GET', '**/api/v3/organizations').as('getOrganizations')
    cy.visit('/admin')
    // search team in the team search box
    cy.get('[aria-label="Search team by name"]').type(team.name)
    // click the delete button
    cy.get(`[aria-label="delete-team-${team.name}"]`).click()
    cy.get(`[aria-labelledby="confirm-dialog"]`).should('exist')
    cy.get(`[aria-label="Enter ${team.name} to Confirm Action"]`).type(
      team.name,
    )

    cy.screenshot(`${screenshotFolderName}/can_delete_a_team_pending`)

    // confirm delete by pressing yes button
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
