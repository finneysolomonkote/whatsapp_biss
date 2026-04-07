# WhatsApp Business Automation SaaS - Complete Backend Architecture

## Production-Ready Microservices Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
│              (Kong / AWS API Gateway / Envoy)                   │
│          - Rate Limiting                                        │
│          - Authentication                                       │
│          - Load Balancing                                       │
│          - Request Routing                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌─────────▼────────┐  ┌───────▼────────┐
│  Auth Service  │  │  Tenant Service  │  │  User Service  │
│  (Port 3001)   │  │   (Port 3002)    │  │  (Port 3003)   │
└────────────────┘  └──────────────────┘  └────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌─────────▼────────┐  ┌───────▼────────┐
│WhatsApp Service│  │ Message Service  │  │   CRM Service  │
│  (Port 3004)   │  │   (Port 3005)    │  │  (Port 3006)   │
└────────────────┘  └──────────────────┘  └────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌─────────▼────────┐  ┌───────▼────────┐
│Campaign Service│  │Workflow Service  │  │Appointment Svc │
│  (Port 3007)   │  │   (Port 3008)    │  │  (Port 3009)   │
└────────────────┘  └──────────────────┘  └────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌─────────▼────────┐  ┌───────▼────────┐
│Analytics Svc   │  │ Billing Service  │  │Notification Svc│
│  (Port 3010)   │  │   (Port 3011)    │  │  (Port 3012)   │
└────────────────┘  └──────────────────┘  └────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                    Message Queue Layer                     │
│               (RabbitMQ / AWS SQS / Redis)                │
│   - Message Processing Queue                               │
│   - Campaign Execution Queue                               │
│   - Workflow Execution Queue                               │
│   - Notification Queue                                     │
│   - Analytics Events Queue                                 │
└────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                      Data Layer                            │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│   │  PostgreSQL  │  │    Redis     │  │ Elasticsearch│  │
│   │  (Supabase)  │  │   (Cache)    │  │   (Search)   │  │
│   └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Microservices Detailed Specification

### 1. Auth Service (Port 3001)

**Responsibility**: User authentication, authorization, session management

**API Endpoints**:
```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

**Technology Stack**:
- Node.js + Express / Supabase Edge Functions
- JWT for tokens
- Bcrypt for password hashing
- Redis for session storage

**Database Tables**:
- `auth.users` (Supabase Auth)
- `user_profiles`

**Environment Variables**:
```
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
REDIS_URL=redis://localhost:6379
```

---

### 2. Tenant Service (Port 3002)

**Responsibility**: Workspace/tenant management, team members, permissions

**API Endpoints**:
```
POST   /api/v1/tenants
GET    /api/v1/tenants/:id
PUT    /api/v1/tenants/:id
DELETE /api/v1/tenants/:id
POST   /api/v1/tenants/:id/members
GET    /api/v1/tenants/:id/members
PUT    /api/v1/tenants/:id/members/:userId
DELETE /api/v1/tenants/:id/members/:userId
GET    /api/v1/tenants/:id/subscription
```

**Database Tables**:
- `tenants`
- `tenant_members`
- `subscriptions`

---

### 3. WhatsApp Service (Port 3004)

**Responsibility**: WhatsApp Cloud API integration, webhook handling

**API Endpoints**:
```
POST   /api/v1/whatsapp/webhook (Meta webhook)
GET    /api/v1/whatsapp/webhook (Meta verification)
POST   /api/v1/whatsapp/send-message
POST   /api/v1/whatsapp/send-template
GET    /api/v1/whatsapp/templates
POST   /api/v1/whatsapp/connect
GET    /api/v1/whatsapp/status/:tenantId
```

**Key Functions**:
- Verify WhatsApp webhook signatures
- Process inbound messages
- Send outbound messages via Meta API
- Handle message status callbacks
- Template management

**External APIs**:
- Meta WhatsApp Cloud API: `https://graph.facebook.com/v17.0/`

**Database Tables**:
- `whatsapp_integrations`
- `messages`

---

### 4. Message Service (Port 3005)

**Responsibility**: Message processing, conversation management

