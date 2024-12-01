# Drizzle-like Database Management Studio

## Context
The project is a web-based database management studio similar to Data Studio, providing a modern interface for database operations and management.

## Current Status
### Completed Features
1. Basic project structure and setup
   - Express server with Remix frontend
   - TypeScript configuration
   - WebSocket communication layer
   - Dark mode support with theme toggle
   - Proper theme colors and styling
   - Empty states for all views

2. UI Components
   - Side navigation with Tables and Query pages
   - Dark/Light theme toggle
   - SQL query editor with formatting
     - [x] Fixed cursor focus retention during typing
     - [x] Proper value synchronization with parent components
   - Table structure viewer and editor with tab interface
   - Empty states for no data scenarios
   - Consistent styling across light and dark modes
   - Inline data editing with keyboard support
   - Row deletion capability
   - Card-based row details sidebar with slide-over animation
   - Responsive layout with proper spacing and typography

3. Database Operations
   - Basic database connection and pooling
   - Table listing functionality
   - SQL query execution with sanitization
     - [x] SQL query validation and sanitization
     - [x] Protection against dangerous operations
     - [x] Query error handling with typed errors
     - [x] Reserved keyword checking
     - [x] Table and column name validation
   - Query results display
   - Table structure viewing and editing
   - Column management (add, remove, modify)
   - Primary key management
   - Data editing and deletion
   - Row details viewing with formatted display

4. Authentication
   - [x] JWT-based authentication
   - [x] Organization-level access control
   - [x] Role-based permissions
   - [x] Multi-organization support
     - [x] Organization switching
     - [x] Organization-specific roles and permissions
     - [x] Organization-specific database connections
   - [x] Session management
     - [x] Secure cookie-based sessions
     - [x] Organization context preservation
     - [x] Automatic organization selection
   - [x] Connection requirements
     - [x] Organization-specific connection checks
     - [x] Connection setup flow
     - [x] Active connection validation

### Remaining Work

#### 1. Web Package (@drizzle-server/web)
- [x] Implement core backend functionality
  - [x] Database schema for organizations
  - [x] User authentication and authorization
  - [x] Organization management
  - [x] Database connection handling
  - [x] Query execution engine
    - [x] Connection pooling with limits
    - [x] Query timeouts
    - [x] Query history tracking
    - [x] Row limits for safety
    - [x] Error handling and validation
