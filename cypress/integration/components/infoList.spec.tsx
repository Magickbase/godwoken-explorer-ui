/// <reference types="cypress" />

import { mount } from '@cypress/react'
import InfoList from '../../../components/InfoList'

// TODO
// context.skip('Footer', () => {
//   before(() => cy.visit('/en-US'))

//   it('should have three links', () => {
//     const links = cy.get(`footer div[id=footer-links]`).children().filter('a')
//     links.should('have.length', 3)
//     links.each(link => {
//       expect(link).to.have.attr('target').to.eq('_blank')
//       expect(link).to.have.attr('href')
//     })
//   })

//   it('should have copyright', () => {
//     cy.get(`footer p[id=footer-copy-right]`).should('to.exist')
//   })

// import { mount } from 'cypress/react'
// import { HelloWorld } from './hello-world.jsx'
describe('InfoList component', () => {
  it('mount', () => {
    mount(<InfoList list={[]} />)
    // now use standard Cypress commands
    // cy.contains('Hello World!').should('be.visible')
  })
})