**API Endpoints**:
```
GET    /api/v1/messages/:conversationId
POST   /api/v1/messages/:conversationId
GET    /api/v1/conversations
GET    /api/v1/conversations/:id
PUT    /api/v1/conversations/:id
POST   /api/v1/conversations/:id/assign
```

**Key Functions**:
- Process incoming messages
- Store messages in database
- Update conversation metadata
- Real-time message delivery via WebSocket
- Message search and filtering

**Database Tables**:
- `conversations`
- `messages`

---

### 5. CRM Service (Port 3006)

**Responsibility**: Contact management, lead tracking, segmentation

**API Endpoints**:
```
GET    /api/v1/contacts
POST   /api/v1/contacts
GET    /api/v1/contacts/:id
PUT    /api/v1/contacts/:id
DELETE /api/v1/contacts/:id
POST   /api/v1/contacts/import
GET    /api/v1/contacts/:id/timeline
POST   /api/v1/contacts/:id/tags
DELETE /api/v1/contacts/:id/tags/:tag
GET    /api/v1/segments
POST   /api/v1/segments
GET    /api/v1/segments/:id/contacts
```

**Database Tables**:
- `contacts`
- `contact_tags`
- `contact_custom_fields`
- `contact_field_values`
- `contact_timeline`
- `segments`
- `segment_members`

---

### 6. Campaign Service (Port 3007)

**Responsibility**: Broadcast campaign creation and execution

**API Endpoints**:
```
GET    /api/v1/campaigns
POST   /api/v1/campaigns
GET    /api/v1/campaigns/:id
PUT    /api/v1/campaigns/:id
DELETE /api/v1/campaigns/:id
POST   /api/v1/campaigns/:id/schedule
POST   /api/v1/campaigns/:id/pause
POST   /api/v1/campaigns/:id/resume
GET    /api/v1/campaigns/:id/analytics
```

**Key Functions**:
- Create and schedule campaigns
- Validate message quotas
- Queue campaign messages
- Track delivery and engagement
- Generate campaign analytics

**Worker Processes**:
- Campaign Scheduler (Cron job every minute)
- Campaign Executor (Process queue)
- Message Sender (Throttled sending)

**Database Tables**:
- `campaigns`
- `campaign_messages`
- `message_templates`

---

### 7. Workflow Service (Port 3008)

**Responsibility**: Automation workflows, trigger processing

**API Endpoints**:
```
GET    /api/v1/workflows
POST   /api/v1/workflows
GET    /api/v1/workflows/:id
PUT    /api/v1/workflows/:id
DELETE /api/v1/workflows/:id
POST   /api/v1/workflows/:id/activate
POST   /api/v1/workflows/:id/pause
GET    /api/v1/workflows/:id/executions
```

**Key Functions**:
- Workflow builder/editor
- Trigger detection (keywords, events)
- Workflow execution engine
- Conditional logic processing
- Node execution (send message, wait, API call)

**Workflow Node Types**:
- Send Message
- Wait/Delay
- Conditional Branch
- Update Contact
- Call Webhook
- Create Appointment
- Assign to Agent

**Database Tables**:
- `workflows`
- `workflow_executions`

---

### 8. Appointment Service (Port 3009)

**Responsibility**: Appointment booking and scheduling

**API Endpoints**:
```
GET    /api/v1/appointments
POST   /api/v1/appointments
GET    /api/v1/appointments/:id
PUT    /api/v1/appointments/:id
DELETE /api/v1/appointments/:id
GET    /api/v1/appointments/slots
POST   /api/v1/appointments/slots
GET    /api/v1/services
POST   /api/v1/services
```

**Key Functions**:
- Slot availability management
- Double-booking prevention
- Reminder scheduling
- Calendar integration
- No-show tracking

**Database Tables**:
- `appointments`
- `appointment_slots`
- `services`

---

### 9. Analytics Service (Port 3010)

**Responsibility**: Analytics, reporting, insights

**API Endpoints**:
```
GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/conversations
GET    /api/v1/analytics/campaigns
GET    /api/v1/analytics/workflows
GET    /api/v1/analytics/contacts
POST   /api/v1/analytics/events
GET    /api/v1/analytics/export
```

