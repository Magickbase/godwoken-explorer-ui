/// <reference types="cypress" />

context.skip('Transaction Page', () => {
  let hash: string
  before(() => {
    cy.fixture('tx').then(tx => {
      hash = tx.hash
      return cy.visit(`/en-US/tx/${hash}`)
    })
  })

  describe('general sets', () => {
    it('cy.title() - get the title', () => {
      cy.title().should('include', 'Godwoken Explorer')
    })
  })

  describe('transaction info', () => {
    it('should have title with tx hash', () => {
      cy.get('.card-header').should('have.text', `tx hash#${hash}`)
    })
    it('should have from account which is a link', () => {
      cy.get(`a[aria-label='from']`).should(link => {
        const id = link.text()
        expect(link).to.have.attr('href').to.eq(`/account/${id}`)
      })
    })
    it('should have to account which is a link', () => {
      cy.get(`a[aria-label='to']`).should(link => {
        const id = link.text()
        expect(link).to.have.attr('href').to.eq(`/account/${id}`)
      })
    })

    describe('group 1', () => {
      it('should have timestamp', () => {
        cy.get('.card-fieldset:first')
          .find('.card-field')
          .should(fields => {
            const timestamp = fields[0]
            expect(timestamp.querySelector('.card-label')).to.have.text('timestamp')
            expect(timestamp.querySelector('time')).to.exist
          })
      })
      it('should have l2 block which is a link', () => {
        cy.get('.card-fieldset:first')
          .find('.card-field')
          .should(fields => {
            const l2block = fields[1]
            expect(l2block.querySelector('.card-label')).to.have.text('l2 block')
            const link = l2block.querySelector(`a[title='l2 block']`)
            const number = link.textContent.replace(/,/g, '')
            expect(link).to.have.attr('href').to.eq(`/block/${number}`)
          })
      })
      it('should have l1 block which is a link', () => {
        cy.get('.card-fieldset:first')
          .find('.card-field')
          .should(fields => {
            const l1block = fields[2]
            expect(l1block.querySelector('.card-label')).to.have.text('l1 block')
            const link = l1block.querySelector(`a[title='l1 block']`)
            const number = link.textContent.replace(/,/g, '')
            expect(link)
              .to.have.attr('href')
              .to.match(new RegExp(`/block/${number}$`))
          })
      })
      it('should have type', () => {
        cy.get('.card-fieldset:first')
          .find('.card-field')
          .should(fields => {
            const type = fields[3]
            expect(type.querySelector('.card-label')).to.have.text('type')
            expect(type.querySelector('.card-label+span')).to.have.class('tx-type-badge')
          })
      })
      it('should have finalize state', () => {
        cy.get('.card-fieldset:first')
          .find('.card-field')
          .should(fields => {
            const state = fields[4]
            expect(state.querySelector('.card-label')).to.have.text('finalize state')
            // TODO: test content
          })
      })
    })

    describe('group 2', () => {
      it('should have nonce', () => {
        cy.get('.card-fieldset:last')
          .find('.card-field')
          .should(fields => {
            const nonce = fields[0]
            expect(nonce.querySelector('.card-label')).to.have.text('nonce')
            expect(isNaN(+nonce.querySelector(`span[title='nonce']`).textContent.replace(/,/g, ''))).to.be.false
          })
      })
      it('should have args', () => {
        cy.get('.card-fieldset:last')
          .find('.card-field')
          .should(fields => {
            const state = fields[1]
            expect(state.querySelector('.card-label')).to.have.text('args')
            expect(state.querySelector(`span[title='args']`).textContent).to.match(/^0x/)
          })
      })
      it('should have gas price', () => {
        cy.get('.card-fieldset:last')
          .find('.card-field')
          .should(fields => {
            if (fields.length === 4) {
              const state = fields[2]
              expect(state.querySelector('.card-label')).to.have.text('gas price')
              // TODO: test content
            } else {
              // ignore
            }
          })
      })
      it('should have fee', () => {
        cy.get('.card-fieldset:last')
          .find('.card-field')
          .should(fields => {
            const state = fields[fields.length - 1]
            expect(state.querySelector('.card-label')).to.have.text('fee')
            // TODO: test content
          })
      })
    })
  })
})
