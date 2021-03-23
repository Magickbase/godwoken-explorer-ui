/// <reference types="cypress" />

context('MetaContract Account Page', () => {
  before(() => {
    cy.fixture('accountIds').then(ids => {
      cy.visit(`/en-US/account/${ids.metaContract}`)
    })
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

    it('should have account count', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const count = fields[1]
          expect(count.querySelector('.card-label')).to.have.text('account count')
          expect(isNaN(+count.querySelector(`[title='account count']`).textContent.replace(/,/g, ''))).not.to.be.true
        })
    })

    it('should have account merkle root', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const root = fields[2]
          expect(root.querySelector('.card-label')).to.have.text('account merkle root')
          expect(root.querySelector(`[title='account merkle root']`).textContent).to.match(/^0x\w{64}$/)
        })
    })

    it('should have block count', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const count = fields[3]
          expect(count.querySelector('.card-label')).to.have.text('block count')
          expect(isNaN(+count.querySelector(`[title='block count']`).textContent.replace(/,/g, ''))).not.to.be.true
        })
    })

    it('should have block merkle root', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const root = fields[4]
          expect(root.querySelector('.card-label')).to.have.text('block merkle root')
          expect(root.querySelector(`[title='block merkle root']`).textContent).to.match(/^0x\w{64}$/)
        })
    })

    it('should have reverted block root', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const root = fields[5]
          expect(root.querySelector('.card-label')).to.have.text('reverted block root')
          expect(root.querySelector(`[title='reverted block root']`).textContent).to.match(/^\w{64}$/)
        })
    })

    it('should have last finalized block number', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const number = fields[6]
          expect(number.querySelector('.card-label')).to.have.text('last finalized block number')
          expect(isNaN(+number.querySelector(`[title='last finalized block number']`).textContent.replace(/,/g, '')))
            .not.to.be.true
        })
    })
  })
})
