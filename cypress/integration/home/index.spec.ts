/// <reference types="cypress" />

context('Home Page', () => {
  before(() => cy.visit('/en-US'))

  describe('general sets', () => {
    it('cy.title() - get the title', () => {
      cy.title().should('include', Cypress.env('EXPLORER_TITLE'))
    })
  })

  describe('statistic', () => {
    const ROOT_SELECTOR = `#statistic-container`
    it('should have blocks field', () => {
      cy.get(`${ROOT_SELECTOR}`).should('contain.text', 'blocks')
    })
    it('should have transaction field', () => {
      cy.get(`${ROOT_SELECTOR}`).should('contain.text', 'transactions')
    })
    it('should have tps field', () => {
      cy.get(`${ROOT_SELECTOR}`).should('contain.text', 'TPS')
    })
    it('should have account count field', () => {
      cy.get(`${ROOT_SELECTOR}`).should('contain.text', 'account count')
    })
  })

  describe('latest blocks', () => {
    const ROOT_SELECTOR = `.latest-blocks`
    it('should have a list title', () => {
      cy.get(ROOT_SELECTOR).contains('latest blocks')
    })

    it('should have 10 items at most', () => {
      cy.get(`${ROOT_SELECTOR} .list-container`).children().should('have.length.lte', 10)
    })

    describe('each block', () => {
      it('should have number which is a link', () => {
        cy.get(`${ROOT_SELECTOR} .list-container`)
          .children()
          .last()
          .find(`a[title='block number']`)
          .should(link => {
            expect(link).to.has.attr('href').contains('/block/')
          })
      })
      it('should have tx count', () => {
        cy.get(`${ROOT_SELECTOR} .list-container`).children().first().should('contain.text', ' Txs')
      })
      it('should have time', () => {
        cy.get(`${ROOT_SELECTOR} .list-container`).children().first().find('time').should('not.be.undefined')
      })
      it('should have a status', () => {
        cy.get(`${ROOT_SELECTOR} .list-container`).children().first().find('svg').should('not.be.undefined')
      })
    })
  })

  describe('latest transactions', () => {
    const ROOT_SELECTOR = `.latest-txs`
    it('should have a list title', () => {
      cy.get(ROOT_SELECTOR).contains('latest transactions')
    })

    it('should have 10 items at most', () => {
      cy.get(`${ROOT_SELECTOR} .list-container`).children().should('have.length.lte', 10)
    })

    describe('each transaction', () => {
      it('should have hash which is a link', () => {
        cy.get(`${ROOT_SELECTOR} .list-container`)
          .children()
          .first()
          .find(`a[title='tx hash']`)
          .should(link => {
            expect(link).to.has.attr('href').to.contain(`/tx/`)
          })
      })
      it('should have a from account', () => {
        cy.get(`${ROOT_SELECTOR} .list-container`)
          .children()
          .first()
          .find(`a[title=from]`)
          .should(link => {
            expect(link).to.has.attr('href').to.contain(`/account/`)
          })
      })
      it('should have a to account', () => {
        cy.get(`${ROOT_SELECTOR} .list-container`)
          .children()
          .first()
          .find(`a[title=to]`)
          .should(link => {
            expect(link).to.has.attr('href').to.contain(`/account/`)
          })
      })
      it('should have time', () => {
        cy.get(`${ROOT_SELECTOR} .list-container`).children().first().find('time').should('not.be.undefined')
      })
      it('should have a status', () => {
        cy.get(`${ROOT_SELECTOR} .list-container`).children().first().find('svg').should('not.be.undefined')
      })
    })
  })
})
