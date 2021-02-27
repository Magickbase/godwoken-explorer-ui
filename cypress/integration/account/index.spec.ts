/// <reference types="cypress" />

context('Account Page', () => {
  const id = 1
  beforeEach(() => {
    cy.visit(`/account/${id}`)
  })

  it('cy.title() - get the title', () => {
    cy.title().should('include', 'Godwoken Explorer')
  })

  it('main content', () => {
    // cy.get('main').should('contain', `Account Info of ${id}`)
  })
})
