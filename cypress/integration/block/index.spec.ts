/// <reference types="cypress" />

context('Block Page', () => {
  const hash = 'hash'
  beforeEach(() => {
    cy.visit(`/block/${hash}`)
  })

  it('cy.title() - get the title', () => {
    cy.title().should('include', 'Agera')
  })

  it('main content', () => {
    cy.get('main').should('contain', `Block Info of ${hash}`)
  })
})
