export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  phone: string | null;
  timezone: string;
  branding: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
  };
  onboarding_completed_at: string | null;
  onboarding_step: number;
  status: 'active' | 'suspended' | 'trial';
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'agent';
  status: 'active' | 'invited' | 'inactive';
}

export interface Contact {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  is_lead: boolean;
  lead_stage: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'whatsapp' | 'manual' | 'import' | 'campaign' | 'automation';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  contact_id: string;
  contact?: Contact;
  status: 'open' | 'closed' | 'archived';
  assigned_to: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'video' | 'document' | 'audio';
  body: string | null;
  media_url: string | null;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  sent_by: string | null;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'paused' | 'failed';
  scheduled_at: string | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  replied_count: number;
  failed_count: number;
  created_at: string;
}

export interface Workflow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  trigger_type: 'message_received' | 'keyword' | 'tag_added' | 'appointment_booked' | 'webhook';
  status: 'draft' | 'active' | 'paused';
  execution_count: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  contact_id: string;
  contact?: Contact;
  service_id: string;
  service?: Service;
  slot_time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  currency: string;
  is_active: boolean;
}

export interface DashboardSummary {
  new_leads: number;
  unread_conversations: number;
  active_campaigns: number;
  appointments_today: number;
  automation_responses: number;
  message_quota_used: number;
  message_quota_total: number;
}
