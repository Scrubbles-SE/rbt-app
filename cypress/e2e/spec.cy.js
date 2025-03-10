/*
Feature: Sign-up
Description: “As a journal user, I want to sign up for the app so that I can access all the features for registered users”

Background:
Given I’ve chosen to sign up
When I enter the email and password

Scenario 1: Successful sign-in
As a user, I enter a valid email (has proper email format with at sign) and a strong password
Then I should see a check mark as confirmation of account creation after hitting submit
And I should be let into the app home screen

Scenario 2: Weak password
As a user, I enter a valid email (has proper email format with at sign) and a weak password without a number or symbol
Then I should see the password strength bar not full and not green
And be prompted to add a number and symbol
And I shouldn't be allowed in until I add those characters

Scenario 3: Invalid email
As a user, I enter an invalid email without an at sign and a strong password
Then I should see a message that prompts me to enter a valid email with an at sign
And I shouldn’t be able to complete my sign-up without fixing my email
*/


describe('Sign Up', () => {
  /*
  context("Successful sign-up", () => {
    beforeEach(() => {});

    it("GIVEN I have opened up the main page", () => {});

    it("WHEN I enter a valid email, before entering a valid name and password", () => {
      cy.visit('http://localhost:3000');
      cy.get("form").within(() => {
        cy.get('input[id="email"]').should('not.be.disabled').type("testing@gmail.com");
        cy.get('button[type="submit"]').should('be.visible').click();
        cy.get('input[id="firstName"]').type("Cypress");
        cy.get('input[id="password"]').type("e3eiei$woFo");
        cy.get('input[id="confirmPassword"]').type("e3eiei$woFo");
        cy.get('button[type="submit"]').click();
      })
    });

    it("THEN I should see a check mark and confirmation screen, before being shown to the home page", () => {
      cy.url().should('include', '/');

      cy.get('h1').should('contain', 'Welcome back, Cypress!'); // Checks if there is the home page header
    });
  });
  */

  context("Invalid email", () => {
    beforeEach(() => {});

    it("GIVEN I have opened up the main page", () => {});

    it("WHEN I enter a valid email, before entering a valid name and password", () => {
      cy.visit('http://localhost:3000');
      cy.get("form").within(() => {
        cy.get('input[id="email"]').type("failedmeila");
        cy.get('button[type="submit"]').click();
      });

    });

    it("THEN the user should stay on the same page and be unable to proceed", () => {
      cy.get("h2").should('contain', "Let's Get Started");
    })

  });

  context("Weak password", () => {

    beforeEach(() => {});

    it("GIVEN I enter a valid email and am redirected to the home page", () => {
      cy.visit('http://localhost:3000');
      cy.get("form").within(() => {
        cy.get('input[id="email"]').should('not.be.disabled').type("testing123@gmail.com");
        cy.get('button[type="submit"]').click();
      });
    });

    it("WHEN I input an invalid (not strong enough) password", () => {
      cy.get("form").within(() => {
        cy.get('input[id="firstName"]').type("Cypress");
        cy.get('input[id="password"]').type("12345");
        cy.get('input[id="confirmPassword"]').type("12345");
      });

    });``

    it("THEN the create account button should be disabled", () => {
      cy.get('button[type="submit"]').should("be.disabled");
    });




    
  })




  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
});

const BACKEND_URL = "http://localhost:8000";


describe("Journal successfully is sent to DB (POST CALL)", () => {

  context("Correctly input entry", () => {
    beforeEach(() => {});

    it("GIVEN the user has clicked submit on a journal entry");

    let entry = {
        user_id: "67a13e0d9c8a04466bd32264",
        is_public: true,
        rose_text: 'Slept well',
        bud_text: 'Have to finish up patch method',
        thorn_text: 'Tired'};

      it("WHEN I attempt to post the entry", () => {
        cy.request({method: "POST",
          url: `${BACKEND_URL}/api/entries`,
          body: entry,
          failOnStatusCode: false,
        }).then((response) => {
          assert.equal(response.status, 201, "THEN I receive a successful response (201)");
          assert.exists(response.body._id, "AND the response entry created contains an _id");
        })
      });


  });

  context("Bad journal entry is sent to DB", () => {
    beforeEach(() => {});

    it("GIVEN the user has clicked submit on a journal entry");

    let entry = {
      user_id: "efhoeihqi0ohw",
      is_public: true,
      rose_text: 'Slept well',
      bud_text: '',
      thorn_text: ''};

      it("WHEN I attempt to post the entry", () => {
        cy.request({method: "POST",
          url: `${BACKEND_URL}/api/entries`,
          body: entry,
          failOnStatusCode: false,
        }).then((response) => {
          assert.equal(response.status, 500, "THEN I receive a bad response (500)");
        })
      });

  });

});

describe("All of a users entries are succesfullly retrieved (GET)" , () => {
  
  context("Valid user Id returns correctly", () => {

    it("GIVEN the page is making a GET call for a user's entries (this could be main or entry page)");

    const userId = "67a13e0d9c8a04466bd32264";
    it("WHEN I attempt the GET call", () => {
      cy.request({method: "GET",
        url: `${BACKEND_URL}/api/entries`,
        userId: userId,
        failOnStatusCode: false,
      }).then((response) => {
        assert.equal(response.status, 201, "THEN I receive a successful response (201)");
        assert.exists(response.body[0]._id, "AND the response entry created contains an array of entries, and the first has an _id");
      });
    });


  });

  context("Invalid user ID returns bad", () => {
    it("GIVEN a bad request (in this example, a user ID which doesn't exist) for getting a user's entries");

    it("WHEN I attempt to post the entry", () => {

      const userId = "ewihfowief";
      cy.request({method: "GET",
        url: `${BACKEND_URL}/api/entries`,
        userId: userId,
        failOnStatusCode: false,
      }).then((response) => {
        assert.equal(response.status, 500, "THEN I receive a bad response (500)");
      })
    });


  });



});
