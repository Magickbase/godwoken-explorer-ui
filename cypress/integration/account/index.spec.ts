/// <reference types="cypress" />

context.skip('Account Page', () => {
  let id: number

  // before(() => {
  // cy.fixture('accountIds')
  //   .then(ids => {
  //     id = ids.user
  //   })
  //   .then(() => {
  //     cy.visit(`/en-US/account/${id}`)
  //   })
  // })

  describe.skip('general sets', () => {
    it.skip('cy.title() - get the title', () => {
      cy.title().should('include', 'Godwoken Explorer')
    })
  })

  describe.skip('basic info', () => {
    it('should have id', () => {
      cy.get(`h2[aria-label='account']`).should('have.text', `account${id}`)
    })
    it('should have ckb balance', () => {
      cy.get(`span[aria-label='CKB']`).should('have.text', 'CKB')
      cy.get(`span[aria-label='CKB']+span`)
        .invoke('text')
        .then(ckb => isNaN(+ckb.replace(/,/g, '')))
        .should('be.false')
    })

    it('should have eth balance', () => {
      cy.get(`span[aria-label='ETH']`).should('have.text', 'ETH')
      cy.get(`span[aria-label='ETH']+span`)
        .invoke('text')
        .then(eth => isNaN(+eth.replace(/,/g, '')))
        .should('be.false')
    })

    it('should have transaction count which is a link to transaction list', () => {
      cy.get(`span[aria-label='transaction count']`).should('have.text', 'transaction count')
    })
  })
})
