# alerts Specification

## Purpose

Notify users when favorite cryptocurrencies reach significant price changes.

## Requirements

### Requirement: Price alerts

The system SHALL detect when favorite cryptocurrencies exceed a configurable price threshold.

#### Scenario: Threshold exceeded

- GIVEN a cryptocurrency is in favorites
- AND the current price differs by more than ALERT_THRESHOLD from the daily snapshot
- WHEN the price check runs
- THEN the cryptocurrency is flagged for alert

#### Scenario: Daily snapshot reset

- GIVEN a new day starts
- WHEN the price check runs
- THEN the daily snapshot is reset
- AND previous alert prices are cleared

#### Scenario: Prevent re-alerts

- GIVEN a cryptocurrency was already alerted
- WHEN the price has not moved another ALERT_THRESHOLD from the last alert price
- THEN no new alert is sent

### Requirement: Browser notifications

The system SHALL send browser notifications when price alerts trigger.

#### Scenario: Batched notification

- GIVEN multiple cryptocurrencies exceed the threshold
- WHEN notifications are sent
- THEN a single grouped notification is created with all alerts

#### Scenario: Permission denied

- GIVEN browser notification permission is denied
- WHEN an alert triggers
- THEN a toast message is shown informing the user

#### Scenario: Notifications disabled

- GIVEN the user has disabled notifications
- WHEN a price alert triggers
- THEN no notification is sent

### Requirement: Alert configuration

The system SHALL use ALERT_THRESHOLD from constants.js as the default threshold.

#### Scenario: Default threshold

- GIVEN no custom threshold is set
- WHEN price comparison runs
- THEN the default threshold of 5% is used
