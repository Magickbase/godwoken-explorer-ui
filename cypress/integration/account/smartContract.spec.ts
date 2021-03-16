/// <reference types="cypress" />

context('Smart Contract Account Page', () => {
  const id = 5
  before(() => {
    cy.visit(`/en-US/account/${id}`)
  })

  describe('smart contract info', () => {
    const ROOT_SELECTOR = `.card-subheader[aria-label='smart contract']`
    it('should have account type', () => {
      cy.get(ROOT_SELECTOR).should('have.text', 'account type:Smart Contract')
    })
    it.skip('should have deployed transaction which is a link', () => {
      cy.get(`${ROOT_SELECTOR}+div .card-label`).should('have.text', 'deploy transaction')
      cy.get(`${ROOT_SELECTOR}+div a[title='deploy transaction']`).should(link => {
        const hash = link.text()
        expect(link).to.have.attr('href').to.eq(`/tx/${hash}`)
      })
    })
  })

  describe.skip('asset list info', () => {
    const ROOT_SELECTOR = `.card-subheader[aria-label='user defined assets']`
    it('should have title with item count', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .children()
        .its('length')
        .then(count => {
          cy.get(ROOT_SELECTOR).should('have.text', `user defined assets:${count}`)
        })
    })

    // TODO: test each asset
  })
})
