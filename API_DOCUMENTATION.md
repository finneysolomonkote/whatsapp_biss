# WhatsApp Business Automation Platform - Complete API Documentation

## Overview

This document provides comprehensive documentation for all microservices in the WhatsApp Business Automation Platform. The platform follows a microservices architecture with 8 independent services, each handling specific business domains.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication](#authentication)
3. [Contacts Service](#contacts-service)
4. [Conversations Service](#conversations-service)
5. [Messages Service](#messages-service)
6. [Campaigns Service](#campaigns-service)
7. [Workflows Service](#workflows-service)
8. [Payments Service (Razorpay)](#payments-service-razorpay)
9. [Webhooks Service](#webhooks-service)
10. [Analytics Service](#analytics-service)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)

---

## Architecture Overview

### Microservices Architecture

The platform is built using a microservices architecture with the following services:

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │Contacts │          │Messages │          │Campaigns│
   │ Service │          │ Service │          │ Service │
   └─────────┘          └─────────┘          └─────────┘
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │Workflows│          │Payments │          │Webhooks │
   │ Service │          │ Service │          │ Service │
   └─────────┘          └─────────┘          └─────────┘
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐
   │Analytics│          │Conversa-│
   │ Service │          │tions    │
   └─────────┘          └─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │Supabase │          │Razorpay │          │WhatsApp │
   │Database │          │  API    │          │   API   │
   └─────────┘          └─────────┘          └─────────┘
```

### Base URL

All API endpoints are accessed through Supabase Edge Functions:

```
https://YOUR_SUPABASE_URL/functions/v1/
```

Replace `YOUR_SUPABASE_URL` with your actual Supabase project URL.

---

## Authentication

All API requests require authentication using Bearer tokens.

### Request Headers

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Getting an Access Token

Users authenticate through Supabase Auth. After successful login, use the access token for all API requests.

```javascript
// Example: Login with Supabase
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

const accessToken = data.session.access_token;
```

---

## Contacts Service

Manages customer contact information including personal details, tags, and custom fields.

**Base Endpoint:** `/contacts-service`

### 1. Get All Contacts

Retrieve a paginated list of contacts with optional filtering.

**Endpoint:** `GET /contacts-service`

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Records per page (default: 50, max: 100)
- `search` (string, optional): Search by name, phone, or email
- `tags` (string, optional): Comma-separated list of tags to filter by

**Example Request:**
```http
GET /contacts-service?page=1&limit=50&search=john&tags=customer,vip
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+919876543210",
      "email": "john.doe@example.com",
      "tags": ["customer", "vip"],
      "custom_fields": {
        "company": "Acme Corp",
        "industry": "Technology"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "totalPages": 3
  }
}
```

### 2. Get Single Contact

Retrieve details of a specific contact.

**Endpoint:** `GET /contacts-service/{contact_id}`

**Example Request:**
```http
GET /contacts-service/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+919876543210",
    "email": "john.doe@example.com",
    "tags": ["customer", "vip"],
    "custom_fields": {
      "company": "Acme Corp",
      "industry": "Technology"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Create Contact

Create a new contact record.

**Endpoint:** `POST /contacts-service`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+919876543210",
  "email": "john.doe@example.com",
  "tags": ["customer", "vip"],
  "custom_fields": {
    "company": "Acme Corp",
    "industry": "Technology"
  }
}
```

**Required Fields:**
- `first_name` (string)
- `phone` (string)

**Optional Fields:**
- `last_name` (string)
- `email` (string)
- `tags` (array of strings)
- `custom_fields` (object)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "123e4567-e89b-12d3-a456-426614174000",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+919876543210",
    "email": "john.doe@example.com",
    "tags": ["customer", "vip"],
    "custom_fields": {
      "company": "Acme Corp",
      "industry": "Technology"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Update Contact

Update an existing contact.

**Endpoint:** `PUT /contacts-service/{contact_id}`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@example.com",
  "tags": ["customer", "premium"]
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@example.com",
    "tags": ["customer", "premium"],
    "updated_at": "2024-01-16T14:20:00Z"
  }
}
```

### 5. Delete Contact

Delete a contact permanently.

**Endpoint:** `DELETE /contacts-service/{contact_id}`

**Example Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

## Conversations Service

Manages customer conversations and their metadata.

**Base Endpoint:** `/conversations-service`

### 1. Get All Conversations

Retrieve a paginated list of conversations.

**Endpoint:** `GET /conversations-service`

**Query Parameters:**
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page
- `status` (string, optional): Filter by status (open, closed, archived)
- `search` (string, optional): Search by contact name or phone

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv-123",
      "tenant_id": "tenant-456",
      "contact_id": "contact-789",
      "contact": {
        "id": "contact-789",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+919876543210"
      },
      "status": "open",
      "assigned_to": null,
      "last_message_at": "2024-01-15T10:30:00Z",
      "last_message_preview": "Hello, I need help with...",
      "unread_count": 3,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 45,
    "totalPages": 1
  }
}
```

### 2. Get Single Conversation with Messages

Retrieve a conversation with all its messages.

**Endpoint:** `GET /conversations-service/{conversation_id}`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv-123",
    "contact": {
      "id": "contact-789",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+919876543210"
    },
    "status": "open",
    "messages": [
      {
        "id": "msg-001",
        "content": "Hello, I need help",
        "direction": "inbound",
        "status": "delivered",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "id": "msg-002",
        "content": "Hi! How can I help you?",
        "direction": "outbound",
        "status": "read",
        "timestamp": "2024-01-15T10:31:00Z"
      }
    ]
  }
}
```

### 3. Create Conversation

Create a new conversation.

**Endpoint:** `POST /conversations-service`

**Request Body:**
```json
{
  "contact_id": "contact-789",
  "status": "open",
  "assigned_to": "user-123"
}
```

### 4. Update Conversation

Update conversation details.

**Endpoint:** `PUT /conversations-service/{conversation_id}`

**Request Body:**
```json
{
  "status": "closed",
  "assigned_to": "user-456"
}
```

---

## Messages Service

Handles individual messages within conversations.

**Base Endpoint:** `/messages-service`

### 1. Get Messages

Retrieve messages with optional filtering.

**Endpoint:** `GET /messages-service`

**Query Parameters:**
- `conversation_id` (string, optional): Filter by conversation
- `contact_id` (string, optional): Filter by contact
- `page` (integer, optional): Page number
- `limit` (integer, optional): Records per page

**Example Request:**
```http
GET /messages-service?conversation_id=conv-123&page=1&limit=100
```

### 2. Send Message

Send a new message.

**Endpoint:** `POST /messages-service`

**Request Body:**
```json
{
  "conversation_id": "conv-123",
  "contact_id": "contact-789",
  "content": "Hello! How can I help you today?",
  "direction": "outbound",
  "status": "sent"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg-456",
    "conversation_id": "conv-123",
    "contact_id": "contact-789",
    "content": "Hello! How can I help you today?",
    "direction": "outbound",
    "status": "sent",
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```

### 3. Update Message Status

Update message status (e.g., mark as read).

**Endpoint:** `PUT /messages-service/{message_id}`

**Request Body:**
```json
{
  "status": "read"
}
```

---

## Campaigns Service

Manages broadcast campaigns for bulk messaging.

**Base Endpoint:** `/campaigns-service`

### 1. Get All Campaigns

**Endpoint:** `GET /campaigns-service`

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status (draft, scheduled, sending, sent, paused)

### 2. Create Campaign

**Endpoint:** `POST /campaigns-service`

**Request Body:**
```json
{
  "name": "Summer Sale 2024",
  "description": "Promotional campaign for summer sale",
  "message_template": "Hi {{name}}! Check out our summer sale with up to 50% off!",
  "status": "draft",
  "scheduled_at": "2024-06-01T10:00:00Z",
  "target_segment": {
    "tags": ["customer", "active"]
  }
}
```

### 3. Get Campaign Statistics

**Endpoint:** `GET /campaigns-service/{campaign_id}/stats`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "total_recipients": 1000,
    "sent_count": 950,
    "delivered_count": 920,
    "read_count": 450,
    "replied_count": 120,
    "failed_count": 30,
    "delivery_rate": "96.84",
    "read_rate": "48.91"
  }
}
```

---

## Workflows Service

Automates responses based on triggers and keywords.

**Base Endpoint:** `/workflows-service`

### 1. Create Workflow

**Endpoint:** `POST /workflows-service`

**Request Body:**
```json
{
  "name": "Welcome Message Workflow",
  "description": "Send welcome message to new contacts",
  "trigger_type": "message_received",
  "trigger_config": {},
  "actions": [
    {
      "type": "send_message",
      "config": {
        "message": "Welcome! Thanks for reaching out."
      }
    },
    {
      "type": "add_tag",
      "config": {
        "tag": "welcomed"
      }
    }
  ],
  "status": "active"
}
```

**Trigger Types:**
- `message_received`: Trigger on any message
- `keyword`: Trigger when specific keyword is detected
- `tag_added`: Trigger when a tag is added
- `appointment_booked`: Trigger when appointment is booked
- `webhook`: Trigger via external webhook

### 2. Create Keyword-Based Workflow

**Example:**
```json
{
  "name": "Pricing Inquiry Auto-Response",
  "trigger_type": "keyword",
  "trigger_config": {
    "keyword": "pricing"
  },
  "actions": [
    {
      "type": "send_message",
      "config": {
        "message": "Our pricing starts at $99/month. Visit our website for details."
      }
    }
  ],
  "status": "active"
}
```

---

## Payments Service (Razorpay)

Handles payment processing using Razorpay integration.

**Base Endpoint:** `/payments-service`

### 1. Create Payment Order

**Endpoint:** `POST /payments-service/create-order`

**Request Body:**
```json
{
  "amount": 999,
  "currency": "INR",
  "receipt": "receipt_12345",
  "notes": {
    "plan": "premium",
    "duration": "monthly"
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "order_id": "order_ExampleOrderId",
    "amount": 99900,
    "currency": "INR",
    "key_id": "rzp_test_xxxxx"
  }
}
```

### 2. Verify Payment

Verify payment signature after successful payment.

**Endpoint:** `POST /payments-service/verify-payment`

**Request Body:**
```json
{
  "razorpay_order_id": "order_ExampleOrderId",
  "razorpay_payment_id": "pay_ExamplePaymentId",
  "razorpay_signature": "signature_example"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### 3. Get Payment History

**Endpoint:** `GET /payments-service/payment-history`

**Query Parameters:**
- `page`, `limit`: Pagination

### 4. Process Refund

**Endpoint:** `POST /payments-service/refund`

**Request Body:**
```json
{
  "payment_id": "pay_ExamplePaymentId",
  "amount": 999
}
```

---

## Webhooks Service

Handles incoming webhooks from external services.

**Base Endpoint:** `/webhooks-service`

### 1. WhatsApp Webhook

Receives incoming WhatsApp messages.

**Endpoint:** `POST /webhooks-service/whatsapp`

### 2. Razorpay Webhook

Receives payment status updates.

**Endpoint:** `POST /webhooks-service/razorpay`

**Headers Required:**
```
X-Razorpay-Signature: signature_value
```

### 3. Register Custom Webhook

**Endpoint:** `POST /webhooks-service/register`

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook/receive",
  "events": ["message.sent", "conversation.created", "campaign.completed"],
  "provider": "custom"
}
```

---

## Analytics Service

Provides analytics and reporting data.

**Base Endpoint:** `/analytics-service`

### 1. Get Dashboard Summary

**Endpoint:** `GET /analytics-service/dashboard`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "total_contacts": 1250,
    "active_conversations": 45,
    "active_campaigns": 3,
    "messages_last_30_days": 8540,
    "workflow_executions": 1200
  }
}
```

### 2. Get Message Statistics

**Endpoint:** `GET /analytics-service/message-stats`

**Query Parameters:**
- `start_date` (ISO 8601 datetime)
- `end_date` (ISO 8601 datetime)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 1500,
      "inbound": 800,
      "outbound": 700,
      "delivered": 680,
      "read": 450,
      "failed": 20
    },
    "daily": [
      {
        "date": "2024-01-15",
        "inbound": 50,
        "outbound": 45
      }
    ]
  }
}
```

### 3. Get Campaign Performance

**Endpoint:** `GET /analytics-service/campaign-performance`

### 4. Get Workflow Performance

**Endpoint:** `GET /analytics-service/workflow-performance`

### 5. Get Contact Growth

**Endpoint:** `GET /analytics-service/contact-growth`

---

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, DELETE request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `405 Method Not Allowed`: HTTP method not supported
- `500 Internal Server Error`: Server-side error

---

## Rate Limiting

API requests are subject to rate limiting:

- **Free Tier**: 100 requests per minute
- **Pro Tier**: 500 requests per minute
- **Enterprise**: Custom limits

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Environment Variables Required

### For Edge Functions Deployment:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Supabase (Auto-configured)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

---

## Testing with Postman

Import the `API_Testing_Postman_Collection.json` file into Postman for complete API testing.

### Setup Steps:

1. Import the collection into Postman
2. Create an environment with variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `auth_token`: Your access token (obtained after login)
3. Run authentication first to set the `auth_token`
4. Execute requests in order (collection is pre-configured with test scripts)

---

## Support

For issues or questions:
- GitHub Issues: [Your Repository]
- Email: support@example.com
- Documentation: https://docs.example.com

---

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial release with 8 microservices
- Razorpay payment integration
- WhatsApp webhook support
- Complete CRUD operations for all entities
- Analytics and reporting endpoints
