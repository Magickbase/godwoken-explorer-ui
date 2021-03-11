/// <reference types="cypress" />

context('User Account Page', () => {
  const id = 2
  before(() => {
    cy.visit(`/en-US/account/${id}`)
  })

  describe('user info', () => {
    const ROOT_SELECTOR = `.card-subheader[aria-label='user']`
    it('should has account type', () => {
      cy.get(ROOT_SELECTOR).should('have.text', 'account type:User')
    })

    it('should has eth address', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const ethAddr = fields[0]
          expect(ethAddr.querySelector('.card-label').textContent).to.eq('ethereum address')
          expect(ethAddr.querySelector(`[title='ethereum address']`).textContent).to.match(/^0x/)
          expect(ethAddr.querySelector(`[title='ethereum address']`).textContent).to.have.length(43)
        })
    })

    it('should has nonce', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const nonce = fields[1]
          expect(nonce.querySelector('.card-label').textContent).to.eq('nonce')
          expect(+nonce.querySelector(`[title='nonce']`).textContent.replace(/,/g, '')).to.be.a('number')
        })
    })

    it('should has ckb address', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const ckbAddr = fields[2]
          expect(ckbAddr.querySelector('.card-label').textContent).to.eq('CKB address')
          expect(ckbAddr.querySelector(`[title='CKB address']`).textContent).to.match(/^ckt/)
          // TODO: test content
        })
    })

    describe('lock script', () => {
      it('should be hidden by default', () => {
        cy.get('pre').should('have.class', 'hidden')
      })
      it('should display after clicking the arrow', () => {
        cy.get(`[aria-label='toggle']`).click()
        cy.get('pre').should('not.have.class', 'hidden')
      })
      it('should be hidden after clicking the arrow again', () => {
        cy.get(`[aria-label='toggle']`).click()
        cy.get('pre').should('have.class', 'hidden')
      })
    })
  })

  describe('asset list info', () => {
    const ROOT_SELECTOR = `.card-subheader[aria-label='user defined assets']`
    it('should has title with item count', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .children()
        .its('length')
        .then(count => {
          cy.get(ROOT_SELECTOR).should('have.text', `user defined assets:${count}`)
        })
    })

    // TODO: test each asset
  })
})
