/// <reference types="cypress" />

context('User Account Page', () => {
  before(() => {
    cy.fixture('accountIds').then(ids => {
      cy.visit(`/en-US/account/${ids.user}`)
    })
  })

  describe('user info', () => {
    const ROOT_SELECTOR = `.card-subheader[aria-label='user']`
    it('should have account type', () => {
      cy.get(ROOT_SELECTOR).should('have.text', 'account type:User')
    })

    it('should have eth address', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const ethAddr = fields[0]
          expect(ethAddr.querySelector('.card-label').textContent).to.eq('ethereum address')
          expect(ethAddr.querySelector(`[title='ethereum address']`).textContent).to.match(/^0x/)
          expect(ethAddr.querySelector(`[title='ethereum address']`).textContent).to.have.length(43)
        })
    })

    it('should have nonce', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const nonce = fields[1]
          expect(nonce.querySelector('.card-label').textContent).to.eq('nonce')
          expect(+nonce.querySelector(`[title='nonce']`).textContent.replace(/,/g, '')).to.be.a('number')
        })
    })

    it('should have depositor ckb address', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const ckbAddr = fields[2]
          expect(ckbAddr.querySelector('.card-label').textContent).to.eq('depositor CKB address')
          expect(ckbAddr.querySelector(`[title='depositor CKB address']`).textContent).to.match(/^ckt/)
          // TODO: test content
        })
    })

    it('should have ckb lock hash', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .find('.card-field')
        .should(fields => {
          const ckbLockHash = fields[3]
          expect(ckbLockHash.querySelector('.card-label').textContent).to.eq('depositor CKB lock hash')
          expect(ckbLockHash.querySelector(`[title='depositor CKB lock hash']`).textContent).to.have.length(66)
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
    const ROOT_SELECTOR = `.card-subheader[aria-label='User Defined Asset(s)']`
    it('should have title with item count', () => {
      cy.get(`${ROOT_SELECTOR}+div`)
        .children()
        .its('length')
        .then(count => {
          cy.get(ROOT_SELECTOR).should('have.text', `User Defined Asset(s):${count}`)
        })
    })

    // TODO: test each asset
  })
})
