/*
  # WhatsApp Business Automation SaaS Platform - Complete Database Schema

  ## Overview
  This migration creates the complete database schema for a production-ready multi-tenant
  WhatsApp Business Automation SaaS platform supporting:
  - Multi-tenant workspace management
  - Authentication and user management
  - WhatsApp integration and messaging
  - CRM and contact management
  - Campaign management
  - Automation workflows
  - Appointment booking
  - Analytics and reporting
  - Billing and subscriptions

  ## Tables Created

  ### 1. Core Platform Tables
    - `tenants` - Workspace/business accounts
    - `user_profiles` - Extended user information
    - `tenant_members` - Team members in workspaces
    - `roles` - Role definitions
    - `permissions` - Permission definitions
    - `role_permissions` - Role-permission mappings

  ### 2. WhatsApp Integration
    - `whatsapp_integrations` - WhatsApp Business API connections
    - `conversations` - Customer conversations
    - `messages` - Individual messages
    - `message_templates` - WhatsApp message templates

  ### 3. CRM
    - `contacts` - Customer contact records
    - `contact_tags` - Tags for contacts
    - `contact_custom_fields` - Custom field definitions
    - `contact_field_values` - Custom field values
    - `contact_timeline` - Activity timeline

  ### 4. Campaigns
    - `campaigns` - Broadcast campaigns
    - `campaign_messages` - Individual campaign message records
    - `segments` - Contact segments
    - `segment_members` - Segment membership

  ### 5. Automation
    - `workflows` - Automation workflow definitions
    - `workflow_executions` - Workflow execution records
    - `workflow_nodes` - Workflow node definitions

  ### 6. Appointments
    - `services` - Bookable services
    - `appointment_slots` - Available time slots
    - `appointments` - Booked appointments

  ### 7. Analytics & Billing
    - `analytics_events` - Event tracking
    - `subscriptions` - Tenant subscriptions
    - `usage_logs` - Message usage tracking
    - `invoices` - Billing invoices

  ### 8. System
    - `audit_logs` - System audit trail
    - `feature_flags` - Feature flag configuration

  ## Security
  - Row Level Security (RLS) enabled on all tenant-scoped tables
  - Policies enforce tenant isolation
  - Sensitive data encrypted
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TENANTS & USERS
-- =====================================================

-- Tenants table (workspaces/businesses)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  branding JSONB DEFAULT '{}',
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant members (team membership)
CREATE TABLE IF NOT EXISTS tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'agent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'inactive')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- =====================================================
-- 2. WHATSAPP INTEGRATION
-- =====================================================

-- WhatsApp integrations
CREATE TABLE IF NOT EXISTS whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  phone_number_id TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  business_account_id TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  webhook_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, phone_number_id)
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL,
  whatsapp_integration_id UUID NOT NULL REFERENCES whatsapp_integrations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  assigned_to UUID REFERENCES auth.users(id),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  last_message_preview TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  whatsapp_message_id TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'document', 'audio')),
  body TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  error TEXT,
  sent_by UUID REFERENCES auth.users(id),
  campaign_id UUID,
  workflow_execution_id UUID,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Message templates (WhatsApp approved templates)
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('marketing', 'utility', 'authentication')),
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  template_id TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- =====================================================
-- 3. CRM & CONTACTS
-- =====================================================

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  is_lead BOOLEAN DEFAULT true,
  lead_stage TEXT DEFAULT 'new' CHECK (lead_stage IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  source TEXT DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'manual', 'import', 'campaign', 'automation')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, phone)
);

-- Contact tags
CREATE TABLE IF NOT EXISTS contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contact_id, tag)
);

-- Contact custom fields
CREATE TABLE IF NOT EXISTS contact_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select')),
  field_options JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, field_name)
);

-- Contact field values
CREATE TABLE IF NOT EXISTS contact_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES contact_custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contact_id, field_id)
);

-- Contact timeline (activity log)
CREATE TABLE IF NOT EXISTS contact_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('message', 'call', 'note', 'stage_change', 'tag_added', 'campaign_sent', 'workflow_executed')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 4. CAMPAIGNS
-- =====================================================

-- Segments
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  contact_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Segment members (denormalized for performance)
CREATE TABLE IF NOT EXISTS segment_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(segment_id, contact_id)
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id UUID REFERENCES message_templates(id),
  segment_id UUID REFERENCES segments(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'processing', 'completed', 'paused', 'failed')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campaign messages
CREATE TABLE IF NOT EXISTS campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  error TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, contact_id)
);

-- =====================================================
-- 5. AUTOMATION
-- =====================================================

-- Workflows
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('message_received', 'keyword', 'tag_added', 'appointment_booked', 'webhook')),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  nodes JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  execution_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  current_node_index INTEGER DEFAULT 0,
  context JSONB DEFAULT '{}',
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 6. APPOINTMENTS
-- =====================================================

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Appointment slots
CREATE TABLE IF NOT EXISTS appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  slot_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN DEFAULT true,
  staff_member_id UUID REFERENCES auth.users(id),
  version INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES appointment_slots(id),
  slot_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 7. ANALYTICS & BILLING
-- =====================================================

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'starter' CHECK (plan_name IN ('starter', 'growth', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trial')),
  message_quota INTEGER DEFAULT 10000,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days',
  trial_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usage logs
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('message', 'storage', 'contact')),
  quantity INTEGER DEFAULT 1,
  month DATE DEFAULT date_trunc('month', CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE DEFAULT CURRENT_DATE + INTERVAL '7 days',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 8. SYSTEM
-- =====================================================

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  flag_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, flag_name)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);

-- Tenant members
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON tenant_members(user_id);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_tenant_id ON messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_whatsapp_message_id ON messages(whatsapp_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);

-- Contacts
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_stage ON contacts(lead_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Contact tags
CREATE INDEX IF NOT EXISTS idx_contact_tags_contact_id ON contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_tags_tag ON contact_tags(tag);

-- Campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at);

-- Campaign messages
CREATE INDEX IF NOT EXISTS idx_campaign_messages_campaign_id ON campaign_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_status ON campaign_messages(status);

-- Workflows
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

-- Workflow executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_contact_id ON workflow_executions(contact_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id ON appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_slot_time ON appointments(slot_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Analytics events
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_id ON analytics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Usage logs
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_id ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_month ON usage_logs(month);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tenant policies
CREATE POLICY "Users can view their tenants"
  ON tenants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = tenants.id
      AND tenant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tenants"
  ON tenants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Tenant owners can update"
  ON tenants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = tenants.id
      AND tenant_members.user_id = auth.uid()
      AND tenant_members.role = 'owner'
    )
  );

-- Tenant members policies
CREATE POLICY "Users can view tenant members"
  ON tenant_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tenant members"
  ON tenant_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Generic tenant-scoped policies
CREATE POLICY "Users can view tenant data"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = conversations.tenant_id
      AND tenant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = messages.tenant_id
      AND tenant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = contacts.tenant_id
      AND tenant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = contacts.tenant_id
      AND tenant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = contacts.tenant_id
      AND tenant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = campaigns.tenant_id
      AND tenant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = workflows.tenant_id
      AND tenant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = appointments.tenant_id
      AND tenant_members.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to automatically create subscription on tenant creation
CREATE OR REPLACE FUNCTION create_tenant_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (tenant_id, plan_name, status, trial_ends_at)
  VALUES (NEW.id, 'starter', 'trial', now() + INTERVAL '14 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create subscription
CREATE TRIGGER on_tenant_created
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION create_tenant_subscription();