- [ ] Add frontend features
  - [x] Authentication and organization UI
    - [x] Login page with email/password
    - [x] Registration page with organization creation
    - [x] Organization selection page
    - [ ] Organization settings page
      - [x] Member management
      - [x] Role assignment
      - [ ] Connection management
    - [ ] User profile page
      - [ ] Password change
      - [ ] Email preferences
      - [ ] Theme settings
  - [ ] Connection management UI
    - [ ] Connection creation wizard
    - [ ] Connection testing
    - [ ] Connection editing
    - [ ] Connection deletion with confirmation
  - [x] Loading states and error handling
    - [x] SQL query execution loading state
    - [x] SQL formatting loading state
    - [x] SQL syntax validation and error highlighting
    - [x] Improved error messages with context
  - [x] Syntax highlighting for SQL editor
  - [x] Auto-complete for SQL queries
    - [x] SQL keyword suggestions
    - [x] Table name completion
    - [x] Column name completion
    - [x] Context-aware suggestions
  - [x] Schema visualization using @xyflow/react
    - [x] Interactive table nodes with column details
      - [x] Column properties (name, type, nullable)
      - [x] Primary and foreign key indicators
      - [x] Unique constraint indicators
      - [x] Index status indicators
      - [x] Table ID and metadata display
    - [x] Relationship edges with cardinality indicators
    - [x] Multiple layout algorithms
      - [x] Force-directed layout with physics simulation
      - [x] Circular layout with customizable radius
      - [x] Tree layout with hierarchical relationships
      - [x] Custom layout support
    - [x] Node statistics and metrics
      - [x] Basic statistics (column counts, key counts)
      - [x] Relationship analysis (incoming/outgoing counts)
      - [x] Column type distribution
      - [x] Complexity scoring
      - [x] Centrality metrics
    - [x] Search and filter capabilities
    - [x] Export to SVG functionality
    - [x] Highlighting of related tables
  - [x] Natural language query suggestions using RAG and pg_ai
    - [x] Integration with pg_ai for embeddings and vector search
    - [x] Common query pattern management
    - [x] Template-based SQL generation
    - [x] Smart value extraction from user input
    - [x] Query history tracking and learning
    - [x] Context-aware suggestions based on schema
    - [x] Real-time query suggestions
    Features:
    - Natural language to SQL translation
    - Query pattern matching and reuse
    - Smart template processing with relationship awareness
    - Value extraction with type inference
    - Query history tracking for improvement
    - Schema-aware suggestions
    Implementation:
    - Uses pg_ai extension for embeddings and vector search
    - Maintains a query_patterns table for common patterns
    - Template-based SQL generation with smart context handling
    - Advanced value extraction for dates, numbers, and strings
    - Query history tracking for learning and improvement
  - [ ] Analytics and visualization tools
  - [ ] Advanced data visualization
    - [ ] Interactive query result visualizations (charts, graphs, pivot tables)
    - [ ] Solution similar to Rill to auto-generate reports on tables and relations to those tables using AI and LLMs. Reference: https://github.com/rilldata/rill
      - [ ] Automatic data profiling and anomaly detection
      - [ ] Smart aggregations and metric suggestions
      - [ ] Natural language querying for report generation
      - [ ] Relationship discovery between tables
    - [ ] Database schema relationship diagrams
      - [ ] Interactive ERD with zoom and pan
      - [ ] Highlight related tables and foreign key paths
      - [ ] Schema change history visualization
    - [ ] Performance analytics from pg_stats
      - [ ] Query performance monitoring and trends
      - [ ] Index usage statistics
      - [ ] Table access patterns
      - [ ] Lock and blocking analysis
    - [ ] Table size and growth trends
      - [ ] Size forecasting with ML models
      - [ ] Bloat analysis and cleanup recommendations
      - [ ] Storage optimization suggestions
    - [ ] Query pattern analysis
      - [ ] Most frequent queries and patterns
      - [ ] Resource-intensive queries
      - [ ] Query optimization suggestions using AI
    - [ ] Custom dashboards
      - [ ] Drag-and-drop dashboard builder
      - [ ] Saved queries and visualizations
      - [ ] Real-time monitoring views
      - [ ] Shareable dashboard links
    - [ ] Data quality metrics
      - [ ] Column nullability analysis
      - [ ] Data distribution visualization
      - [ ] Constraint violation monitoring
      - [ ] Data freshness tracking
  - [ ] Implement real-time capabilities
    - [x] WebSocket server
    - [x] PostgreSQL LISTEN/NOTIFY
    - [x] Subscription management
    - [ ] Real-time component updates
      - [x] Query Results Component
        - [x] Stream large query results in chunks
        - [x] Show progress for long-running queries
        - [x] Real-time result updates for LISTEN/NOTIFY events
        - [x] Cancelable queries with cleanup
      - [ ] Table Browser Component
        - [ ] Real-time row updates
        - [ ] Live row count updates
        - [ ] Background data prefetching
        - [ ] Optimistic UI updates
      - [ ] Schema Browser Component
        - [ ] Live schema change notifications
        - [ ] Real-time table size updates
        - [ ] Background index statistics updates
      - [ ] Query History Component
        - [ ] Live query execution tracking
        - [ ] Real-time performance metrics
        - [ ] Resource usage monitoring
      - [ ] Dashboard Components
        - [ ] Live chart updates
        - [ ] Real-time metric refreshes
        - [ ] Concurrent query execution
    - [ ] Performance Optimizations
      - [ ] Message batching and debouncing
      - [ ] Selective updates (partial DOM updates)
      - [ ] Background data prefetching
      - [ ] Connection pooling and multiplexing
      - [ ] Compression for large payloads
    - [ ] Error Handling and Recovery
      - [ ] Automatic reconnection with backoff
      - [ ] Message queuing during disconnections
      - [ ] State reconciliation after reconnect
      - [ ] Partial update recovery
    - [ ] Security Features
      - [x] WebSocket authentication
      - [ ] Rate limiting
      - [ ] Payload validation
      - [ ] Channel access control
    - [ ] Monitoring and Debugging
      - [ ] Connection status indicators
      - [ ] Message logging and inspection
      - [ ] Performance metrics tracking
      - [ ] Error reporting and analytics
    - [ ] Developer Tools
      - [ ] WebSocket inspector component
      - [ ] Message replay functionality
      - [ ] Channel subscription debugger
      - [ ] Performance profiling tools

  - [ ] Query execution and results
    - [ ] Streaming query results
      - [x] Progressive loading of large result sets
      - [x] Real-time result updates
      - [x] Cancelable queries
      - [x] Background execution
    - [ ] Query execution plans
      - [ ] Live execution plan updates
      - [ ] Real-time statistics
      - [ ] Resource usage monitoring
    - [ ] Result caching
      - [ ] Intelligent cache invalidation
      - [ ] Partial result caching
      - [ ] Background cache warming
  - [ ] Authentication and Access Control
  - [ ] Implement authentication gate for all routes
  - [ ] Redirect unauthenticated users to login page
  - [ ] Force new users to create their first database connection
  - [ ] Prevent access to any other routes until first connection is created

