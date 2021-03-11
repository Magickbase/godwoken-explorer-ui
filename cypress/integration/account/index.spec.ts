/// <reference types="cypress" />

context('Account Page', () => {
  const id = 0
  before(() => {
    cy.visit(`/en-US/account/${id}`)
  })

  describe('general sets', () => {
    it('cy.title() - get the title', () => {
      cy.title().should('include', 'Godwoken Explorer')
    })
  })

  describe('basic info', () => {
    it('should has id', () => {
      cy.get(`h2[aria-label='account']`).should('have.text', `account${id}`)
    })
    it('should has ckb balance', () => {
      cy.get(`span[aria-label='CKB']`).should('have.text', 'CKB')
      cy.get(`span[aria-label='CKB']+span`)
        .invoke('text')
        .then(ckb => isNaN(+ckb.replace(/,/g, '')))
        .should('be.false')
    })
    it('should has transaction count which is a link to transaction list', () => {
      cy.get(`span[aria-label='transaction count']`).should('have.text', 'transaction count')
    })
  })
})
