/// <reference types="cypress" />

context('Header', () => {
  before(() => {
    cy.visit('/en-US')
  })

  it('should have a logo', () => {
    cy.get(`header img[alt='logo']`).should('to.exist')
  })

  it('should have a link to the home page', () => {
    cy.get(`header a[title='Godwoken Explorer']`).should(link => {
      expect(link.text()).to.eq('Godwoken Explorer')
      expect(link).to.have.attr('href').to.eq('/')
    })
  })
})
