/// <reference types="cypress" />

context.skip('Transaction Page', () => {
  const hash = '1'
  beforeEach(() => {
    cy.visit(`/tx/${hash}`)
  })

  describe('general sets', () => {
    it('cy.title() - get the title', () => {
      cy.title().should('include', 'Godwoken Explorer')
    })
  })

  describe('transaction info', () => {})
})
