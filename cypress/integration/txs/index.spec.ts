/// <reference types="cypress" />

context('Transactions List Pages Common Features', () => {
  before(() => cy.visit('/en-US/txs'))

  const waitForLoading = () => {
    cy.get('h5+div p')
      .contains(/Txns in blocks from #\d+ to #\d+/)
      .should('be.visible')
  }

  beforeEach(() => {
    cy.get('a[title="Prev"]').should('be.visible').as('prevBtn')
    cy.get('a[title="Next"]').should('be.visible').as('nextBtn')
  })

  describe('Txn list pages common elements exist', () => {
    it('should have a title', () => {
      cy.get('h5').should('have.text', 'Transactions')
    })
    it('should have page navigation arrows', () => {
      cy.get('@prevBtn').should(link => {
        expect(link).to.has.attr('href').to.contain(`/txs?before=`)
        expect(link).to.has.css('pointer-events', 'none')
      })
      cy.get('@nextBtn').should(link => {
        expect(link).to.has.attr('href').to.contain(`/txs?after=`)
        expect(link).to.has.css('cursor', 'pointer')
      })
    })
    it('should have a filter icon', () => {
      cy.get('label[for="filter"] svg').should('be.visible')
    })
  })

  describe('Tx list pages common actions', () => {
    describe('navigation actions', () => {
      it('should have disabled prev arrow', () => {
        cy.get('@prevBtn').should(link => {
          expect(link).to.has.css('pointer-events', 'none')
        })
      })
      it('should navigate to next page on click next arrow', () => {
        cy.get('@nextBtn')
          .should(link => {
            expect(link).to.has.css('cursor', 'pointer')
          })
          .click()
        waitForLoading()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq('/txs')
          expect(loc.search).to.match(/after=/)
        })
      })
      it('should navigate back to prev page on click prev arrow', () => {
        cy.get('@prevBtn')
          .should(link => {
            expect(link).to.has.css('cursor', 'pointer')
          })
          .click()
        waitForLoading()
        cy.location().should(loc => {
          expect(loc.pathname).to.eq('/txs')
          expect(loc.search).to.match(/before=/)
        })
      })
      it('should have a list with 30 records by default', () => {
        cy.visit('/en-US/txs')
        waitForLoading()
        cy.get(`table tbody`).children().should('have.length', 30)
      })
      it('should show 50 records after selecting 50', () => {
        cy.get('p').contains(/Show/).siblings().first().click()
        cy.get('ul').find('li[data-value=50]').click()
        cy.get(`table tbody tr`).should('have.length', 50)
      })
    })
    describe('filter actions', () => {
      beforeEach(() => {
        cy.get('table tbody tr:nth-child(1) td:nth-child(3) a').as('link')
      })
      it('should filter by block number', () => {
        cy.get('@link').then(link => {
          const latestBlockNumber = link.text()
          cy.get('label[for="block_from_filter"]').click()
          cy.get('input[id="block_from_filter"]').should('be.visible').type(latestBlockNumber)
          cy.get('input[id="block_to_filter"]').should('be.visible').type(latestBlockNumber)
          cy.get('input[id="block_to_filter"]')
            .parent()
            .siblings()
            .find('button[type="submit"]')
            .should('be.visible')
            .click()
          waitForLoading()
          cy.get(`table tbody`).children().should('have.length.at.least', 1)
          cy.get('table tbody tr:nth-child(1) td:nth-child(3) a').should('have.text', latestBlockNumber)
        })
      })
    })
  })

  describe('Tx list pages common table content', () => {
    before(() => cy.visit('/en-US/txs'))
    const HEAD_ROOT_SELECTOR = 'table thead tr'
    const BODY_ROOT_SELECTOR = 'table tbody tr'
    it('should have a list with required information', () => {
      waitForLoading()
      cy.get(`${HEAD_ROOT_SELECTOR} th:nth-child(1)`).should('have.text', 'Txn Hash')
      cy.get(`${HEAD_ROOT_SELECTOR} th:nth-child(2)`).should('contain.text', 'Method')
      cy.get(`${HEAD_ROOT_SELECTOR} th:nth-child(3)`).should('contain.text', 'Block')
      cy.get(`${HEAD_ROOT_SELECTOR} th:nth-child(4)`).should('contain.text', 'Age')
      cy.get(`${HEAD_ROOT_SELECTOR} th:nth-child(5)`).should('contain.text', 'From')
      cy.get(`${HEAD_ROOT_SELECTOR} th:nth-child(6)`).should('contain.text', 'To')
      cy.get(`${HEAD_ROOT_SELECTOR} th:nth-child(8)`).should('have.text', 'Value (pCKB)')
      cy.get(`${BODY_ROOT_SELECTOR}`).should('have.length', 30)
      cy.get(`${BODY_ROOT_SELECTOR}:nth-child(1)`)
        .children()
        .each((td, index) => {
          if (index !== 6) {
            expect(td.text()).not.to.be.empty
          }
        })
    })
  })
})
