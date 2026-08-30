# categories Specification

## Purpose

Allow users to filter cryptocurrencies by category and reveal the stablecoins that are hidden from the main grid.

## Requirements

### Requirement: Category badges on crypto cards

The system SHALL display up to three category tags on each crypto card.

#### Scenario: Card with categories

- GIVEN a cryptocurrency has categories
- WHEN its card is rendered
- THEN up to three category tags are displayed on the card

#### Scenario: Card without categories

- GIVEN a cryptocurrency has no known categories
- WHEN its card is rendered
- THEN no category tags are displayed

### Requirement: Filter by category

The system SHALL let users filter the displayed cryptocurrencies by category via a dropdown in the header.

#### Scenario: Select a category

- GIVEN the category dropdown is shown in the header
- WHEN the user selects a category
- THEN the grid shows cryptocurrencies belonging to that category

#### Scenario: Reset to all

- GIVEN a category is selected
- WHEN the user selects "Toutes les catégories"
- THEN the full market list is displayed again

#### Scenario: Fallback on API failure

- GIVEN the category markets API call fails
- WHEN the user selects a category
- THEN the grid falls back to filtering the loaded top-50 list by that category

### Requirement: Stablecoins section

The system SHALL provide a collapsible section that reveals the stablecoins hidden from the main grid.

#### Scenario: Section collapsed by default

- GIVEN the dashboard is shown
- WHEN the user loads the page
- THEN the stablecoin section is collapsed

#### Scenario: Expand stablecoins

- GIVEN the stablecoin section toggle is visible
- WHEN the user clicks it
- THEN the hidden stablecoins are revealed

#### Scenario: Collapse stablecoins

- GIVEN the stablecoin section is expanded
- WHEN the user clicks the toggle again
- THEN the stablecoin section is collapsed
