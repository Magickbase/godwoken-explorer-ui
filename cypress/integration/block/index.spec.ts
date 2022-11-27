/// <reference types="cypress" />

context('Block Page', () => {
  const blockWithTxs = '0x0a9fbb868d381f65328a811ffe441f80c328400b583887731ae7195579e0ca5d'
  const blockWithBridgedTransfers = '0x2ae0d8f85f982800cbdf8b20c4b3e6b6023453dc60dd5e522d22f11cb34b2733'
  const blockWithRawData = '0x2ae0d8f85f982800cbdf8b20c4b3e6b6023453dc60dd5e522d22f11cb34b2733'
  const blockWithoutTxs = '0x90ce1c2c2e988167a55143e9abc13a68f70d0e04a8b47aa19fa8ac1918ed8dc9'
  const blockWithoutBridgedTransfers = '0x90ce1c2c2e988167a55143e9abc13a68f70d0e04a8b47aa19fa8ac1918ed8dc9'

  before(() =>
    cy.visit(`/en-US/block/${blockWithTxs}`, {
      headers: {
        'Accept-Encoding': 'gzip, deflate',
      },
    }),
  )

  describe('block info', () => {
    it('should have title with block number', () => {
      cy.get('h5').should('contain.text', 'Block # 131,229')
    })

    it('should have block hash', () => {
      cy.get('dl').first().find('dt').should('have.text', 'block hash').next().should('have.text', blockWithTxs)
    })

    it('should have timestamp', () => {
      cy.get('dl')
        .first()
        .next()
        .find('dt')
        .should('have.text', 'timestamp')
        .next()
        .should(field => {
          const time = field.text()
          expect(new Date(time).getTime()).to.eq(1656043413000)
        })
    })

    it('should have layer 1 tx and block info', () => {
      cy.get('dl').first().next().next().as('layer1')

      cy.get('@layer1')
        .find('dt')
        .should('have.text', 'layer1 info')
        .next()
        .should(
          'have.text',
          'Transaction0x887d01f100cf90ad6cce763fdec1f786e536baf1298467a290284457b0276c5fin block5,800,487',
        )

      cy.get('@layer1')
        .find('dd div[attr-role="tx"] a')
        .should(
          'have.attr',
          'href',
          'https://pudge.explorer.nervos.org/transaction/0x887d01f100cf90ad6cce763fdec1f786e536baf1298467a290284457b0276c5f',
        )
        .should('have.attr', 'target', '_blank')

      cy.get('@layer1')
        .find('dd div[attr-role="block"] a')
        .should('have.attr', 'href', 'https://pudge.explorer.nervos.org/block/5800487')
        .should('have.attr', 'target', '_blank')
    })

    it('should have state', () => {
      cy.get('dl')
        .first()
        .next()
        .next()
        .next()
        .find('dt')
        .should('have.text', 'finalize state')
        .next()
        .should('have.text', 'finalized')
    })

    it('should have count of transactions', () => {
      cy.get('dl')
        .first()
        .next()
        .next()
        .next()
        .next()
        .find('dt')
        .should('have.text', 'transactions')
        .next()
        .should('have.text', '23')
    })

    it('should have aggregator', () => {
      cy.get('dl')
        .first()
        .next()
        .next()
        .next()
        .next()
        .next()
        .find('dt')
        .should('have.text', 'aggregator')
        .next()
        .should('have.text', '0x715ab282b873b79a7be8b0e8c13c4e8966a52040')
    })

    it('should have size', () => {
      cy.get('dl')
        .first()
        .next()
        .next()
        .next()
        .next()
        .next()
        .next()
        .find('dt')
        .should('have.text', 'size')
        .next()
        .should('have.text', '1,072 bytes')
    })

    it('should have gas used', () => {
      cy.get('dl')
        .first()
        .next()
        .next()
        .next()
        .next()
        .next()
        .next()
        .next()
        .find('dt')
        .should('have.text', 'gas used')
        .next()
        .should('have.text', '8,734,926')
    })

    it('should have gas limit', () => {
      cy.get('dl')
        .first()
        .next()
        .next()
        .next()
        .next()
        .next()
        .next()
        .next()
        .next()
        .find('dt')
        .should('have.text', 'gas limit')
        .next()
        .should('have.text', '87,103,928')
    })

    it('should have parent hash', () => {
      cy.get('dl')
        .last()
        .find('dt')
        .should('have.text', 'parent hash')
        .next()
        .should('have.text', '0xd02d7faba4a0644372c9e3e22f03fcb3e5cdbb494ee84dd102886567aa4496e0')
        .find('a')
        .should('have.attr', 'href', '/block/0xd02d7faba4a0644372c9e3e22f03fcb3e5cdbb494ee84dd102886567aa4496e0')
    })

    it('should have two tabs', () => {
      cy.get('[role=tab]')
        .first()
        .should('have.text', 'Transactions')
        .should('have.attr', 'href', `/block/${blockWithTxs}?tab=transactions`)
        .next()
        .should('have.text', 'Bridged Transfers')
        .should('have.attr', 'href', `/block/${blockWithTxs}?tab=bridged`)
    })
  })

  describe('should have a list of transactions by default', () => {
    it('should have 7 fields', () => {
      cy.get('th')
        .first()
        .should('have.text', 'Txn Hash')
        .next()
        .should('have.text', 'Method')
        .next()
        .should('contain.text', 'Block')
        .next()
        .should('have.text', 'Age')
        .next()
        .should('have.text', 'From')
        .next()
        .should('have.text', 'To')
        .next()
        .next()
        .should('contain.text', 'Value (pCKB)')
    })

    it('should have 20 record', () => {
      cy.get('tbody tr').should('have.length', 20)
    })

    it('should have 7 values in a record', () => {
      cy.get('tbody tr')
        .first()
        .find('td')
        .first()
        .should(field => {
          expect(field.text()).to.eq('0x1bbb32...3e4ba002')
          expect(field.find('a').attr('href')).to.eq(
            '/tx/0x1bbb3203bb9dac5b282308937e18129fbfd4e0bf710e5b463931a3d93e4ba002',
          )
        })
        .next()
        .should(field => {
          const badge = field.find('div')
          expect(badge).to.have.attr('data-is-native-transfer', 'true')
          expect(window.getComputedStyle(badge[0], 'after').content).to.eq('"Send"')
        })
        .next()
        .should(field => {
          expect(field.text()).to.eq('131,229')
          expect(field.find('a').attr('href')).to.eq(
            '/block/0x0a9fbb868d381f65328a811ffe441f80c328400b583887731ae7195579e0ca5d',
          )
        })
        .next()
        .should(field => {
          expect(field.find('time').attr('datetime')).to.eq('2022-06-24T04:03:33.492000Z')
        })
        .next()
        .should('have.text', '0x60a227...c90b8984')
        .next()
        .should('have.text', 'polyjuice creator')
        .next()
        .next()
        .should('have.text', '0.00000000')
    })
  })

  describe('should have a list of bridged transfers', () => {
    before(() => {
      cy.visit(`/en-US/block/${blockWithBridgedTransfers}?tab=bridged`)
    })
    it('should have 7 fields', () => {
      cy.get('th')
        .first()
        .should('contain.text', 'Type')
        .next()
        .should('contain.text', 'Value')
        .next()
        .should('contain.text', 'pCKB')
        .next()
        .should('contain.text', 'Age')
        .next()
        .should('contain.text', 'Account')
        .next()
        .should('contain.text', 'CKB Txn')
        .next()
        .should('contain.text', 'Block')
    })

    it('should have at least one record', () => {
      cy.get('tbody tr').should('have.length.at.least', 1)
    })

    it('should have 7 values in a record', () => {
      cy.get('tbody tr')
        .first()
        .find('td')
        .first()
        .should('have.text', 'Withdrawal')
        .next()
        .should('have.text', '10 USDC')
        .next()
        .should('have.text', '400')
        .next()
        .should(field => {
          expect(field.find('time').attr('datetime')).to.eq('2022-07-10T14:08:57.261Z')
        })
        .next()
        .should(field => {
          expect(field.text()).to.eq('0x9c0992...62a638b5')
          expect(field.find('a').attr('href')).to.eq('/account/0x9c09926927201527812364cf97aa9bb962a638b5')
        })
        .next()
        .should(field => {
          expect(field.text()).to.eq('0x1973a2...ab6a7ab4')
          expect(field.find('a').attr('href')).to.eq(
            'https://pudge.explorer.nervos.org/transaction/0x1973a24ce482a1988a667214d951514227d8d460e145a108998abee9ab6a7ab4#2',
          )
        })
        .next()
        .should(field => {
          expect(field.text()).to.eq('178,574')
          expect(field.find('a').attr('href')).to.eq(
            '/block/0x2ae0d8f85f982800cbdf8b20c4b3e6b6023453dc60dd5e522d22f11cb34b2733',
          )
        })
    })
  })

  describe('should have raw data', () => {
    it('should have raw data', () => {
      cy.visit(`/en-US/block/${blockWithRawData}?tab=raw-data`)
      cy.get('h6').should('have.text', 'Block')
      cy.get('[data-cy="raw-data"]').should('be.visible')
    })
  })

  describe('should display tabs with empty data', () => {
    it('should display empty transactions list', () => {
      cy.visit(`/en-US/block/${blockWithoutTxs}`)
      cy.get('tbody').should('contain.text', "There're no matching entries")
    })
    it('should display empty bridged transfers list', () => {
      cy.visit(`/en-US/block/${blockWithoutBridgedTransfers}?tab=bridged`)
      cy.get('tbody').should('contain.text', "There're no matching entries")
    })
  })
})
