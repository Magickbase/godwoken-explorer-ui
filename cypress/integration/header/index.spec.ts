/// <reference types="cypress" />

context('Header', () => {
  before(() => cy.visit('/en-US'))

  it('should have a logo', () => {
    cy.get(`header svg[id="logo"]`).should('to.exist')
  })

  it('logo should have a link to the home page', () => {
    cy.get(`header a[title=GwScan]`).should(link => {
      expect(link).to.have.attr('href').to.eq('/')
    })
  })

  it('should have menus', () => {
    cy.get(`header button[aria-label=home]`).should('to.exist')
    cy.get(`header button[id=token-menu]`).should('to.exist')
    cy.get(`header button[id=contracts-menu]`).should('to.exist')
    cy.get(`header button[id=charts-menu]`).should('to.exist')
    cy.get(`header button[id=chains-menu]`).should('to.exist')
  })

  it('should open popover menu', () => {
    cy.get(`header button[id=token-menu]`).click()
    cy.get(`a[title="Bridged Token"]`).should('have.text', 'Bridged Token')
  })

  it('should be able to change language', () => {
    cy.get(`header button[id=i18n-menu]`).click()
    cy.get(`a[title=简体中文]`).click()
    cy.url().should('include', '/zh-CN')
  })
})