**Key Functions**:
- Real-time metrics aggregation
- Event tracking
- Report generation
- Data export (CSV, PDF)
- Custom date ranges

**Database Tables**:
- `analytics_events`
- Pre-aggregated views for performance

---

### 10. Billing Service (Port 3011)

**Responsibility**: Subscription management, usage tracking, invoicing

**API Endpoints**:
```
GET    /api/v1/billing/subscription
POST   /api/v1/billing/subscribe
POST   /api/v1/billing/upgrade
POST   /api/v1/billing/cancel
GET    /api/v1/billing/usage
GET    /api/v1/billing/invoices
POST   /api/v1/billing/payment-method
```

**Key Functions**:
- Plan management
- Usage metering
- Invoice generation
- Payment processing
- Quota enforcement

**External APIs**:
- Razorpay / Stripe

**Database Tables**:
- `subscriptions`
- `usage_logs`
- `invoices`

---

### 11. Notification Service (Port 3012)

**Responsibility**: Push notifications, email, SMS

**API Endpoints**:
```
POST   /api/v1/notifications/send
POST   /api/v1/notifications/email
POST   /api/v1/notifications/push
GET    /api/v1/notifications
PUT    /api/v1/notifications/:id/read
```

**Key Functions**:
- Multi-channel notifications
- Template rendering
- Delivery tracking
- Retry logic

**External APIs**:
- SendGrid (Email)
- Firebase Cloud Messaging (Push)
- Twilio (SMS)

---

## Message Queue Architecture

### Queue Types

1. **Message Processing Queue**
   - Inbound WhatsApp messages
   - Worker: Message processor
   - Throughput: 10,000/sec

2. **Campaign Execution Queue**
   - Campaign message sending
   - Worker: Campaign executor
   - Throttled: 80 msg/sec per tenant

3. **Workflow Execution Queue**
   - Automation triggers
   - Worker: Workflow engine
   - Priority: High

4. **Notification Queue**
   - Push/Email/SMS delivery
   - Worker: Notification sender
   - Retry: 3 attempts

5. **Analytics Events Queue**
   - Event tracking
   - Worker: Analytics aggregator
   - Batch processing

---

## Database Design

### Primary Database: PostgreSQL (Supabase)

**Connection Pooling**:
- Min: 10 connections
- Max: 100 connections
- Idle timeout: 10 minutes

**Replication**:
- Primary-replica setup
- Read replicas for analytics queries
- Automatic failover

**Partitioning**:
- `messages` table: Partitioned by month
- `analytics_events` table: Partitioned by week
- Automatic partition management

**Indexes**:
```sql
-- High-performance indexes
CREATE INDEX idx_messages_tenant_conversation ON messages(tenant_id, conversation_id, created_at DESC);
CREATE INDEX idx_contacts_tenant_phone ON contacts(tenant_id, phone);
CREATE INDEX idx_campaigns_tenant_status ON campaigns(tenant_id, status, scheduled_at);
CREATE INDEX idx_workflows_tenant_active ON workflows(tenant_id) WHERE status = 'active';
```

---

## Caching Strategy

### Redis Cache Layers

1. **Session Cache**
   - TTL: 15 minutes
   - Key: `session:{user_id}`

2. **API Response Cache**
   - TTL: 5 minutes
   - Key: `api:{tenant_id}:{endpoint}:{params}`

3. **Rate Limiting**
   - Sliding window
   - Key: `ratelimit:{tenant_id}:{minute}`

4. **Dashboard Metrics**
   - TTL: 5 minutes
   - Key: `dashboard:{tenant_id}`

---

## Deployment Architecture

### Container Orchestration: Kubernetes

**Deployment Structure**:
```yaml
# Each microservice deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: platform/auth-service:latest
        ports:
        - containerPort: 3001
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: url
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Auto-scaling**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Observability

### Logging Stack
- **Log Aggregation**: ELK Stack / DataDog
- **Format**: JSON structured logs
- **Retention**: 30 days hot, 90 days archive

### Metrics
- **Collection**: Prometheus
- **Visualization**: Grafana
- **Alerting**: AlertManager / PagerDuty

**Key Metrics**:
```
# Service metrics
http_requests_total
http_request_duration_seconds
http_errors_total

