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


describe('Sign In', () => {


  context("Invalid password", () => {
    beforeEach(() => {});

    it("GIVEN I have opened up the main page", () => {
      cy.clearCookies();
    });

    it("WHEN I enter a valid email, before entering a valid name and password", () => {
      cy.visit('http://localhost:3000');
      cy.get("form").within(() => {
        cy.wait(1000);
        cy.get('input[id="email"]').should('not.be.disabled').type("testing@gmail.com");
        cy.get('button[type="submit"]').click();
        cy.get('input[id="password"]').should('be.visible').type("wrongPassword!");
        cy.get('button[type="submit"]').click();
      });

    });

    it("THEN the user should stay on the same page and be unable to proceed", () => {
      cy.get("h2").should('contain', "Welcome Back");
    })

  });
  
  context("Successful sign-up", () => {
    beforeEach(() => {});

    it("GIVEN I have opened up the main page", () => {});

    it("WHEN I enter a valid email, before entering a valid name and password", () => {
      cy.visit('http://localhost:3000');
      cy.get("form").within(() => {
        cy.wait(1000);
        cy.get('input[id="email"]').should('not.be.disabled').type("testing@gmail.com");
        cy.get('button[type="submit"]').should('be.visible').click();
        cy.get('input[id="password"]').should('be.visible').type("Password123$");
        cy.get('button[type="submit"]').click();
      })
    });

    it("THEN I should see a check mark and confirmation screen, before being shown to the home page", () => {
      cy.url().should('include', '/');

      cy.get('h1').should('contain', 'Home'); // Checks if there is the home page header
    });
  });
  






    



});

const BACKEND_URL = "http://localhost:8000";


describe("Journal successfully is sent to DB (POST CALL)", () => {

  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: "http://localhost:8000/api/login",
      body: {
        email: 'testing@gmail.com',
        password: 'Password123$'
      }
    })

  });


  context("Correctly input entry", () => {

    it("GIVEN the user has clicked submit on a journal entry");

    let entry = {
        user_id: "67a13e0d9c8a04466bd32264",
        is_public: true,
        rose_text: 'Slept well',
        bud_text: 'Have to finish up patch method',
        thorn_text: 'Tired',
        tags: []};

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
      rose_text: 'Slept well',};

      it("WHEN I attempt to post the entry", () => {
        cy.request({method: "POST",
          url: `${BACKEND_URL}/api/entries`,
          body: entry,
          failOnStatusCode: false,
        }).then((response) => {
          assert.equal(response.status, 400, "THEN I receive a bad response (400)");
        })
      });

  });

});

describe("All of a users entries are succesfullly retrieved (GET)" , () => {

  beforeEach(()=> {
  })

  
  context("Valid user Id returns correctly", () => {

    it("GIVEN the page is making a GET call for a user's entries (this could be main or entry page)", () => {
      cy.clearCookies();
      cy.request({
        method: 'POST',
        url: "http://localhost:8000/api/login",
        body: {
          email: 'testing@gmail.com',
          password: 'Password123$'
        }
      })
    });

    it("WHEN I attempt the GET call", () => {
      cy.request({method: "GET",
        url: `${BACKEND_URL}/api/entries`,
        failOnStatusCode: false,
      }).then((response) => {
        assert.equal(response.status, 200, "THEN I receive a successful response (200)");
        assert.exists(response.body[0]._id, "AND the response entry created contains an array of entries, and the first has an _id");
      });
    });


  });

  context("User has no entries", () => {
    it("GIVEN the user has no entries", () => {
      cy.clearCookies();
      cy.request({
        method: 'POST',
        url: "http://localhost:8000/api/login",
        body: {
          email: 'testing2@gmail.com',
          password: 'Password123$'
        }
      })
      
    });

    it("WHEN I attempt to view the entry", () => {


      cy.request({method: "GET",
        url: `${BACKEND_URL}/api/entries`,
        failOnStatusCode: false,
      }).then((response) => {
        assert.equal(response.status, 200, "THEN I receive a OK response (200)");
        assert.deepEqual(response.body, [], "AND the returned array is empty");
      })
    });


  });



});
