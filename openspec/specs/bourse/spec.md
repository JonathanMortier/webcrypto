# bourse Specification

## Purpose

Track stock market indices, portfolio holdings, x-stocks, and gold price.

## Requirements

### Requirement: Index tracking

The system SHALL display S&P 500, Nasdaq 100, Euro Stoxx 600, and MSCI World indices.

#### Scenario: Load indices data

- GIVEN the Bourse page is displayed
- WHEN data is fetched via fetchIndicesData
- THEN each index card shows current value and 24h change

#### Scenario: Cache indices data

- GIVEN indices data was recently fetched
- WHEN the page is reloaded within 10 minutes
- THEN cached data is used

### Requirement: Portfolio tracking

The system SHALL allow users to track units and average price per index.

#### Scenario: Add holdings

- GIVEN an index card is displayed
- WHEN the user enters units and average price
- THEN the portfolio calculates gains/losses

#### Scenario: Persist holdings

- GIVEN the user has entered holdings
- WHEN the page is reloaded
- THEN holdings are restored from localStorage (indices_holdings)

### Requirement: x-stocks display

The system SHALL display 7 x-stocks (AAPL, MSFT, etc.) in a bottom ticker.

#### Scenario: Load x-stocks

- GIVEN the main page is displayed
- WHEN data is fetched via fetchXStocks
- THEN the stocks ticker shows prices and 24h changes sorted by change

#### Scenario: Cache x-stocks

- GIVEN x-stocks data was recently fetched
- WHEN the page is reloaded within 120 seconds
- THEN cached data is used

### Requirement: Gold price

The system SHALL display the current gold price (GC=F).

#### Scenario: Load gold price

- GIVEN the Bourse page is displayed
- WHEN data is fetched via fetchGoldPrice
- THEN the gold card shows current price and 24h change

#### Scenario: Cache gold price

- GIVEN gold price was recently fetched
- WHEN the page is reloaded within 5 minutes
- THEN cached data is used

### Requirement: Yahoo Finance proxy

The system SHALL route Yahoo Finance API calls through a proxy.

#### Scenario: Dev proxy

- GIVEN the dev server is running
- WHEN a Yahoo Finance request is made
- THEN Vite proxy forwards it to query1.finance.yahoo.com

#### Scenario: Production proxy

- GIVEN the production server is running
- WHEN a Yahoo Finance request is made
- THEN Express server forwards it with rate limiting
