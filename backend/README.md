# WhatsApp Business Automation Platform - Backend

Complete Express.js backend with RESTful API architecture for WhatsApp Business Automation Platform.

## 🏗️ Architecture

This backend follows a traditional MVC (Model-View-Controller) pattern with clear separation of concerns:

```
backend/
├── server.js                 # Entry point
├── config/                   # Configuration files
│   ├── database.js          # Supabase client
│   └── razorpay.js          # Razorpay client
├── middleware/              # Express middleware
│   ├── auth.js              # Authentication & tenant middleware
│   ├── errorHandler.js      # Global error handler
│   ├── notFound.js          # 404 handler
│   └── validate.js          # Request validation
├── models/                  # Data models
│   ├── Contact.js
│   ├── Conversation.js
│   ├── Message.js
│   ├── Campaign.js
│   ├── Workflow.js
│   └── Payment.js
├── controllers/             # Business logic
│   ├── auth.controller.js
│   ├── contact.controller.js
│   ├── conversation.controller.js
│   ├── message.controller.js
│   ├── campaign.controller.js
│   ├── workflow.controller.js
│   ├── payment.controller.js
│   ├── webhook.controller.js
│   └── analytics.controller.js
├── routes/                  # API routes
│   ├── auth.routes.js
│   ├── contact.routes.js
│   ├── conversation.routes.js
│   ├── message.routes.js
│   ├── campaign.routes.js
│   ├── workflow.routes.js
│   ├── payment.routes.js
│   ├── webhook.routes.js
│   └── analytics.routes.js
├── schemas/                 # Validation schemas
│   ├── contact.schema.js
│   ├── message.schema.js
│   ├── campaign.schema.js
│   ├── workflow.schema.js
│   └── payment.schema.js
└── utils/                   # Utility functions
    ├── responses.js         # API response helpers
    ├── logger.js            # Winston logger
    └── pagination.js        # Pagination helpers
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- Razorpay account (for payments)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Production

```bash
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Contacts
- `GET /api/contacts` - Get all contacts (with pagination & filters)
- `GET /api/contacts/:id` - Get single contact
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Conversations
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id` - Get conversation with messages
- `POST /api/conversations` - Create conversation
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `GET /api/messages` - Get messages (with filters)
- `GET /api/messages/:id` - Get single message
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Update message status
- `DELETE /api/messages/:id` - Delete message

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `GET /api/campaigns/:id/stats` - Get campaign statistics
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Workflows
- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get single workflow
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Payments (Razorpay)
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify-payment` - Verify payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/refund` - Process refund

### Webhooks
- `POST /api/webhooks/whatsapp` - WhatsApp webhook
- `POST /api/webhooks/razorpay` - Razorpay webhook

### Analytics
- `GET /api/analytics/dashboard` - Dashboard summary
- `GET /api/analytics/message-stats` - Message statistics
- `GET /api/analytics/campaign-performance` - Campaign performance
- `GET /api/analytics/workflow-performance` - Workflow performance
- `GET /api/analytics/contact-growth` - Contact growth

## 🔐 Authentication

All protected endpoints require Bearer token authentication:

```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Get the access token from the login endpoint response.

## 🎯 Features

### Middleware
- **Authentication**: JWT-based authentication with Supabase
- **Tenant Isolation**: Automatic tenant identification and data isolation
- **Validation**: Request validation using Joi schemas
- **Error Handling**: Centralized error handling with proper status codes
- **Security**: Helmet for security headers, CORS configuration
- **Logging**: Request logging with Morgan

### Models
- Abstracted database operations
- Reusable query methods
- Built-in pagination support
- Tenant-scoped queries

### Controllers
- Clean business logic separation
- Consistent error handling
- Async/await pattern
- RESTful responses

### Schemas
- Joi validation schemas
- Type checking
- Custom validation rules
- Error message customization

### Utilities
- API response helpers
- Winston logger configuration
- Pagination helpers
- Custom error classes

## 💳 Payment Integration

Razorpay integration includes:
- Order creation
- Payment verification with signature
- Refund processing
- Payment history
- Webhook handling for payment events

## 🔄 Webhook Handling

### WhatsApp Webhooks
Automatically processes incoming messages:
- Creates contacts if not exists
- Creates/updates conversations
- Stores messages
- Triggers workflows

### Razorpay Webhooks
Processes payment events:
- Payment captured
- Payment failed
- Refund created

## 📊 Analytics

Real-time analytics including:
- Dashboard metrics (contacts, conversations, campaigns, messages)
- Message statistics with daily breakdown
- Campaign performance metrics
- Workflow execution tracking
- Contact growth over time

## 🛡️ Security

- Input validation on all endpoints
- SQL injection prevention (Supabase parameterized queries)
- XSS protection with Helmet
- CORS configuration
- Rate limiting ready
- Environment variable protection

## 🐛 Error Handling

Centralized error handling with:
- Custom error classes
- Proper HTTP status codes
- Detailed error messages in development
- Sanitized errors in production
- Error logging

## 📝 Environment Variables

Required environment variables:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

LOG_LEVEL=info
```

## 🧪 Testing

```bash
npm test
```

## 📦 Dependencies

### Production
- **express**: Web framework
- **@supabase/supabase-js**: Supabase client
- **razorpay**: Payment processing
- **joi**: Request validation
- **helmet**: Security headers
- **cors**: CORS handling
- **morgan**: HTTP logging
- **winston**: Application logging
- **dotenv**: Environment variables

### Development
- **nodemon**: Auto-reload in development
- **eslint**: Code linting
- **jest**: Testing framework
- **supertest**: API testing

## 🚢 Deployment

The backend can be deployed to:
- Heroku
- AWS (EC2, ECS, Lambda)
- Google Cloud Platform
- DigitalOcean
- Any Node.js hosting platform

Make sure to:
1. Set all environment variables
2. Use production database credentials
3. Enable HTTPS
4. Set NODE_ENV=production
5. Configure proper CORS origins

## 📄 License

MIT

## 🤝 Support

For issues and questions, please open an issue in the repository.
