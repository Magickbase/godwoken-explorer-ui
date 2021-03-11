/// <reference types="cypress" />

context('Home Page', () => {
  before(() => {
    cy.visit('/en-US')
  })

  describe('general sets', () => {
    it('cy.title() - get the title', () => {
      cy.title().should('include', 'Godwoken Explorer')
    })
  })

  describe('statistic', () => {
    const ROOT_SELECTOR = `.statistic-container`
    it('should has blocks field', () => {
      cy.get(`${ROOT_SELECTOR} div[aria-label=blocks]`).should('have.text', 'blocks')
    })
    it('should has transaction field', () => {
      cy.get(`${ROOT_SELECTOR} div[aria-label=transactions]`).should('have.text', 'transactions')
    })
    it('should has tps field', () => {
      cy.get(`${ROOT_SELECTOR} div[aria-label=TPS]`).should('have.text', 'TPS')
    })
    it('should has account count field', () => {
      cy.get(`${ROOT_SELECTOR} div[aria-label='account count']`).should('have.text', 'account count')
    })
  })

  describe('latest blocks', () => {
    const ROOT_SELECTOR = `[aria-label='latest blocks']`
    it('should has a list title', () => {
      cy.get(ROOT_SELECTOR).contains('latest blocks')
    })

    it('should has 10 items at most', () => {
      cy.get(`${ROOT_SELECTOR}+div`).children().should('have.length.lte', 10)
    })

    describe('each block', () => {
      it('should has number which is a link', () => {
        cy.get(`${ROOT_SELECTOR}+div`)
          .children()
          .first()
          .find(`a[title='block number']`)
          .should(link => {
            expect(link).to.has.class('hashLink')
            expect(link).to.has.attr('href').contains('/block/')
          })
      })
      it('should has tx count', () => {
        cy.get(`${ROOT_SELECTOR}+div`)
          .children()
          .first()
          .find(`a[title='block number']+span`)
          .invoke('text')
          .should('contain', ' TXs')
      })
      it('should has time', () => {
        cy.get(`${ROOT_SELECTOR}+div`).children().first().find('time').should('not.be.undefined')
      })
    })
  })

  describe('latest transactions', () => {
    const ROOT_SELECTOR = `[aria-label='latest transactions']`
    it('should has a list title', () => {
      cy.get(ROOT_SELECTOR).contains('latest transactions')
    })

    it('should has 10 items at most', () => {
      cy.get(`${ROOT_SELECTOR}+div`).children().should('have.length.lte', 10)
    })

    describe('each transaction', () => {
      it('should has hash which is a link', () => {
        cy.get(`${ROOT_SELECTOR}+div`)
          .children()
          .first()
          .find(`a[title='tx hash']`)
          .should(link => {
            const hash = link.text()
            expect(link).to.has.class('hashLink')
            expect(link).to.has.attr('href').to.eq(`/tx/${hash}`)
          })
      })
      it('should has success or failure', () => {
        cy.get(`${ROOT_SELECTOR}+div`)
          .children()
          .first()
          .find('img')
          .should(img => {
            expect(img)
              .to.has.attr('alt')
              .to.match(/success|failure/)
          })
      })
      it('should has a from account', () => {
        cy.get(`${ROOT_SELECTOR}+div`)
          .children()
          .first()
          .find(`a[title=from]`)
          .should(link => {
            const id = link.text()
            expect(link).to.has.attr('href').to.eq(`/account/${id}`)
          })
      })
      it('should has a to account', () => {
        cy.get(`${ROOT_SELECTOR}+div`)
          .children()
          .first()
          .find(`a[title=to]`)
          .should(link => {
            const id = link.text()
            expect(link).to.has.attr('href').to.eq(`/account/${id}`)
          })
      })
      it('should has time', () => {
        cy.get(`${ROOT_SELECTOR}+div`).children().first().find('time').should('not.be.undefined')
      })
    })
  })
})
