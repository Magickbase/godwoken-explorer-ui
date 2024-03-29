/// <reference types="cypress" />

context('On Chain Transactions List Page', () => {
  before(() => cy.visit('/en-US/txs'))

  it('should have a subtitle', () => {
    cy.get('h5+div p')
      .contains(/^Txns in blocks from #\d+ to #\d+$/)
      .should('be.visible')
  })

  it('should redirect to pending txs list page', () => {
    cy.get('label[for="filter"] svg').should('be.visible').click()
    cy.get('span').contains('View pending transactions').should('be.visible').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/txs')
      expect(loc.search).to.eq('?status=pending')
    })
  })

  describe('should have required information in each record', () => {
    const ROOT_SELECTOR = 'table tbody tr:nth-child(1)'
    before(() => cy.visit('/en-US/txs'))
    it('should have txn address which is a link', () => {
      cy.get(`${ROOT_SELECTOR} td:nth-child(1) a`)
        .should('be.visible')
        .should(link => {
          expect(link.text()).to.match(/^0x[0-9a-z]{6}...[0-9a-z]{8}$/)
          expect(link.attr('href')).to.match(/^\/tx\/0x/)
        })
    })
    it('should have a success or failure status', () => {
      cy.get(`${ROOT_SELECTOR} td:nth-child(1)`).should(td => {
        if (
          td.find('.tooltip').attr('data-tooltip') === 'Finalized' ||
          td.find('.tooltip').attr('data-tooltip') === 'Committed'
        ) {
          expect(td.find('svg path[stroke="#2BD56F"]')).to.exist
        } else {
          expect(td.find('svg path[fill="#F83F3F"]')).to.exist
        }
      })
    })
    it('should have a method which is a string', () => {
      cy.get(`${ROOT_SELECTOR} td:nth-child(2) div`).should(div => {
        expect(div.text()).to.match(/^\w+$/)
      })
    })
    it('should have block number which is a link', () => {
      cy.get(`${ROOT_SELECTOR} td:nth-child(3) a`).should(link => {
        expect(link.text().replace(/,/g, '')).to.match(/^\d+$/)
        expect(link.attr('href')).to.match(/^\/block\/0x/)
      })
    })
    it('should have a age', () => {
      cy.get(`${ROOT_SELECTOR} td:nth-child(4) time`)
        .contains(/\d+ \w+ ago/)
        .should('exist')
    })
    it('should have From and To which are links', () => {
      cy.get(`${ROOT_SELECTOR} td:nth-child(5) a`).should(link => {
        expect(link.attr('href')).to.match(/^\/account\/0x/)
      })
      cy.get(`${ROOT_SELECTOR} td:nth-child(6) a`).should(link => {
        expect(link.attr('href')).to.match(/^\/account\/0x/)
      })
    })
    it('should have a value which is a number', () => {
      cy.get(`${ROOT_SELECTOR} td:nth-child(8) b`).should(td => {
        expect(td.text()).to.match(/\d+\.\d+$/)
      })
    })
  })
})
