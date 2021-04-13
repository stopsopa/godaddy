/// <reference types="cypress" />

context('Repos page', () => {

  it('Count elements on the first page', () => {

    cy.visit('/repos/1')

    cy.get('.repo').its('length').should('eq', 10)
  });
})
