/// <reference types="cypress" />

context('Charts Pages', () => {
  before(() => cy.visit('/en-US/charts'))

  describe('General elements', () => {
    it('should have a banner', () => {
      cy.get('div[role=alert]').should('contain.text', 'Data will update at 00:10(UTC+0) everyday')
    })
    it('should remove banner on click clear', () => {
      cy.get('[data-cy=remove-charts-banner-btn]').click()
      cy.get('div[role=alert]').contains('Data will update at 00:10(UTC+0) everyday').should('not.be.visible')
    })
    it('should have 6 charts', () => {
      cy.get('[data-cy="charts-list"]').children().should('have.length', 6)
    })
  })

  describe('In each chart', () => {
    it('should have a title', () => {
      cy.get('[data-cy="charts-list"]')
        .children()
        .each(chart => {
          cy.wrap(chart).get('[data-cy=chart-title]').should('be.visible')
        })
    })
    it('should have y-axis label', () => {
      cy.get('[data-cy="charts-list"]')
        .children()
        .each(chart => {
          cy.wrap(chart).get('[data-cy="chart-y-label"]').should('be.visible')
        })
    })
    it('should have axis ticks', () => {
      cy.get('[data-cy="charts-list"]')
        .children()
        .each(chart => {
          cy.wrap(chart).get('g[class*="recharts-cartesian-axis-tick"] text[orientation="bottom"]').should('be.visible')
          cy.wrap(chart).get('g[class*="recharts-cartesian-axis-tick"] text[orientation="left"]').should('be.visible')
        })
    })
    it('should have a chart', () => {
      cy.get('[data-cy="charts-list"]')
        .children()
        .each(chart => {
          cy.wrap(chart).get('g[class="recharts-cartesian-grid"]').should('be.visible')
        })
    })
    it('should show data tooltip', () => {
      cy.get('[data-cy="charts-list"]')
        .children()
        .each(chart => {
          cy.wrap(chart).trigger('mouseover')
          cy.wrap(chart).get('[data-cy="chart-tooltip"] li').should('be.visible')
        })
    })
    it('should have a brush', () => {
      cy.get('[data-cy="charts-list"]')
        .children()
        .each(chart => {
          cy.wrap(chart).get('g[class*="recharts-brush"]').should('be.visible')
        })
    })
  })
})
