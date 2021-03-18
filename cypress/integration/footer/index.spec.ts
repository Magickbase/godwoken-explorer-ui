/// <reference types="cypress" />

context('Footer', () => {
  before(() => {
    cy.visit('/en-US')
  })

  it('should have four links', () => {
    cy.get(`footer div[class^=footer_links]`).children().should('have.length', 4)
    cy.get(`footer div[class^=footer_links]`)
      .children()
      .each(link => {
        expect(link).to.have.attr('target').to.eq('_blank')
        expect(link).to.have.attr('href')
      })
  })

  it('should have copyright', () => {
    cy.get(`footer div[class^=footer_copyright]`).should('to.exist')
  })
})
