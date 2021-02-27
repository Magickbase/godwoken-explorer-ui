/// <reference types="cypress" />

context('Home Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('cy.title() - get the title', () => {
    cy.title().should('include', 'Godwoken Explorer')
  })
})
