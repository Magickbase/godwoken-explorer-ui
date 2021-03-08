/// <reference types="cypress" />

context.skip('Transaction Page', () => {
  const hash = '1'
  beforeEach(() => {
    cy.visit(`/tx/${hash}`)
  })

  it('cy.title() - get the title', () => {
    cy.title().should('include', 'Godwoken Explorer')
  })

  it('main content', () => {
    // cy.get('main').should('contain', `Transaction Info of ${hash}`)
  })
})
