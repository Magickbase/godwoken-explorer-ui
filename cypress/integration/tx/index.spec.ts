/// <reference types="cypress" />

context('Transaction Page', () => {
  let hash: string
  before(() => {
    cy.fixture('tx').then(tx => {
      hash = tx.hash
      return cy.visit(`/en-US/tx/${hash}`)
    })
  })

  describe('transaction info', () => {
    describe('overview', () => {
      it('should have txn hash', () => {
        cy.get('dl[title="txn hash"]')
          .find('dt')
          .should('have.text', 'txn hash')
          .next()
          .should('have.text', '0x1c63fd6014c9c57ea68e283edfc1159b642e94c6bac7fe699b59bf7c299d1ee1')
      })

      it('should have from', () => {
        cy.get('dl[title="from"]').find('dt').should('have.text', 'from')
      })

      it('should have contract address', () => {
        cy.get('dl[title="Interact with Contract"]')
          .find('dt')
          .should('have.text', 'Interact with Contract')
          .next()
          .should('contain.text', 'ERC20')
      })

      it('should have value', () => {
        cy.get('dl[title="value"]').find('dt').should('have.text', 'value').next().should('have.text', '0 pCKB')
      })

      it('should have input', () => {
        cy.get('dl[title="input"]')
          .find('dt')
          .first()
          .should('have.text', 'input')
          .next()
          .find('pre')
          .should(
            'have.text',
            'raw0xa9059cbb00000000000000000000000040dfb7df991c9aa6138a60f0cac6ed1d02b834b80000000000000000000000000000000000000000000000013f306a2409fc0000decodedFunction: transfer(address,uint256)\n\nMethodID: 0xa9059cbb\n[0]: 0x40DfB7Df991c9Aa6138A60F0Cac6ed1d02b834B8\n[1]: 23000000000000000000',
          )
      })
    })

    describe('basic info', () => {
      it('should have finalize state', () => {
        cy.get('dl[title="finalize state"]')
          .find('dt')
          .should('have.text', 'finalize state')
          .next()
          .should('have.text', 'finalized')
      })

      it('should have type', () => {
        cy.get('dl[title="type"').find('dt').should('have.text', 'type').next().should('have.text', 'polyjuice')
      })

      it('should have l1 block', () => {
        cy.get('dl[title="l1 block"').find('dt').should('have.text', 'l1 block').next().should('have.text', '6,050,986')
      })

      it('should have l2 block', () => {
        cy.get('dl[title="l2 block"').find('dt').should('have.text', 'l2 block').next().should('have.text', '198,240')
      })

      it('should have index', () => {
        cy.get('dl[title="index"').find('dt').should('have.text', 'index').next().should('have.text', '0')
      })

      it('should have nonce', () => {
        cy.get('dl[title="nonce"').find('dt').should('have.text', 'nonce').next().should('have.text', '43')
      })

      it('should have status', () => {
        cy.get('dl[title="status"').find('dt').should('have.text', 'status').next().should('have.text', 'succeed')
      })

      it('should have gas price', () => {
        cy.get('dl[title="gas price"')
          .find('dt')
          .should('have.text', 'gas price')
          .next()
          .should('have.text', '0.00009 pCKB')
      })

      it('should have gas used', () => {
        cy.get('dl[title="gas used"').find('dt').should('have.text', 'gas used').next().should('have.text', '27,049')
      })

      it('should have gas limit', () => {
        cy.get('dl[title="gas limit"').find('dt').should('have.text', 'gas limit').next().should('have.text', '82,573')
      })

      it('should have fee', () => {
        cy.get('dl[title="fee"').find('dt').should('have.text', 'fee').next().should('have.text', '2.43441 pCKB')
      })

      it('should have timestamp', () => {
        cy.get('dl[title="fee"').find('dt').should('have.text', 'fee').next().should('have.text', '2.43441 pCKB')
      })
    })

    describe('user operations', () => {
      it('should have Call Contract', () => {
        cy.fixture('tx').then(tx => {
          hash = tx.gaslessTxHash
          return cy.visit(`/en-US/tx/${hash}`)
        })
        cy.get('dl[title="Call Contract"]')
          .find('dt')
          .should('have.text', 'Call Contract')
          .next()
          .should('have.text', '0x1005c8b8ee7a873576f5a6a9862c0c14909e01c1')
      })

      it('should have Call Gas Limit', () => {
        cy.get('dl[title="Call Gas Limit"')
          .find('dt')
          .should('have.text', 'Call Gas Limit')
          .next()
          .should('have.text', '100000')
      })

      it('should have Verification Gas Limit', () => {
        cy.get('dl[title="Verification Gas Limit"')
          .find('dt')
          .should('have.text', 'Verification Gas Limit')
          .next()
          .should('have.text', '100000')
      })

      it('should have Paymaster', () => {
        cy.get('dl[title="Paymaster"')
          .find('dt')
          .should('have.text', 'Paymaster')
          .next()
          .should('have.text', '0x8d8f646cfffa073c20')
      })

      it('should have Max Fee Per Gas', () => {
        cy.get('dl[title="Max Fee Per Gas"')
          .find('dt')
          .should('have.text', 'Max Fee Per Gas')
          .next()
          .should('have.text', '0.000000000000000001 pCKB')
      })

      it('should have Max Priority Fee Per Gas', () => {
        cy.get('dl[title="Max Priority Fee Per Gas"')
          .find('dt')
          .should('have.text', 'Max Priority Fee Per Gas')
          .next()
          .should('have.text', '0.000000000000000001 pCKB')
      })

      it('should have Paymaster Data', () => {
        cy.get('dl[title="Paymaster Data"')
          .find('dt')
          .should('have.text', 'Paymaster Data')
          .next()
          .should('have.text', '7eb8f83d62cb3d842ade4e1234')
      })

      it('should have Call Data', () => {
        cy.get('dl[title="Call Data"]')
          .find('dt')
          .first()
          .should('have.text', 'Call Data')
          .next()
          .find('pre')
          .should(
            'have.text',
            '0x4dd3b30b00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001',
          )
      })
    })
  })

  describe('should have erc20 transfer, erc721 transfer, erc1155 transfer, logs, raw data tabs', () => {
    it('should have 5 tabs', () => {
      cy.fixture('tx').then(tx => {
        hash = tx.hash
        return cy.visit(`/en-US/tx/${hash}`)
      })
      cy.get('div[data-role="tabs"]')
        .find('a')
        .first()
        .should('have.text', 'ERC20 Transfers')
        .should(
          'have.attr',
          'href',
          '/tx/0x1c63fd6014c9c57ea68e283edfc1159b642e94c6bac7fe699b59bf7c299d1ee1?tab=erc20Records',
        )
        .next()
        .should('have.text', 'ERC721 Transfers')
        .should(
          'have.attr',
          'href',
          '/tx/0x1c63fd6014c9c57ea68e283edfc1159b642e94c6bac7fe699b59bf7c299d1ee1?tab=erc721Records',
        )
        .next()
        .should('have.text', 'ERC1155 Transfers')
        .should(
          'have.attr',
          'href',
          '/tx/0x1c63fd6014c9c57ea68e283edfc1159b642e94c6bac7fe699b59bf7c299d1ee1?tab=erc1155Records',
        )
        .next()
        .should('have.text', 'Logs')
        .should('have.attr', 'href', '/tx/0x1c63fd6014c9c57ea68e283edfc1159b642e94c6bac7fe699b59bf7c299d1ee1?tab=logs')
        .next()
        .should('have.text', 'Raw Data')
        .should(
          'have.attr',
          'href',
          '/tx/0x1c63fd6014c9c57ea68e283edfc1159b642e94c6bac7fe699b59bf7c299d1ee1?tab=rawData',
        )
    })
  })
  // TODO: test transfer list
  // TODO: test logs
  // TODO: test raw data
})
