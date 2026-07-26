# ux Specification

## Purpose

Provide a polished, responsive user experience with theme support and keyboard navigation.

## Requirements

### Requirement: Dark/light theme

The system SHALL support dark and light themes with a toggle.

#### Scenario: Toggle theme

- GIVEN the theme toggle is visible
- WHEN the user clicks the toggle
- THEN the theme switches between dark and light

#### Scenario: Persist theme

- GIVEN the user has selected a theme
- WHEN the page is reloaded
- THEN the theme preference is restored from localStorage

#### Scenario: Keyboard shortcut

- GIVEN the crypto grid is displayed
- WHEN the user presses "T"
- THEN the theme toggles

### Requirement: Responsive layout

The system SHALL adapt the layout for mobile, tablet, and desktop.

#### Scenario: Mobile layout

- GIVEN the viewport width is <= 580px
- WHEN the crypto grid is displayed
- THEN cards stack vertically
- AND a chart toggle button appears on each card

#### Scenario: Desktop layout

- GIVEN the viewport width is > 580px
- WHEN the crypto grid is displayed
- THEN cards are arranged in a responsive grid

### Requirement: Keyboard shortcuts

The system SHALL support keyboard shortcuts for common actions.

#### Scenario: Refresh shortcut

- GIVEN the crypto grid is displayed
- WHEN the user presses "R"
- THEN data is refreshed

#### Scenario: Skip shortcuts in input

- GIVEN an input field is focused
- WHEN the user presses R, F, or T
- THEN the shortcut is not triggered

### Requirement: Navigation menu

The system SHALL provide a hamburger menu for page navigation.

#### Scenario: Navigate to Bourse

- GIVEN the hamburger menu is open
- WHEN the user clicks "Bourse"
- THEN the Bourse page is displayed

#### Scenario: Navigate to CryptoWatch

- GIVEN the hamburger menu is open
- WHEN the user clicks "CryptoWatch"
- THEN the main dashboard is displayed
