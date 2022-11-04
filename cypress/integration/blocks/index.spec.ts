/// <reference types="cypress" />

context('Blocks List Page', () => {
  before(() => cy.visit('/en-US/blocks'))

  describe('list page common elements exists', () => {
    it('should have a title', () => {
      cy.get('h5').should('have.text', 'Blocks')
    })
    it('should have a subtitle', () => {
      cy.get('p')
        .contains(/Blocks From #\d+ To #\d+/)
        .should('not.be.undefined')
    })
    it('should have page navigation arrows which is a link', () => {
      cy.get('p+div a[title="Prev"]')
        .should('be.visible')
        .should(link => {
          expect(link).to.has.attr('href').to.contain(`/blocks`)
        })
      cy.get('p+div a[title="Next"]')
        .should('be.visible')
        .should(link => {
          expect(link).to.has.attr('href').to.contain(`/blocks?page=2`)
        })
    })
    it('should have page navigation numbers which is a link', () => {
      cy.get('p+div > div > a')
        .contains('1')
        .should(link => {
          expect(link).to.has.attr('href').to.contain(`/blocks?page=1`)
        })
    })
  })

  describe('list page common navigation actions', () => {
    it('should have disabled prev arrow', () => {
      cy.get('p+div a[title="Prev"]').should('be.visible').first().click({ force: true })
      cy.url().should('contains', 'blocks')
    })
    it('should navigate to page 2 on click number 2', () => {
      cy.get('p+div > div > a').contains('2').click()
      cy.url().should('contains', 'blocks?page=2')
    })
    it('should navigate to page 2 on click next arrow', () => {
      cy.get('p+div a[title="Next"]').should('be.visible').first().click()
      cy.url().should('contains', 'blocks?page=2')
    })
    it('should navigate back to page 1 on click prev arrow', () => {
      cy.visit('/en-US/blocks?page=2')
      cy.get('p+div a[title="Prev"]').should('be.visible').first().should('exist').click()
      cy.url().should('contains', 'blocks?page=1')
    })
  })

  describe('shoud have a list with required information', () => {
    const ROOT_SELECTOR = 'table'
    it('should have a list with 30 records by default', () => {
      cy.get(`${ROOT_SELECTOR} tbody`).children().should('have.length', 30)
    })
    it('should show more 50 records after selecting 50', () => {
      cy.get('p').contains(/Show/).siblings().first().click()
      cy.get('ul').find('li[data-value=50]').click()
      cy.get(`${ROOT_SELECTOR} tbody`).children().should('have.length', 50)
    })
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
      const ROOT_SELECTOR = 'table tbody tr'
      it('should have block number which is a link', () => {
        cy.get(`${ROOT_SELECTOR} a`)
          .should('be.visible')
          .first()
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
          .first()
          .find('time')
          .contains(/\d mins ago/)
          .should('exist')
      })
      it('should have Txn count which is a number', () => {
        cy.get(ROOT_SELECTOR)
          .first()
          .find('td:nth-child(3)')
          .should(td => {
            expect(td.text().replace(/,/g, '')).to.match(/^\d+$/)
          })
      })
      it('should have a gas used', () => {
        cy.get(ROOT_SELECTOR)
          .first()
          .find('td:nth-child(4)')
          .should(td => {
            expect(td.text().replace(/,/g, '')).to.match(/^\d+$/)
          })
      })
      it('should have a gas limit', () => {
        cy.get(ROOT_SELECTOR)
          .first()
          .find('td:nth-child(5)')
          .should(td => {
            expect(td.text().replace(/,/g, '')).to.match(/^\d+$/)
          })
      })
    })
  })
})
