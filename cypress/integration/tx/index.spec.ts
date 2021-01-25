/// <reference types="cypress" />

context('Transaction Page', () => {
  const hash = '1'
  beforeEach(() => {
    cy.visit(`/tx/${hash}`)
  })

  it('cy.title() - get the title', () => {
    cy.title().should('include', 'Agera')
  })

  it('main content', () => {
    cy.get('main').should('contain', `Transaction Info of ${hash}`)
  })
})
