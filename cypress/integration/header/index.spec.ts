/// <reference types="cypress" />

context('Header', () => {
  before(() => cy.visit('/en-US'))

  it('should have a logo', () => {
    cy.get(`header svg[id="logo"]`).should('to.exist')
  })

  it('should have a link to the home page', () => {
    cy.get(`header a[title=GwScan]`).should(link => {
      expect(link).to.have.attr('href').to.eq('/')
    })
  })

  it('should open popover menu', () => {
    cy.get(`header button[aria-label=token-list]`).click()
    cy.get(`a[title="Bridged Token"]`).should('have.text', 'Bridged Token')
    cy.get(`body`).click()
  })

  it('should be able to change language', () => {
    cy.get(`header button[aria-label=i18n]`).click()
    cy.get(`a[title=简体中文]`).click()
    cy.url().should('include', '/zh-CN')
  })
})
