/// <reference types="cypress" />

context.skip('Footer', () => {
  before(() => cy.visit('/en-US'))

  it('should have three links', () => {
    const links = cy.get(`footer div[id=footer-links]`).children().filter('a')
    links.should('have.length', 3)
    links.each(link => {
      expect(link).to.have.attr('target').to.eq('_blank')
      expect(link).to.have.attr('href')
    })
  })

  it('should have copyright', () => {
    cy.get(`footer p[id=footer-copy-right]`).should('to.exist')
  })
})