#### 2. Client Package (@drizzle-server/client)
- [ ] Design type-safe API client
  - [ ] Connection management
  - [ ] Query builder
  - [ ] Real-time subscriptions
- [ ] Add query optimization
  - [ ] Query analysis
  - [ ] Suggestion engine
- [ ] Implement caching layer
  - [ ] Result caching
  - [ ] Schema caching

#### 3. Testing & Documentation
- [ ] Add unit tests for core functionality
  - [ ] SQL sanitizer tests
  - [ ] Query engine tests
  - [ ] WebSocket handler tests
  - [ ] Authentication tests
- [ ] Implement integration tests
  - [ ] Database connection tests
  - [ ] Query execution tests
  - [ ] Real-time update tests
- [ ] Add end-to-end tests
  - [ ] User flow tests
  - [ ] Query editor tests
  - [ ] Table browser tests
- [ ] Create user documentation
  - [ ] Installation guide
  - [ ] Configuration guide
  - [ ] API documentation
  - [ ] Security best practices
- [ ] Add API documentation
  - [ ] REST API endpoints
  - [ ] WebSocket events
  - [ ] Query engine methods
  - [ ] Client package usage

## Authentication and Access Control

### Core Requirements

#### Authentication System
- [x] Implement OAuth2.0 authentication flow
- [x] Support email/password authentication
- [x] Implement secure password hashing and storage
- [x] Add password reset functionality
- [x] Implement session management
- [x] Add remember me functionality
- [x] Implement secure token storage

#### Route Protection
- [ ] Create authentication middleware
  - [ ] Verify JWT tokens
  - [ ] Check token expiration
  - [ ] Validate user permissions
  - [ ] Handle token refresh
- [ ] Implement route guards for all protected routes
  - [ ] Protect API routes
  - [ ] Protect frontend routes
  - [ ] Handle expired sessions
- [ ] Add role-based access control (RBAC)
  - [ ] Define user roles (admin, user, readonly)
  - [ ] Implement permission checks
  - [ ] Add role assignment functionality

#### User Flow
- [ ] Authentication Gate
  - [ ] Redirect unauthenticated users to login page
  - [ ] Preserve intended destination for post-login redirect
  - [ ] Handle deep linking for authenticated routes
  - [ ] Clear sensitive data on logout
- [ ] First-time User Experience
  - [ ] Force new users to create first database connection
  - [ ] Block access to other routes until connection is created
  - [ ] Provide guided setup wizard
  - [ ] Add connection validation step
- [ ] Session Management
  - [ ] Implement session timeout
  - [ ] Add concurrent session handling
  - [ ] Provide session revocation
  - [ ] Add session activity logging

### Implementation Details

#### Authentication Middleware
```typescript
interface AuthMiddlewareConfig {
  excludedRoutes?: string[];
  tokenValidation?: {
    issuer: string;
    audience: string;
    algorithms: string[];
  };
  sessionConfig?: {
    timeout: number;
    maxConcurrent: number;
  };
}
```

#### Protected Route Guard
```typescript
interface RouteGuardConfig {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  customChecks?: ((user: User) => boolean)[];
}
```

#### Connection Check Middleware
```typescript
interface ConnectionCheckConfig {
  redirectRoute: string;
  excludedRoutes: string[];
  connectionValidator: (user: User) => Promise<boolean>;
}
```

### Security Considerations

1. Token Security
   - Use secure HttpOnly cookies for token storage
   - Implement CSRF protection
   - Add rate limiting for authentication endpoints
   - Enable secure headers (HSTS, CSP, etc.)

2. Password Security
   - Enforce strong password requirements
   - Implement account lockout after failed attempts
   - Add two-factor authentication support
   - Regular password rotation policies

3. Session Security
   - Secure session storage
   - Session fixation protection
   - Automatic session termination on security events
   - IP-based session validation

### Error Handling

