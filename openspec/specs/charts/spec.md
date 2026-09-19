# charts Specification

## Purpose

Display interactive price charts with multiple timeframes for each cryptocurrency.

## Requirements

### Requirement: Interactive price chart

The system SHALL display a Chart.js line chart for each cryptocurrency.

#### Scenario: Show chart on hover

- GIVEN a cryptocurrency card is displayed on desktop
- WHEN the user hovers over the card
- THEN the price chart appears after 300ms debounce

#### Scenario: Hide chart on leave

- GIVEN the price chart is visible
- WHEN the mouse leaves the card
- THEN the chart is hidden

#### Scenario: Mobile chart toggle

- GIVEN the viewport is mobile (<= 580px)
- WHEN the user clicks the "Graphique" button
- THEN the chart is displayed

### Requirement: Timeframe selection

The system SHALL support multiple timeframes: 1h, 24h, 7d, 30d, 1y.

#### Scenario: Switch timeframe

- GIVEN the chart is displayed
- WHEN the user clicks a timeframe button
- THEN the chart updates with data for the selected period

#### Scenario: Default timeframe

- GIVEN the chart is first displayed
- WHEN no timeframe is selected
- THEN the 7d timeframe is used by default

### Requirement: Chart data sources

The system SHALL load chart data from CoinGecko API via fetchCoinHistory.

#### Scenario: API data available

- GIVEN the chart requests data
- WHEN fetchCoinHistory returns prices
- THEN the chart renders the API data

#### Scenario: Fallback to sparkline

- GIVEN the API call fails
- WHEN sparkline_in_7d data is available
- THEN the chart renders sparkline data

#### Scenario: No data available

- GIVEN neither API nor sparkline data is available
- WHEN the chart is displayed
- THEN "Graphique indisponible" is shown
