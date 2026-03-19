PATTERN: Notification System

USE WHEN:
- alerts
- notifications
- user messages

ARCHITECTURE REQUIREMENTS:

Services:
- NotificationService

Channels:
- email
- SMS
- push notifications

Triggers:
- event-driven

RULES:

- notifications must be asynchronous
- system must support multiple channels
- retry mechanism required