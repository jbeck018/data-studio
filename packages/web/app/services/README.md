# Real-time Data Services

This directory contains the real-time data services implementation using WebSockets and PostgreSQL's LISTEN/NOTIFY feature.

## Architecture

The real-time system consists of three main components:

1. WebSocket Server (`websocket.server.ts`)
2. WebSocket Client (`../utils/websocket.client.ts`)
3. React Hook (`../hooks/useWebSocket.ts`)

### WebSocket Server

The server handles:
- WebSocket connections and disconnections
- PostgreSQL LISTEN/NOTIFY subscriptions
- Message broadcasting to subscribed clients
- Automatic reconnection to PostgreSQL
- Connection pooling and cleanup

### WebSocket Client

The client provides:
- Automatic connection management
- Subscription handling
- Reconnection with exponential backoff
- Message queuing during disconnections
- Type-safe message handling

### React Hook

The hook offers:
- Easy-to-use React interface
- Automatic cleanup on unmount
- Type-safe message handling
- Singleton client pattern

## Usage

### Server Setup

```typescript
import { RealtimeServer } from './services/websocket.server';

const wsServer = new RealtimeServer(httpServer, process.env.DATABASE_URL);
```

### Client Usage

```typescript
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const { sendNotification } = useWebSocket('my-channel', (payload) => {
    console.log('Received:', payload);
  });

  return <div>Real-time component</div>;
}
```

### PostgreSQL Notifications

```sql
-- Send a notification
SELECT pg_notify('channel_name', '{"type": "update", "data": {"id": 1}}');

-- Listen for notifications in psql
LISTEN channel_name;
```

## Channel Types

The system supports these notification channels:

1. `query_results_${queryId}`
   - Notifications for long-running query results
   - Payload: `{ status: 'completed' | 'error', data?: any, error?: string }`

2. `table_updates_${tableName}`
   - Real-time table data changes
   - Payload: `{ operation: 'INSERT' | 'UPDATE' | 'DELETE', data: any }`

3. `system_notifications`
   - System-wide notifications
   - Payload: `{ type: 'info' | 'warning' | 'error', message: string }`

## Error Handling

The system includes comprehensive error handling:
- Automatic reconnection for both WebSocket and PostgreSQL
- Message queuing during disconnections
- Error reporting through the notification system
- Rate limiting for reconnection attempts

## Security Considerations

1. Message Validation
   - All messages are validated against TypeScript interfaces
   - JSON payloads are sanitized
   - Channel names are validated against allowed patterns

2. Connection Management
   - Maximum connections per client
   - Automatic cleanup of stale connections
   - Rate limiting for subscription requests

3. PostgreSQL Security
   - Separate connection pool for notifications
   - Limited permissions for notification user
   - Sanitized channel names

## Best Practices

1. Channel Naming
   - Use consistent prefixes for different types of notifications
   - Include relevant IDs in channel names
   - Keep channel names short but descriptive

2. Message Format
   - Always include a `type` field
   - Use consistent payload structures
   - Include timestamps for time-sensitive data

3. Error Handling
   - Always handle WebSocket errors in components
   - Implement retry logic with backoff
   - Clean up subscriptions when components unmount
