# Backend Architecture & Design Decisions

## Technology Choices

### Cloudflare Workers (Edge Computing)
**Why**: 
- ✅ Serverless, auto-scaling globally
- ✅ No cold starts (always warm)
- ✅ Excellent for real-time notifications
- ✅ Easy deployment (`wrangler deploy`)
- ✅ Integrated D1 database
- ✅ Free tier covers development

**Trade-offs**:
- Limited execution time (50ms CPU default)
- No persistent file storage (use D1)
- Database connections must be short-lived

### D1 SQLite Database
**Why**:
- ✅ Native Cloudflare integration
- ✅ Familiar SQL syntax
- ✅ Easier than traditional database migration
- ✅ ACID transactions for reliability
- ✅ Point-in-time recovery
- ✅ Schemaless flexibility when needed

**Trade-offs**:
- SQLite limitations on concurrent writes
- Not ideal for massive scale (but fine for fitness app)
- Replicas eventually consistent

### itty-router
**Why**:
- ✅ Lightweight (perfect for Workers)
- ✅ TypeScript support
- ✅ Router middleware pattern
- ✅ Small bundle size
- ✅ Request/response patterns similar to Express

**Alternative considered**: Hono (more batteries included, but heavier)

### TypeScript Strict Mode
**Why**:
- ✅ Catch errors at compile time
- ✅ Self-documenting code
- ✅ Easier refactoring
- ✅ Better IDE support
- ✅ Matches frontend patterns (Vue 3 setup)

## Architecture Patterns

### Layered Architecture

```
Request → Middleware → Routes → Models → Database
  ↓         ↓           ↓        ↓         ↓
Router  CORS/Auth   Handlers   Queries    D1
        Error      Business    SQL
```

### Request Flow Example

```javascript
// 1. Request arrives
POST /api/auth/register
Headers: { Content-Type: application/json }
Body: { firebaseUid, email, name, role, avatar }

// 2. CORS middleware checks origin
middleware/cors.ts → allows localhost

// 3. Routes handler processes
routes/auth.ts → authRoutes.post('/register')

// 4. Validates input and calls model
models/index.ts → UserModel.create()

// 5. Model executes database query
D1.prepare().bind().first()

// 6. Return formatted response
Response: { id, firebase_uid, email, ... }
Status: 201 Created
```

### Model Layer Pattern

Each entity has a corresponding Model class:
```typescript
class UserModel {
  constructor(private db: D1Database) {}
  
  async getByFirebaseUid(uid: string): Promise<User> { ... }
  async create(user: User): Promise<User> { ... }
  async update(id: number, updates: Partial<User>): Promise<User> { ... }
  async delete(id: number): Promise<void> { ... }
}
```

Benefits:
- ✅ Separation of concerns
- ✅ Reusable database logic
- ✅ Easy to test
- ✅ Consistent error handling
- ✅ Type safety

## Database Design

### Schema Decisions

**Why UUID for firebase_uid instead of auto-increment ID?**
- Firebase UID is natural identifier for users
- Enables future multi-database federation
- Firebase UID is immutable and unique globally

**Two-ID pattern** (id + firebase_uid):
```
id                  → Database primary key (for foreign keys)
firebase_uid UNIQUE → External identifier (for lookups)
```

This allows:
- Efficient integer foreign keys in workouts/goals/nutrition
- Fast lookup by firebase_uid
- Maintains data referential integrity

**Timestamps on all tables**:
```
created_at → Immutable creation time
updated_at → Changes on any update
```

Enable:
- Activity feeds
- Last-modified sorting
- Debugging audit trails
- Client-side cache invalidation

### Constraints & Validation

**Check constraints** (at database level):
```sql
role CHECK(role IN ('TRAINER', 'CLIENT', 'ADMIN'))
intensity CHECK(intensity IN ('LOW', 'MEDIUM', 'HIGH'))
status CHECK(status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED'))
metric CHECK(metric IN ('kg', 'reps', 'cm', 'mins', '%'))
```

Benefits:
- ✅ Invalid data can't be stored
- ✅ Catches bugs early
- ✅ Self-documenting allowed values
- ✅ Single source of truth

**Foreign keys with CASCADE**:
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

When user deleted → all their workouts/goals/nutrition auto-deleted

**Unique constraints**:
```sql
firebase_uid UNIQUE     → One database record per Firebase user
email UNIQUE            → Email-based lookups fast
fcm_token UNIQUE        → No duplicate notification subscriptions
```

### Indexes for Performance

```sql
CREATE INDEX idx_users_firebase_uid          → Fast user lookups
CREATE INDEX idx_workouts_user_id            → Fast workout queries
CREATE INDEX idx_workouts_trainer_id         → Fast trainer lookups
CREATE INDEX idx_goals_user_id               → Fast goal queries
CREATE INDEX idx_nutrition_logs_user_id      → Fast nutrition queries
```

