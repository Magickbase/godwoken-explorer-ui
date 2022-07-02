/// <reference types="cypress" />

context.skip('Search', () => {
  const ROOT_SELECTOR = `form[class^=search_container]`
  const MOBILE_VIEWPORT = 'iphone-6'
  describe('home page', () => {
    before(() => cy.visit('/en-US'))
    describe('desktop', () => {
      describe('by default', () => {
        it('should be placed beneath the header', () => {
          cy.get(ROOT_SELECTOR)
            .should('have.attr', 'attr-position', 'home')
            .and('have.attr', 'attr-display', 'false')
            .and(form => {
              expect(form.position().top).to.eq(96)
            })
        })

        it('should have a submit button', () => {
          cy.get(`${ROOT_SELECTOR} button[type=submit]`).should('not.have.css', 'display', 'none')
        })

        it('should hide the search icon in header', () => {
          cy.get(`${ROOT_SELECTOR} div[class^=search_toggle]`).should('have.css', 'display', 'none')
        })
      })

      describe('after scrolling 60px', () => {
        it('should be placed in the header', () => {
          cy.scrollTo(0, 60)
          cy.get(ROOT_SELECTOR)
            .should('have.attr', 'attr-position', 'header')
            .and('have.attr', 'attr-display', 'false')
            .and(form => {
              expect(form.position().top).to.eq(10)
            })
        })

        it('should hide the submit button', () => {
          cy.get(`${ROOT_SELECTOR} button[type=submit]`).should('have.css', 'display', 'none')
        })
      })
    })

    describe('mobile', () => {
      beforeEach(() => {
        cy.viewport(MOBILE_VIEWPORT)
      })

      describe('by default', () => {
        it('should be placed beneath the header', () => {
          cy.get(ROOT_SELECTOR)
            .should('have.attr', 'attr-position', 'header')
            .and('have.attr', 'attr-display', 'false')
            .and(form => {
              expect(form.position().top).to.eq(69)
            })
          it('should have a submit button', () => {
            cy.get(`${ROOT_SELECTOR} button[type=submit]`).should('not.have.css', 'display', 'none')
          })
        })
      })

      describe('after scrolling 60px', () => {
        it('should turn into a search icon', () => {
          cy.scrollTo(0, 60)
          cy.get(ROOT_SELECTOR)
            .should('have.attr', 'attr-position', 'header')
            .and('have.attr', 'attr-display', 'false')
            .and('have.css', 'max-height', '0px')

          cy.get(`${ROOT_SELECTOR} div[class^=search_toggle]`).should('not.have.css', 'display', 'none')
        })
      })
    })
  })

  describe('block page', () => {
    before(() => cy.visit('/en-US/block/1'))
    describe('desktop', () => {
      it('should be placed in the header', () => {
        cy.get(ROOT_SELECTOR).should(form => {
          expect(form.position().top).to.eq(10)
        })
      })

      it('should hide the submit button', () => {
        cy.get(`${ROOT_SELECTOR} button[type=submit]`).should('have.css', 'display', 'none')
      })

      it('should hide the search icon in header', () => {
        cy.get(`${ROOT_SELECTOR} div[class^=search_toggle]`).should('have.css', 'display', 'none')
      })
    })

    describe('mobile', () => {
      beforeEach(() => {
        cy.viewport(MOBILE_VIEWPORT)
      })

      it('should turn into a search icon', () => {
        cy.get(ROOT_SELECTOR)
          .should('have.attr', 'attr-position', 'header')
          .and('have.attr', 'attr-display', 'false')
          .and('have.css', 'max-height', '0px')

        cy.get(`${ROOT_SELECTOR} div[class^=search_toggle]`).should('not.have.css', 'display', 'none')
      })
    })
  })

  describe('account page', () => {
    before(() => cy.visit('/en-US/account/2'))
    describe('desktop', () => {
      it('should be placed in the header', () => {
        cy.get(ROOT_SELECTOR).should(form => {
          expect(form.position().top).to.eq(10)
        })
      })

      it('should hide the submit button', () => {
        cy.get(`${ROOT_SELECTOR} button[type=submit]`).should('have.css', 'display', 'none')
      })

      it('should hide the search icon in header', () => {
        cy.get(`${ROOT_SELECTOR} div[class^=search_toggle]`).should('have.css', 'display', 'none')
      })
    })

    describe('mobile', () => {
      beforeEach(() => {
        cy.viewport(MOBILE_VIEWPORT)
      })

      it('should turn into a search icon', () => {
        cy.get(ROOT_SELECTOR)
          .should('have.attr', 'attr-position', 'header')
          .and('have.attr', 'attr-display', 'false')
          .and('have.css', 'max-height', '0px')

        cy.get(`${ROOT_SELECTOR} div[class^=search_toggle]`).should('not.have.css', 'display', 'none')
      })
    })
  })

  describe('redirection', () => {
    beforeEach(() => cy.visit('/en-US'))

    it('should redirect to block page when keyword is a block hash', () => {
      cy.get(`a[title='block number']:first`)
        .then(block => {
          const hash = block.attr('href').slice('/block/'.length)
          const number = block.text().replace(/,/g, '')
          return { hash, number }
        })
        .should(({ hash, number }) => {
          cy.get(`${ROOT_SELECTOR} input`).type(hash)
          cy.get(ROOT_SELECTOR).submit()
          cy.location('pathname').should('eq', `/block/${number}`)
          cy.location('search').should('eq', `?search=${hash}`)
        })
    })

    it('should redirect to transaction page when keyword is a tx hash', () => {
      cy.get(`a[title='tx hash']:first`)
        .then(tx => tx.text())
        .should(hash => {
          cy.get(`${ROOT_SELECTOR} input`).type(hash)
          cy.get(ROOT_SELECTOR).submit()
          cy.location('pathname').should('eq', `/tx/${hash}`)
          cy.location('search').should('eq', `?search=${hash}`)
        })
    })

    it(`should redirect to account page when keyword is a account id`, () => {
      const ACCOUNT_ID = '2'
      cy.get(`${ROOT_SELECTOR} input`).type(ACCOUNT_ID)
      cy.get(ROOT_SELECTOR).submit()
      cy.location('pathname').should('to.eq', `/account/${ACCOUNT_ID}`)
      cy.location('search').should('eq', `?search=${ACCOUNT_ID}`)
    })

    it('404', () => {
      const INVALID_SEARCH = 'unknown'
      cy.get(`${ROOT_SELECTOR} input`).type(INVALID_SEARCH)
      cy.get(ROOT_SELECTOR).submit()
      cy.location('pathname').should('to.eq', `/404`)
      cy.location('search').should('eq', `?search=${INVALID_SEARCH}`)
    })

    it.skip('lockhash', () => {})
    it.skip('ckb address', () => {})
    it.skip('eth address', () => {})
  })
})
