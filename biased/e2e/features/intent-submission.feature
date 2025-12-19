Feature: Intent Submission

  Scenario: Submit a new intent with test cases
    Given I navigate to the intent submission page
    When I fill in the intent field with "Create a user dashboard for monitoring system health"
    And I fill in the test cases field with:
      """
      User can view real-time metrics
      User can export reports to PDF
      System displays alerts for critical issues
      """
    And I click the "Generate AI prompt" button
    Then I should see a markdown preview
    And the preview should contain "# Intent"
    And the preview should contain "# Natural language test cases"
    And the preview should contain "- User can view real-time metrics"
    When I click the "Submit" button
    Then I should see a success message
    And I should see a PR URL link
