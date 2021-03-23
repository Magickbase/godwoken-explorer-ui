/// <reference types="cypress" />

context('Transaction List Page', () => {
  describe('general sets', () => {
    let id: number
    before(() => {
      cy.fixture('accountIds').then(ids => {
        id = ids.user
        cy.visit(`/en-US/txs?account_id=${id}`)
      })
    })

    it('cy.title() - get the title', () => {
      cy.title().should('include', 'Godwoken Explorer')
    })
  })

  describe.skip('empty list', () => {
    const id = '1'
    before(() => {
      cy.visit(`/en-US/txs?account_id=${id}`)
    })

    it('should have title with account id where id is a link', () => {
      cy.get('h2').should('have.text', `Transactions related to account${id}`)
      cy.get('h2 a').should(link => {
        expect(link).to.have.attr('href').to.eq(`/account/${id}`)
      })
    })
    it("should have 'no transaction found' instead of a list", () => {
      cy.get('h2+span').should('have.text', 'No transactions found')
    })
    it('should have disabled pager', () => {
      cy.get('.pager .links').each(link => {
        expect(link).to.have.attr('attr-disabled').to.eq('true')
      })
    })
  })

  describe('shoud have a list with required information', () => {
    let id: number
    before(() => {
      cy.fixture('accountIds').then(ids => {
        id = ids.user
        cy.visit(`/en-US/txs?account_id=${id}`)
      })
    })
    it('should have a list with 10 records at most', () => {
      cy.get('.list-container>div').children().should('have.length.lte', 10)
    })
    describe('should have required information in each record', () => {
      const ROOT_SELECTOR = `.list-item-container:first`
      it('should have tx hash which is a link', () => {
        cy.get(ROOT_SELECTOR)
          .find(`a[title='tx hash']`)
          .should(link => {
            const hash = link.text()
            expect(link).to.have.class('hashLink')
            expect(link).to.have.attr('href').to.eq(`/tx/${hash}`)
          })
      })
      it('should have tx type', () => {
        cy.get(`${ROOT_SELECTOR} span[title='type']`).should('have.class', 'tx-type-badge')
      })
      it('should have success status', () => {
        cy.get(`${ROOT_SELECTOR}>div>div:first`)
          .find('img')
          .should(img => {
            expect(img)
              .to.have.attr('alt')
              .to.match(/success|failure/)
          })
      })
      it('should have block number which is a link', () => {
        cy.get(`${ROOT_SELECTOR} a[title='block number']`).should(link => {
          const number = link.text()
          expect(link).to.have.attr('href').to.eq(`/block/${number}`)
        })
      })
      it('should have from account which is a link', () => {
        cy.get(`${ROOT_SELECTOR} a[title='from']`).should(link => {
          const id = link.text()
          expect(link).to.have.attr('href').to.eq(`/account/${id}`)
        })
      })
      it('should have to account which is a link', () => {
        cy.get(`${ROOT_SELECTOR} a[title='to']`).should(link => {
          const id = link.text()
          expect(link).to.have.attr('href').to.eq(`/account/${id}`)
        })
      })
      it('should have timestamp', () => {
        cy.get(ROOT_SELECTOR).find('time').should('to.exist')
      })
    })
  })

  describe.skip('should change url on paging', () => {
    const id = 2
    let TOTAL_PAGE = 4 // TODO: should fetch from fixture
    const ROOT_SELECTOR = '.pager'

    before(() => {
      cy.visit(`/en-US/txs?account_id=${id}`)
      cy.get('.pager').then(el => {
        TOTAL_PAGE = +el.attr('attr-total-page')
      })
    })

    describe('default to 1', () => {
      before(() => {
        cy.visit(`/en-US/txs?account_id=${id}`)
      })

      it('should indicate page 1', () => {
        cy.get(`${ROOT_SELECTOR} input`).should(input => {
          expect(input).to.have.attr('placeholder').to.eq('1')
        })
      })

      it('should disable navigation to previous pages', () => {
        cy.get(`${ROOT_SELECTOR} .links:first`).should(links => {
          expect(links).to.have.attr('attr-disabled').to.eq('true')
        })
      })

      it('should enable navigation to next pages', () => {
        cy.get(`${ROOT_SELECTOR} .links:last`).should(links => {
          expect(links).to.have.attr('attr-disabled').to.eq('false')
        })
      })

      it('should have a next page button to page 2', () => {
        cy.get(`${ROOT_SELECTOR} a[title='next']`).should(link => {
          expect(link).to.have.attr('href').to.eq(`/txs?account_id=${id}&page=2`)
        })
      })

      it('should have a last page button to the last page', () => {
        cy.get(`${ROOT_SELECTOR} a[title='last']`).should(link => {
          expect(link).to.have.attr('href').to.eq(`/txs?account_id=${id}&page=${TOTAL_PAGE}`)
        })
      })
    })

    describe('visit page 2', () => {
      before(() => {
        cy.visit(`/en-US/txs?account_id=${id}&page=2`)
      })
      it(`should indicate page 2`, () => {
        cy.get(`${ROOT_SELECTOR} input`).should(input => {
          expect(input).to.have.attr('placeholder').to.eq('2')
        })
      })

      it('should enable navigation to next pages', () => {
        cy.get(`${ROOT_SELECTOR} .links:last`).should(links => {
          expect(links).to.have.attr('attr-disabled').to.eq('false')
        })
      })

      it('should enable navigation to previous pages', () => {
        cy.get(`${ROOT_SELECTOR} .links:first`).should(links => {
          expect(links).to.have.attr('attr-disabled').to.eq('false')
        })
      })

      it(`should have a previous page button to page 1`, () => {
        cy.get(`${ROOT_SELECTOR} a[title='previous']`).should(link => {
          expect(link).to.have.attr('href').to.eq(`/txs?account_id=${id}&page=1`)
        })
      })

      it('should have a first page button to the first page', () => {
        cy.get(`${ROOT_SELECTOR} a[title='first']`).should(link => {
          expect(link).to.have.attr('href').to.eq(`/txs?account_id=${id}&page=1`)
        })
      })

      it('should have a next page button to page 3', () => {
        cy.get(`${ROOT_SELECTOR} a[title='next']`).should(link => {
          expect(link).to.have.attr('href').to.eq(`/txs?account_id=${id}&page=3`)
        })
      })
      it('should have a last page button to the last page', () => {
        cy.get(`${ROOT_SELECTOR} a[title='last']`).should(link => {
          expect(link).to.have.attr('href').to.eq(`/txs?account_id=${id}&page=${TOTAL_PAGE}`)
        })
      })
    })

    describe('visit last page', () => {
      before(() => {
        cy.visit(`/en-US/txs?account_id=${id}&page=${TOTAL_PAGE}`)
      })

      it(`should indicate page ${TOTAL_PAGE}`, () => {
        cy.get(`${ROOT_SELECTOR} input`).should(input => {
          expect(input).to.have.attr('placeholder').to.eq(`${TOTAL_PAGE}`)
        })
      })
      it('should disable navigation to next pages', () => {
        cy.get(`${ROOT_SELECTOR} .links:last`).should(links => {
          expect(links).to.have.attr('attr-disabled').to.eq('true')
        })
      })
      it('should enable navigation to previous pages', () => {
        cy.get(`${ROOT_SELECTOR} .links:first`).should(links => {
          expect(links).to.have.attr('attr-disabled').to.eq('false')
        })
      })
      it(`should have a previous page button to page ${TOTAL_PAGE - 1}`, () => {
        cy.get(`${ROOT_SELECTOR} a[title='previous']`).should(link => {
          expect(link)
            .to.have.attr('href')
            .to.eq(`/txs?account_id=${id}&page=${TOTAL_PAGE - 1}`)
        })
      })
      it('should have a first page button to the first page', () => {
        cy.get(`${ROOT_SELECTOR} a[title='first']`).should(link => {
          expect(link).to.have.attr('href').to.eq(`/txs?account_id=${id}&page=1`)
        })
      })
    })

    describe('change page by submitting page number', () => {
      beforeEach(() => {
        cy.visit(`/en-US/txs?account_id=${id}`)
      })
      it('should change url by submitting a valid page number', () => {
        cy.get(`${ROOT_SELECTOR} input`).type('3')
        cy.get(`${ROOT_SELECTOR} button[type=submit]`).click()
        cy.location('search').should('to.eq', `?account_id=${id}&page=3`)
      })

      it('should ignore submission if page number is out of range', () => {
        cy.get(`${ROOT_SELECTOR} input`).type('10')
        cy.get(`${ROOT_SELECTOR} button[type=submit]`).click()
        cy.location('search').should('to.eq', `?account_id=${id}`)
      })
    })
  })
})
