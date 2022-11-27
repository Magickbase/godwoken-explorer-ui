/// <reference types="cypress" />

context('Blocks List Page', () => {
  before(() => cy.visit('/en-US/blocks'))

  const waitForLoading = () => {
    cy.get('h5+div p')
      .contains(/Blocks From #\d+ To #\d+/)
      .should('be.visible')
  }

  describe('List page common elements exist', () => {
    it('should have a title', () => {
      cy.get('h5').should('have.text', 'Blocks')
    })
    it('should have a subtitle', () => {
      cy.get('h5+div p')
        .contains(/Blocks From #\d+ To #\d+/)
        .should('not.be.undefined')
    })
    it('should have page navigation arrows', () => {
      cy.get('p+div a[title="Prev"]')
        .should('be.visible')
        .should(link => {
          expect(link).to.has.attr('href').to.contain(`/blocks`)
          expect(link).to.has.css('pointer-events', 'none')
        })
      cy.get('p+div a[title="Next"]')
        .should('be.visible')
        .should(link => {
          expect(link).to.has.attr('href').to.contain(`/blocks?page=2`)
          expect(link).to.has.css('cursor', 'pointer')
        })
    })
    it('should have page navigation numbers', () => {
      cy.get('p+div > div > a')
        .contains('1')
        .should(link => {
          expect(link).to.has.attr('href').to.contain(`/blocks?page=1`)
        })
    })
  })

  describe('list page common navigation actions', () => {
    it('should have disabled prev arrow', () => {
      cy.get('p+div a[title="Prev"]')
        .should('be.visible')
        .first()
        .should(link => {
          expect(link).to.has.css('pointer-events', 'none')
        })
        .click({ force: true })
      cy.location('pathname').should('eq', '/blocks')
      cy.location('search').should('eq', '')
    })
    it('should navigate to page 2 on click number 2', () => {
      cy.get('p+div > div > a').contains('2').click()
      cy.location('pathname').should('eq', '/blocks')
      cy.location('search').should('eq', '?page=2')
    })
    it('should navigate to page 2 on click next arrow', () => {
      cy.get('p+div a[title="Next"]').should('be.visible').first().click()
      cy.location('pathname').should('eq', '/blocks')
      cy.location('search').should('eq', '?page=2')
    })
    it('should navigate back to page 1 on click prev arrow', () => {
      cy.visit('/en-US/blocks?page=2')
      cy.get('p+div a[title="Prev"]')
        .should('be.visible')
        .first()
        .should('not.have.css', 'pointer-events', 'none')
        .click()
      cy.location('pathname').should('eq', '/blocks')
      cy.location('search').should('eq', '?page=1')
    })
    it('should have a list with 30 records by default', () => {
      cy.get(`table tbody tr`).should('have.length', 30)
    })
    it('should show 50 records after selecting 50', () => {
      cy.get('p').contains(/Show/).siblings().first().click()
      cy.get('ul').find('li[data-value=50]').click()
      cy.get(`table tbody tr`).should('have.length', 50)
    })
  })

  describe('shoud have a list with required information', () => {
    before(() => cy.visit('/en-US/blocks'))
    const ROOT_SELECTOR = 'table'

    it('should have headers', () => {
      cy.get(`${ROOT_SELECTOR} thead tr`).children().should('have.length', 5)
      cy.get(`${ROOT_SELECTOR} thead tr th`).contains(/block/).should('to.exist')
      cy.get(`${ROOT_SELECTOR} thead tr th`).contains(/age/i).should('to.exist')
      cy.get(`${ROOT_SELECTOR} thead tr th`).contains(/txn/).should('to.exist')
      cy.get(`${ROOT_SELECTOR} thead tr th`)
        .contains(/gas used/)
        .should('to.exist')
      cy.get(`${ROOT_SELECTOR} thead tr th`)
        .contains(/gas limit/)
        .should('to.exist')
    })

    describe('should have required information in each record', () => {
      const ROOT_SELECTOR = 'table tbody tr:nth-child(1)'
      it('should have block number which is a link', () => {
        waitForLoading()
        cy.get(`${ROOT_SELECTOR} a`)
          .should('be.visible')
          .should(link => {
            expect(link.text().replace(/,/g, '')).to.match(/^\d+$/)
            expect(link).to.have.attr('href').contains(`/block/0x`)
          })
      })
      it('should have success status', () => {
        cy.get(`${ROOT_SELECTOR} td svg`).first().find('path[stroke="#2BD56F"]').should('exist')
      })
      it('should have Age', () => {
        cy.get(ROOT_SELECTOR)
          .find('time')
          .contains(/\d+ \w+ ago/)
          .should('exist')
      })
      it('should have Txn count which is a number', () => {
        cy.get(ROOT_SELECTOR)
          .find('td:nth-child(3)')
          .should(td => {
            expect(td.text().replace(/,/g, '')).to.match(/^\d+$/)
          })
      })
      it('should have a gas used which is a number', () => {
        cy.get(ROOT_SELECTOR)
          .find('td:nth-child(4)')
          .should(td => {
            expect(td.text().replace(/,/g, '')).to.match(/^\d+$/)
          })
      })
      it('should have a gas limit which is a number', () => {
        cy.get(ROOT_SELECTOR)
          .find('td:nth-child(5)')
          .should(td => {
            expect(td.text().replace(/,/g, '')).to.match(/^\d+$/)
          })
      })
    })
  })
})
