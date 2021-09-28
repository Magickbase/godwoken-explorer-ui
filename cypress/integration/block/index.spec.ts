/// <reference types="cypress" />

context('Block Page', () => {
  const number = '1'
  before(() => cy.visit(`/en-US/block/${number}`))

  describe('general sets', () => {
    it('cy.title() - get the title', () => {
      cy.title().should('include', 'Godwoken Explorer')
    })
  })

  describe('block info', () => {
    it('should have title with block number', () => {
      cy.get('.card-header').should('have.text', `block#${number}`)
    })

    it('should have timestamp', () => {
      cy.get('.card-field').should(fields => {
        const timestamp = fields[0]
        expect(timestamp.querySelector('.card-label').textContent).to.eq('timestamp')
        expect(timestamp.querySelector('time')).to.exist
      })
    })
    it('should have l1 block', () => {
      cy.get('.card-field').should(fields => {
        const block = fields[1]
        expect(block.querySelector('.card-label').textContent).to.eq('l1 block')
        const link = block.querySelector('a')
        const blockNumber = link.innerText.replace(/,/g, '')
        expect(link)
          .to.have.attr('href')
          .to.match(new RegExp(`block/${blockNumber}$`))
      })
    })
    it('should have tx hash', () => {
      cy.get('.card-field').should(fields => {
        const txHash = fields[2]
        expect(txHash.querySelector('.card-label').textContent).to.eq('tx hash')
        const link = txHash.querySelector('a')
        expect(link)
          .to.have.attr('href')
          .to.match(new RegExp(`transaction/${link.innerText}$`))
      })
    })
    it('should have finalize state', () => {
      cy.get('.card-field').should(fields => {
        const state = fields[3]
        expect(state.querySelector('.card-label').textContent).to.eq('finalize state')
        // TODO: test content
      })
    })
    it('should have transaction count', () => {
      cy.get('.card-field').should(fields => {
        const txCount = fields[4]
        expect(txCount.querySelector('.card-label').textContent).to.eq('transactions')
        // TODO: test content
      })
    })
    it('should have aggregator', () => {
      cy.get('.card-field').should(fields => {
        const aggregator = fields[5]
        expect(aggregator.querySelector('.card-label').textContent).to.eq('aggregator')
        // TODO: test content
      })
    })
  })
})