# Business metrics
messages_processed_total
campaigns_executed_total
workflows_triggered_total
api_calls_per_tenant

# Infrastructure metrics
cpu_usage
memory_usage
disk_io
network_throughput
```

### Distributed Tracing
- **Tool**: Jaeger / AWS X-Ray
- **Trace context propagation**: OpenTelemetry
- **Sample rate**: 10% in production

---

## Security

### Authentication
- JWT with RS256 signature
- Token rotation every 15 minutes
- Refresh token with 7-day expiry

### Authorization
- Role-Based Access Control (RBAC)
- Tenant isolation at query level
- API key management

### Encryption
- TLS 1.3 for all communications
- Encryption at rest (AES-256)
- Secrets management: AWS Secrets Manager / HashiCorp Vault

### Rate Limiting
```
Authenticated:   1000 req/min per user
Anonymous:       10 req/min per IP
Webhook:         100 req/sec per tenant
Message Send:    80 msg/sec per tenant
```

---

## Disaster Recovery

### Backup Strategy
- Database: Continuous backup (PITR)
- Retention: 30 days
- Cross-region replication

### Failover
- Auto-failover to replica: <30 seconds
- Multi-region deployment (optional)
- DNS failover: Route53 health checks

### Recovery Time Objectives
- RTO: 15 minutes
- RPO: 5 minutes

---

## Cost Optimization

### Resource Allocation
```
Service           | Replicas | CPU  | Memory | Cost/Month
------------------|----------|------|--------|------------
Auth              | 3        | 500m | 512MB  | $45
Tenant            | 2        | 500m | 512MB  | $30
WhatsApp          | 5        | 1000m| 1GB    | $150
Message           | 10       | 1000m| 1GB    | $300
CRM               | 3        | 500m | 512MB  | $45
Campaign          | 5        | 1000m| 1GB    | $150
Workflow          | 5        | 1000m| 1GB    | $150
Appointment       | 2        | 500m | 512MB  | $30
Analytics         | 3        | 1000m| 2GB    | $120
Billing           | 2        | 500m | 512MB  | $30
Notification      | 3        | 500m | 512MB  | $45
------------------|----------|------|--------|------------
Total             | 43       | 8GB  | 10GB   | $1,095/mo
```

**Database**: $200/month (Supabase Pro)
**Redis**: $50/month
**S3/Storage**: $20/month
**Total Infrastructure**: ~$1,365/month

**Optimization Strategies**:
- Use spot instances for workers (60% cost reduction)
- Scale down during off-peak hours
- Use reserved instances for stable workloads
- Implement request caching aggressively

---

## Getting Started - Local Development

### Prerequisites
```bash
Node.js 18+
Docker & Docker Compose
PostgreSQL 14+
Redis 7+
```

### Setup
```bash
# Clone repository
git clone <repo-url>
cd whatsapp-business-platform

# Install dependencies
npm install

# Start infrastructure
docker-compose up -d

# Run migrations
npm run migrate

# Start all services (development)
npm run dev:all

# Or start individual services
npm run dev:auth
npm run dev:whatsapp
npm run dev:message
# etc...
```

### Environment Configuration
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/platform
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m

# WhatsApp
META_VERIFY_TOKEN=your-verify-token
META_ACCESS_TOKEN=your-access-token

# Queues
RABBITMQ_URL=amqp://localhost:5672

# External Services
SENDGRID_API_KEY=your-sendgrid-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret
```

---

## API Documentation

Full API documentation available at:
- Swagger UI: `http://localhost:3000/api-docs`
- Postman Collection: `docs/postman_collection.json`
- OpenAPI Spec: `docs/openapi.yaml`

---

## Conclusion

This architecture is designed for:
- **Scale**: Handle millions of messages/day
- **Reliability**: 99.9% uptime SLA
- **Performance**: <100ms API response time
- **Security**: Enterprise-grade security
- **Maintainability**: Clear service boundaries
- **Cost-Efficiency**: Optimized resource usage

**Next Steps**:
1. Deploy to staging environment
2. Load testing with 10K concurrent users
3. Security audit and penetration testing
4. Performance optimization
5. Production deployment with monitoring
