/// <reference types="cypress" />

context.skip('Polyjuice Account Page', () => {
  before(() => {
    cy.fixture('accountIds').then(ids => cy.visit(`/en-US/account/${ids.polyjuice}`))
  })

  describe('polyjuice info', () => {
    const ROOT_SELECTOR = `.card-subheader[aria-label='polyjuice']`
    it('should have account type', () => {
      cy.get(ROOT_SELECTOR).should('have.text', 'account type:Polyjuice')
    })

    it('should have l2 script hash', () => {
      cy.get('div[data-role="script-hash"]>span:last').should(elm => {
        expect(elm.text()).to.have.length(66)
      })
    })

    describe('script', () => {
      it('should be hidden by default', () => {
        cy.get('pre').should('have.class', 'hidden')
      })
      it('should display after clicking the arrow', () => {
        cy.get(`[aria-label='toggle']`).click()
        cy.get('pre').should('not.have.class', 'hidden')
      })
      it('should be hidden after clicking the arrow again', () => {
        cy.get(`[aria-label='toggle']`).click()
        cy.get('pre').should('have.class', 'hidden')
      })
    })
  })
})
