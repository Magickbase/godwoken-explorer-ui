/// <reference types="cypress" />

context('MetaContract Account Page', () => {
  const id = 0
  before(() => {
    cy.visit(`/en-US/account/${id}`)
  })

  describe('meta contract info', () => {
    const ROOT_SELECTOR = `.card-subheader[aria-label='meta contract']`
    it('should have account type', () => {
      cy.get(ROOT_SELECTOR).should('have.text', 'account type:Meta Contract')
    })
    it('should have status', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const status = fields[0]
          expect(status.querySelector('.card-label')).to.have.text('status')
          expect(status.querySelector(`[title='status']`).textContent).to.match(/running|halting/)
        })
    })
    it('should have account merkle state', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const state = fields[1]
          expect(state.querySelector('.card-label')).to.have.text('account merkle state')
          // TODO: test content
        })
    })
    it('should have block merkle state', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const state = fields[2]
          expect(state.querySelector('.card-label')).to.have.text('block merkle state')
          // TODO: test content
        })
    })
    it('should have reverted block root', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const root = fields[3]
          expect(root.querySelector('.card-label')).to.have.text('reverted block root')
          // TODO: test content
        })
    })
    it('should have last finalized block number', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const number = fields[4]
          expect(number.querySelector('.card-label')).to.have.text('last finalized block number')
          // TODO: test content
        })
    })
  })
})
