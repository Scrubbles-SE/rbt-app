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

describe("Sign Up", () => {
    context()



});