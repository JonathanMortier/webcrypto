# tools-filter Specification

## Purpose

Provide filtering, sorting, search, and watchlist capabilities for the crypto dashboard.

## Requirements

### Requirement: Advanced filters

The system SHALL allow users to filter cryptocurrencies by gain/loss, volume, and market cap.

#### Scenario: Filter by 24h gain

- GIVEN the crypto grid is displayed
- WHEN the user selects the gain filter
- THEN only cryptocurrencies with positive 24h change are shown

#### Scenario: Filter by 24h loss

- GIVEN the crypto grid is displayed
- WHEN the user selects the loss filter
- THEN only cryptocurrencies with negative 24h change are shown

### Requirement: Multi-column sorting

The system SHALL allow users to sort the crypto grid by clicking column headers.

#### Scenario: Sort by market cap

- GIVEN the crypto grid is displayed
- WHEN the user clicks the market cap header
- THEN cryptocurrencies are sorted by market cap descending
- AND clicking again reverses the sort direction

### Requirement: Search

The system SHALL provide a search bar to find cryptocurrencies by name or symbol.

#### Scenario: Search by name

- GIVEN the search bar is visible
- WHEN the user types "bitcoin"
- THEN only cryptocurrencies matching "bitcoin" are displayed

#### Scenario: Keyboard shortcut for search

- GIVEN the crypto grid is displayed
- WHEN the user presses "F"
- THEN the search input is focused

### Requirement: Watchlist (favorites)

The system SHALL allow users to save favorite cryptocurrencies locally.

#### Scenario: Add to favorites

- GIVEN a cryptocurrency card is displayed
- WHEN the user clicks the star icon
- THEN the cryptocurrency is added to favorites
- AND the star icon becomes filled

#### Scenario: Remove from favorites

- GIVEN a cryptocurrency is in favorites
- WHEN the user clicks the filled star icon
- THEN the cryptocurrency is removed from favorites

#### Scenario: Filter favorites only

- GIVEN the user has favorites
- WHEN the user activates the favorites filter
- THEN only favorited cryptocurrencies are displayed

#### Scenario: Persist favorites

- GIVEN the user has favorites
- WHEN the page is reloaded
- THEN favorites are restored from localStorage
