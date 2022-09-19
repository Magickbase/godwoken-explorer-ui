/// <reference types="cypress" />

context('Search', () => {
  const ROOT_SELECTOR = `.search-input`
  const MOBILE_VIEWPORT = 'iphone-x'
  describe('home page', () => {
    before(() => cy.visit('/en-US'))
    describe('by default', () => {
      it('should contain search input', () => {
        cy.get(ROOT_SELECTOR).should('be.visible')
      })

      it('should show icon when type input', () => {
        cy.get(`${ROOT_SELECTOR} input`).type('test').get(`${ROOT_SELECTOR} img[alt=search-clear]`).should('be.visible')
      })

      it('should hide icon when no text in input', () => {
        cy.get(`${ROOT_SELECTOR} input`).clear().get(`${ROOT_SELECTOR} img[alt=search-clear]`).should('not.be.visible')
      })
    })

    describe('mobile', () => {
      beforeEach(() => {
        cy.viewport(MOBILE_VIEWPORT)
      })

      describe('by default', () => {
        it('should contain search input', () => {
          cy.get(ROOT_SELECTOR).should('be.visible')
        })

        it('should show icon when type input', () => {
          cy.get(`${ROOT_SELECTOR} input`)
            .type('test')
            .get(`${ROOT_SELECTOR} img[alt=search-clear]`)
            .should('be.visible')
        })

        it('should hide icon when no text in input', () => {
          cy.get(`${ROOT_SELECTOR} input`)
            .clear()
            .get(`${ROOT_SELECTOR} img[alt=search-clear]`)
            .should('not.be.visible')
        })
      })
    })
  })

  describe('block page', () => {
    before(() => cy.visit('/en-US/block/1'))
    describe('desktop', () => {
      it('should contain search input', () => {
        cy.get(ROOT_SELECTOR).should('be.visible')
      })
    })

    describe('mobile', () => {
      beforeEach(() => {
        cy.viewport(MOBILE_VIEWPORT)
      })

      it('should contain search input', () => {
        cy.get(ROOT_SELECTOR).should('be.visible')
      })
    })
  })

  describe('account page', () => {
    before(() => cy.visit('/en-US/account/2'))
    describe('desktop', () => {
      it('should contain search input', () => {
        cy.get(ROOT_SELECTOR).should('be.visible')
      })
    })

    describe('mobile', () => {
      beforeEach(() => {
        cy.viewport(MOBILE_VIEWPORT)
      })

      it('should contain search input', () => {
        cy.get(ROOT_SELECTOR).should('be.visible')
      })
    })
  })

  describe('redirection', () => {
    const REDIRECT_TIMEOUT = 14000
    beforeEach(() => cy.visit('/en-US'))

    it('should redirect to block page when keyword is a block hash', () => {
      cy.get(`a[title='block number']:first`)
        .then(block => {
          const hash = block.attr('href').slice('/block/'.length)
          const number = block.text().replace(/[# ,]/g, '')
          return { hash, number }
        })
        .should(({ hash, number }) => {
          cy.get(`${ROOT_SELECTOR} input`).type(hash)
          cy.get(ROOT_SELECTOR).type('{enter}')
          cy.url({ timeout: REDIRECT_TIMEOUT }).should('contain', `/block/${number}`)
          cy.location('search').should('eq', `?search=${hash}`)
        })
    })

    it('should redirect to transaction page when keyword is a tx hash', () => {
      cy.get(`a[title='tx hash']:first`)
        .then(tx => tx.parent())
        .invoke('attr', 'aria-label')
        .then(hash => {
          cy.get(`${ROOT_SELECTOR} input`).type(hash)
          cy.get(ROOT_SELECTOR).type('{enter}')
          cy.url({ timeout: REDIRECT_TIMEOUT }).should('contain', `/tx/${hash}`)
          cy.location('search').should('eq', `?search=${hash}`)
        })
    })

    it('should redirect to tokens page when keyword is not a number', () => {
      const UNKNOWN_STRING = 'unknown'
      cy.get(`${ROOT_SELECTOR} input`).type(UNKNOWN_STRING)
      cy.get(ROOT_SELECTOR).type('{enter}')
      cy.url({ timeout: REDIRECT_TIMEOUT }).should('contain', `/tokens/native`)
      cy.location('search').should('eq', `?name=${UNKNOWN_STRING}`)
    })

    it('404', () => {
      const INVALID_SEARCH = '1234567890'
      cy.get(`${ROOT_SELECTOR} input`).type(INVALID_SEARCH)
      cy.get(ROOT_SELECTOR).type('{enter}')
      cy.url({ timeout: REDIRECT_TIMEOUT }).should('contain', `/404`)
      cy.location('search').should('eq', `?search=${INVALID_SEARCH}`)
    })

    it.skip('lockhash', () => {})
    it.skip('ckb address', () => {})
    it.skip('eth address', () => {})
  })
})
