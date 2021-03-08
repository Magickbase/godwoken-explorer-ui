/// <reference types="cypress" />

context.skip('Block Page', () => {
  const hash = '1'
  beforeEach(() => {
    cy.visit(`/block/${hash}`)
  })

  it('cy.title() - get the title', () => {
    cy.title().should('include', 'Godwoken Explorer')
  })

  it('main content', () => {
    // cy.get('main').should('contain', `Block Info of ${hash}`)
  })
})
