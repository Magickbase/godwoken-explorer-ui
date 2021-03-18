/// <reference types="cypress" />

context('Search', () => {
  const ROOT_SELECTOR = `form[class^=search_container]`
  const MOBILE_VIEWPORT = 'iphone-6'
  describe('home page', () => {
    before(() => {
      cy.visit('/en-US')
    })
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
    before(() => {
      cy.visit('/en-US/block/1')
    })
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
    before(() => {
      cy.visit('/en-US/account/1')
    })
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
})
