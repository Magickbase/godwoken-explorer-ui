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
    it('should have page navigation arrows', () => {
      cy.get('p+div')
        .find(`a[title='Prev']`)
        .should(link => {
          expect(link).to.has.attr('href').to.contain(`/blocks`)
        })
      cy.get('p+div')
        .find(`a[title='Next']`)
        .should(link => {
          expect(link).to.has.attr('href').to.contain(`/blocks?page=2`)
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
      cy.get('p+div').find(`a[title='Prev']`).first().click({ force: true })
      cy.url().should('contains', 'blocks')
    })
    it('should navigate to page 2 on click number 2', () => {
      cy.get('p+div > div > a').contains('2').click()
      cy.url().should('contains', 'blocks?page=2')
    })
    it('should navigate to page 2 on click next arrow', () => {
      cy.get('p+div').find(`a[title='Next']`).first().click()
      cy.url().should('contains', 'blocks?page=2')
    })
    it('should navigate back to page 1 on click prev arrow', () => {
      cy.visit('/en-US/blocks?page=2')
      cy.get('p+div').find(`a[title='Prev']`).first().click()
      cy.url().should('contains', 'blocks?page=1')
    })
  })

  describe.skip('shoud have a list with required information', () => {
    it('should have a list with 30 records by default', () => {
      cy.get('.list-container>div').children().should('have.length.lte', 10)
    })
    it('should show more 50 records after choosing', () => {
      cy.get('.list-container>div').children().should('have.length.lte', 10)
    })
    describe('should have required information in each record', () => {
      const ROOT_SELECTOR = `.list-item-container:first`
      it('should have tx hash which is a link', () => {
        cy.get(ROOT_SELECTOR)
          .find(`a[title='tx hash']`)
          .should(link => {
            const hash = link.text()
            expect(link).to.have.class('hashLink')
            expect(link).to.have.attr('href').to.eq(`/tx/${hash}`)
          })
      })
      it('should have tx type', () => {
        cy.get(`${ROOT_SELECTOR} span[title='type']`).should('have.class', 'tx-type-badge')
      })
      it('should have success status', () => {
        cy.get(`${ROOT_SELECTOR}>div>div:first`)
          .find('img')
          .should(img => {
            expect(img)
              .to.have.attr('alt')
              .to.match(/success|failure/)
          })
      })
      it('should have block number which is a link', () => {
        cy.get(`${ROOT_SELECTOR} a[title='block number']`).should(link => {
          const number = link.text()
          expect(link)
            .to.have.attr('href')
            .to.eq(`/block/${number.replace(/,/g, '')}`)
        })
      })
      it('should have from account which is a link', () => {
        cy.get(`${ROOT_SELECTOR} a[title='from']`).should(link => {
          const id = link.text()
          expect(link).to.have.attr('href').to.eq(`/account/${id}`)
        })
      })
      it('should have to account which is a link', () => {
        cy.get(`${ROOT_SELECTOR} a[title='to']`).should(link => {
          const id = link.text()
          expect(link).to.have.attr('href').to.eq(`/account/${id}`)
        })
      })
      it('should have timestamp', () => {
        cy.get(ROOT_SELECTOR).find('time').should('to.exist')
      })
    })
  })
})