1. Authentication Errors
   - Invalid credentials
   - Expired tokens
   - Invalid tokens
   - Missing permissions

2. First Connection Errors
   - Connection validation failures
   - Database unreachable
   - Invalid credentials
   - Timeout errors

3. User Feedback
   - Clear error messages
   - Guided resolution steps
   - Security event notifications
   - Session status indicators

### Monitoring and Logging

1. Security Events
   - Failed login attempts
   - Password resets
   - Permission changes
   - Session terminations

2. Audit Trail
   - User actions
   - Route access
   - Permission checks
   - Configuration changes

3. Metrics
   - Authentication success rate
   - Token usage statistics
   - Session duration
   - Route access patterns

### Testing Requirements

1. Unit Tests
   - Authentication logic
   - Token validation
   - Permission checks
   - Route guards

2. Integration Tests
   - Authentication flow
   - Session management
   - First connection flow
   - Error handling

3. Security Tests
   - Penetration testing
   - Token security
   - Session security
   - CSRF protection

## Recent Updates
1. Authentication System Improvements
   - Fixed type safety in user session management
   - Implemented proper role-based access control with enum types
   - Enhanced organization membership handling
   - Added secure session management with remember-me functionality
   - Improved error handling in login and signup flows
   - Added organization context preservation across sessions

2. Type System Enhancements
   - Updated User type to use proper Role enum
   - Fixed type definitions in authentication flow
   - Added proper type assertions and validations
   - Improved error type definitions
   - Enhanced form data handling with proper types

3. Security Improvements
   - Implemented proper password hashing
   - Added secure session cookie configuration
   - Enhanced RBAC with proper role validation
   - Added organization access checks
   - Improved error messages without leaking sensitive information

### Next Steps
1. Complete the connection management UI
2. Implement user profile functionality
3. Add remaining organization settings features
4. Enhance real-time capabilities
5. Implement comprehensive security testing

## Future Chart Types

The following chart types from Recharts could be added to enhance data visualization capabilities:

### Time Series
- **Composed Chart**: Combine multiple chart types (e.g., line + bar) for comparing different metrics
- **Brush Chart**: Add time range selection for zooming into specific periods
- **Step Line Chart**: For discrete changes over time (e.g., status changes)
- **Reference Lines/Areas**: Add statistical markers like mean, median, or thresholds

### Categorical
- **Radial Bar Chart**: Circular progress bars for comparing categories
- **Treemap**: Hierarchical data visualization
- **Funnel Chart**: For conversion or process flow analysis
- **Stacked Area**: For showing cumulative values over time

### Distribution
- **Histogram**: For showing data distribution (can be implemented using bar charts)
- **Violin Plot**: For showing probability density (requires custom implementation)
- **Error Bars**: For showing uncertainty in measurements

### Specialized
- **Radar/Spider Chart**: For multivariate data comparison
- **Sankey Diagram**: For flow visualization
- **Gauge Chart**: For showing single values in a range
- **Candlestick**: For financial data (OHLC)

### Interactive Features
- **Synchronized Charts**: Multiple charts that zoom/pan together
- **Click-through Details**: Drill down into data points
- **Custom Tooltips**: Enhanced data point information
- **Dynamic Reference Lines**: User-defined thresholds

### Accessibility Improvements
- **Color Blind Friendly**: Alternative color schemes
- **Pattern Fills**: For better distinction without color
- **Screen Reader Support**: ARIA labels and descriptions

### Data Processing
- **Moving Averages**: Smoothing for time series
- **Aggregation Options**: Sum, average, median, etc.
- **Outlier Detection**: Automatic highlighting of anomalies
- **Trend Lines**: Linear/polynomial regression

Implementation Priority:
1. Composed Chart (most versatile)
2. Radar Chart (unique visualization)
3. Brush Chart (time series analysis)
4. Radial Bar Chart (compact categorical)
5. Treemap (hierarchical data)

## Development Guidelines

### Code Organization
- Feature-based directory structure
- Shared utilities and types
- Clear separation of concerns
- Type-safe interfaces

### Testing Strategy
- Unit tests for core functionality
- Integration tests for database operations
- End-to-end tests for user flows
- Test environment separation
- Module resolution optimization

### Security Considerations
- SQL injection prevention
- Authentication and authorization
- Rate limiting
- Input validation
- Secure WebSocket communication
- Error handling and logging

### Performance Optimization
- Query result streaming
- Connection pooling
- Caching strategies
- Real-time updates
- Resource monitoring