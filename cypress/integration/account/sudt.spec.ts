/// <reference types="cypress" />

context('MetaContract Account Page', () => {
  const id = 1
  before(() => {
    cy.visit(`/en-US/account/${id}`)
  })

  describe('sudt info', () => {
    const ROOT_SELECTOR = `.card-subheader[aria-label='sudt']`
    it('should has account type', () => {
      cy.get(ROOT_SELECTOR).should('have.text', 'account type:sUDT')
    })

    it('should has name', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const name = fields[0]
          expect(name.querySelector('.card-label').textContent).to.eq('name')
          // TODO: test content
        })
    })

    it('should has symbol', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const symbol = fields[1]
          expect(symbol.querySelector('.card-label').textContent).to.eq('symbol')
          expect(symbol.querySelector(`[title='symbol'] img`)).to.exist
          // TODO: test content
        })
    })

    it('should has decimal', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const decimal = fields[2]
          expect(decimal.querySelector('.card-label').textContent).to.eq('decimal')
          // TODO: test content
        })
    })

    it('should has l2 supply', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const supply = fields[3]
          expect(supply.querySelector('.card-label').textContent).to.eq('L2 Supply')
          expect(+supply.querySelector(`[title='L2 Supply']`).textContent.replace(/,/g, '')).to.be.a('number')
        })
    })

    it('should has holders', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const holders = fields[4]
          expect(holders.querySelector('.card-label').textContent).to.eq('holders')
          expect(+holders.querySelector(`[title='holders']`).textContent.replace(/,/g, '')).to.be.a('number')
        })
    })
  })
})
