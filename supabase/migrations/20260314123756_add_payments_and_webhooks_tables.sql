/*
  # Add Payments and Webhooks Tables

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `user_id` (uuid, foreign key to auth.users)
      - `order_id` (text, unique)
      - `payment_id` (text)
      - `amount` (numeric)
      - `currency` (text)
      - `status` (text) - created, completed, failed, refunded
      - `payment_gateway` (text) - razorpay
      - `refund_id` (text)
      - `completed_at` (timestamptz)
      - `refunded_at` (timestamptz)
      - `failure_reason` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `webhook_registrations`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `url` (text)
      - `events` (text array)
      - `provider` (text)
      - `secret` (text)
      - `status` (text) - active, inactive
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to access their own data
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id text UNIQUE NOT NULL,
  payment_id text,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR' NOT NULL,
  status text DEFAULT 'created' NOT NULL,
  payment_gateway text DEFAULT 'razorpay' NOT NULL,
  refund_id text,
  completed_at timestamptz,
  refunded_at timestamptz,
  failure_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create webhook_registrations table
CREATE TABLE IF NOT EXISTS webhook_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  events text[] DEFAULT ARRAY[]::text[],
  provider text NOT NULL,
  secret text NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_registrations ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Webhook registrations policies  
CREATE POLICY "Tenant members can view webhooks"
  ON webhook_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = webhook_registrations.tenant_id
      AND tenant_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can insert webhooks"
  ON webhook_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = webhook_registrations.tenant_id
      AND tenant_members.user_id = auth.uid()
      AND tenant_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Tenant admins can update webhooks"
  ON webhook_registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = webhook_registrations.tenant_id
      AND tenant_members.user_id = auth.uid()
      AND tenant_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = webhook_registrations.tenant_id
      AND tenant_members.user_id = auth.uid()
      AND tenant_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Tenant admins can delete webhooks"
  ON webhook_registrations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_members
      WHERE tenant_members.tenant_id = webhook_registrations.tenant_id
      AND tenant_members.user_id = auth.uid()
      AND tenant_members.role IN ('owner', 'admin')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_tenant_id ON webhook_registrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_provider ON webhook_registrations(provider);
