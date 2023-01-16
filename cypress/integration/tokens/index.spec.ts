/// <reference types="cypress" />

context('Tokens List Pages Tests', () => {
  ;[
    { path: 'tokens/bridge', title: /Bridged Token List/ },
    { path: 'tokens/native', title: /Layer 2 Native Token List/ },
    { path: 'nft-collections', title: /NFT Collections/ },
    { path: 'multi-token-collections', title: /Multi-token Collection/ },
  ].forEach(({ path, title }) => {
    describe(`Page: ${path}`, () => {
      before(() => cy.visit(`/en-US/${path}`))
      const waitForLoading = () => {
        cy.get('h5').contains(title).should('be.visible')
      }

      beforeEach(() => {
        cy.get('a[title="Prev"]').should('be.visible').as('prevBtn')
        cy.get('a[title="Next"]').should('be.visible').as('nextBtn')
      })

      describe(`${path}: list page common elements`, () => {
        it('should have a title', () => {
          cy.get('h5').contains(title)
        })
        it('should have number of kinds', () => {
          cy.get('h5+div > div')
            .contains(/\d Kinds in Total/)
            .should('be.visible')
        })
        it('should have page navigation arrows', () => {
          cy.get('@prevBtn')
            .first()
            .should(link => {
              expect(link)
                .to.has.attr('href')
                .to.match(new RegExp(`/${path}?.*before=`))
              expect(link).to.has.css('pointer-events', 'none')
            })
          cy.get('@nextBtn')
            .first()
            .should(link => {
              expect(link)
                .to.has.attr('href')
                .to.match(new RegExp(`/${path}?.*after=`))
              expect(link).to.has.css('cursor', 'pointer')
            })
        })
        it('should have a token filter icon', () => {
          cy.get('label[for="name_filter"] svg').should('be.visible')
        })
      })

      describe(`${path}: list page common actions`, () => {
        describe(`${path}: navigation actions`, () => {
          it('should have disabled prev arrow', () => {
            cy.get('@prevBtn')
              .first()
              .should(link => {
                expect(link).to.has.css('pointer-events', 'none')
              })
          })
          it.skip('should navigate to next page on click next arrow', () => {
            cy.get('@nextBtn').first().click({ force: true })
            waitForLoading()
            cy.location().should(loc => {
              expect(loc.pathname).to.eq(`/${path}`)
              expect(loc.search).to.match(/after=/)
            })
          })
          it.skip('should navigate back to prev page on click prev arrow', () => {
            cy.get('@prevBtn').first().click({ force: true })
            waitForLoading()
            cy.location().should(loc => {
              expect(loc.pathname).to.eq(`/${path}`)
              expect(loc.search).to.match(/before=/)
            })
            cy.visit(`/en-US/${path}`)
          })
          it('should have a list with 30 records by default', () => {
            waitForLoading()
            cy.get(`table tbody`).children().should('have.length.at.most', 30)
          })
          it('should show at most 50 records after selecting 50', () => {
            cy.get('p').contains(/Show/).siblings().first().click({ force: true })
            cy.get('ul').find('li[data-value=50]').click()
            cy.get(`table tbody tr`).should('have.length.at.most', 50)
          })
        })
        describe(`${path}: filter actions`, () => {
          beforeEach(() => {
            cy.get('table tbody tr:nth-child(1) td:nth-child(1) a').as('link')
          })
          it('should filter by token name', () => {
            cy.get('@link').then(link => {
              const tokenName = link.text().split('(')[0]
              cy.get('label[for="name_filter"]').click()
              cy.get('input[id="name_filter"]').should('be.visible').type(tokenName)
              cy.get('button[type="submit"]').should('be.visible').click()
              waitForLoading()
              cy.get(`table tbody`).children().should('have.length.at.least', 1)
              cy.get('table tbody tr:nth-child(1) td:nth-child(1) a').should('contain.text', tokenName)
            })
          })
        })
      })

      describe(`${path}: list pages table content`, () => {
        const ADDRESS_REGEX = /^0x[a-z0-9]{10}...[a-z0-9]{12}$/
        const FULL_ADDRESS_REGEX = /^0x[a-z0-9]{10,41}/
        if (path === 'tokens/bridge') {
          it('should have 6 headers', () => {
            cy.get('th')
              .first()
              .should('contain.text', 'Token')
              .next()
              .should('contain.text', 'Address')
              .next()
              .should('contain.text', 'Circulating Supply')
              .next()
              .should('contain.text', 'Holders')
              .next()
              .should('contain.text', 'Origin')
              .next()
              .should('contain.text', 'Bridge')
          })
          it('should have 6 values in a record', () => {
            cy.get('tbody tr')
              .first()
              .find('td')
              .first()
              .should('contain.text', 'pCKB')
              .next()
              .should(field => {
                expect(field.text()).to.match(ADDRESS_REGEX)
              })
              .next()
              .should(field => {
                expect(field.text()).to.match(/^\d+/)
              })
              .next()
              .should(field => {
                expect(field.text()).to.match(/^\d+/)
              })
              .next()
              .should('contain.text', 'CKB')
              .next()
              .should('contain.text', 'Godwoken Bridge')
          })
        } else if (path === 'tokens/native') {
          it('should have 6 headers', () => {
            cy.get('th')
              .first()
              .should('contain.text', 'Token')
              .next()
              .should('contain.text', 'Address')
              .next()
              .should('contain.text', 'Total Supply')
              .next()
              .should('contain.text', 'Holders')
              .next()
              .should('contain.text', 'Origin')
              .next()
              .should('contain.text', 'Bridge')
          })
          it('should have 6 values in a record', () => {
            cy.get('tbody tr')
              .first()
              .find('td')
              .first()
              .should('contain.text', 'pCKB')
              .next()
              .should(field => {
                expect(field.text()).to.match(FULL_ADDRESS_REGEX)
              })
              .next()
              .should(field => {
                expect(field.text()).to.match(/^\d+/)
              })
              .next()
              .should(field => {
                expect(field.text()).to.match(/^\d+/)
              })
              .next()
              .should('contain.text', 'CKB')
              .next()
              .should('contain.text', 'Godwoken Bridge')
          })
        } else if (path === 'nft-collections') {
          it('should have 4 headers', () => {
            cy.get('th')
              .first()
              .should('contain.text', 'Token')
              .next()
              .should('contain.text', 'Address')
              .next()
              .should('contain.text', 'Holder Count')
              .next()
              .should('contain.text', 'Minted Count')
          })
          it('should have 4 values in a record', () => {
            cy.get('tbody tr')
              .first()
              .find('td')
              .first()
              .should('contain.text', 'YokaiswapNFT')
              .next()
              .should(field => {
                expect(field.text()).to.match(FULL_ADDRESS_REGEX)
              })
              .next()
              .should(field => {
                expect(field.text()).to.match(/^\d+/)
              })
              .next()
              .should(field => {
                expect(field.text()).to.match(/^\d+/)
              })
          })
        } else if (path === 'multi-token-collections') {
          it('should have 4 headers', () => {
            cy.get('th')
              .first()
              .should('contain.text', 'Multi-token')
              .next()
              .should('contain.text', 'Address')
              .next()
              .should('contain.text', 'Type Count')
              .next()
              .should('contain.text', 'Holder Count')
          })
          it('should have 4 values in a record', () => {
            cy.get('tbody tr')
              .first()
              .find('td')
              .first()
              .should('not.be.empty')
              .next()
              .should(field => {
                expect(field.text()).to.match(FULL_ADDRESS_REGEX)
              })
              .next()
              .should(field => {
                expect(field.text()).to.match(/^\d+/)
              })
              .next()
              .should(field => {
                expect(field.text()).to.match(/^\d+/)
              })
          })
        }
      })
    })
  })
})