## API Design

### RESTful Principles

```
GET    /api/resource        → List or fetch collection
POST   /api/resource        → Create new resource
GET    /api/resource/:id    → Fetch single resource
PUT    /api/resource/:id    → Replace entire resource
PATCH  /api/resource/:id    → Partial update
DELETE /api/resource/:id    → Delete resource
```

### HTTP Status Codes

```
200 OK              → Success, return data
201 Created         → Success, new resource created
204 No Content      → Success, no response body (DELETE)
400 Bad Request     → Client error (validation)
401 Unauthorized    → Missing/invalid auth
403 Forbidden       → Auth valid but not allowed
404 Not Found       → Resource doesn't exist
409 Conflict        → Resource already exists (email, etc.)
500 Internal Error  → Server error
```

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",           // Machine readable
    "message": "Human message",     // User-friendly
    "status": 400                   // HTTP status
  }
}
```

### Request/Response Bodies

**Consistent JSON structure**:
```javascript
// Create request
{
  "name": "John Doe",
  "email": "john@example.com"
}

// Success response
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}

// Error response
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Email is required"
  }
}
```

## Security Architecture

### Authentication Flow

```
1. User signs up via LoginPage.vue
   ↓
2. Firebase creates account & generates UID
   ↓
3. Frontend calls POST /api/auth/register
   ├─ firebaseUid from Firebase
   ├─ email from form
   ├─ name from form
   ├─ role defaults to CLIENT
   └─ avatar optional
   ↓
4. Backend creates user in D1
   ├─ Validates input
   ├─ Checks firebase_uid not duplicate
   ├─ Stores in database
   └─ Returns user object
   ↓
5. Frontend receives response
   ├─ User logged in
   ├─ Can query protected endpoints
   └─ Frontend stores user context
```

### Authorization Levels

**Three-tier system** (in models):

```
ADMIN   → Full system access (manage all users, roles)
TRAINER → Can create workouts for clients, view client progress
CLIENT  → Own data only (workouts, goals, nutrition)
```

*Middleware for enforcement coming in Phase 3*

### Data Protection

```typescript
// Parameterized queries prevent SQL injection
const result = db.prepare(
  'SELECT * FROM users WHERE firebase_uid = ?'
).bind(firebaseUid)  // ← Parameter binding
```

## Performance Considerations

### Query Optimization

**Indexed lookups** (fast):
```sql
SELECT * FROM users WHERE firebase_uid = ?         -- Indexed
SELECT * FROM workouts WHERE user_id = ?           -- Indexed
```

**Sequential scans** (slower, avoid):
```sql
SELECT * FROM users WHERE name = 'John'            -- Not indexed
```

### Pagination (Future)

When lists get large, implement:
```javascript
GET /api/workouts?limit=20&offset=0
→ SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 20 OFFSET 0
```

### Caching (Future)

Can add HTTP cache headers:
```
Cache-Control: max-age=300    // Cache 5 minutes
ETag: "abc123"                // For conditional requests
```

## Deployment Architecture

### Development
```
Frontend: localhost:3001
Backend:  localhost:8787
Database: Local D1 (wrangler dev)
```

### Production
```
Frontend: app.finlay.app (Cloudflare Pages)
Backend:  api.finlay.app (Cloudflare Workers)
Database: D1 (Cloudflare managed)
          ↓ (backup to)
          S3 (optional storage)
```

### CI/CD (Future)

```
Commit → GitHub Actions
       → TypeScript check
       → Database migration validation
       → Deploy to production
```

## Monitoring & Debugging

### Worker Logs

```bash
wrangler tail              # Stream real-time logs
wrangler tail --format json  # JSON format
```

### Database Queries

```bash
wrangler d1 execute finlay-db --interactive
# In shell:
SELECT * FROM users;
SELECT COUNT(*) FROM workouts;
PRAGMA table_info(users);    -- Show schema
```

### Error Tracking (Future)

Could integrate:
- Sentry for error reporting
- CloudWatch for metrics
- Datadog for observability

## Future Enhancements

1. **Middleware Pipeline**
   - Firebase token verification
   - Rate limiting
   - Request logging
   - Response compression

2. **Advanced Queries**
   - Search with full-text indexing
   - Aggregations (workouts per week, calories per day)
   - Trending goals/achievements

3. **Real-time Features**
   - WebSocket for notifications
   - LiveQuery for goal progress updates

4. **Integration**
   - Stripe for premium features
   - SendGrid for emails
   - Twilio for SMS

5. **Analytics**
   - Workout consistency metrics
   - Progress dashboards
   - Trainer effectiveness scores

## References

- [Cloudflare Workers Best Practices](https://developers.cloudflare.com/workers/platform/settings/limits/)
- [D1 Database Concepts](https://developers.cloudflare.com/d1/platform/limits/)
- [REST API Guidelines](https://restfulapi.net/)
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
