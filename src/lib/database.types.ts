export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          industry: string | null
          phone: string | null
          timezone: string
          branding: Json
          onboarding_completed_at: string | null
          onboarding_step: number
          status: 'active' | 'suspended' | 'trial'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          industry?: string | null
          phone?: string | null
          timezone?: string
          branding?: Json
          onboarding_completed_at?: string | null
          onboarding_step?: number
          status?: 'active' | 'suspended' | 'trial'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          industry?: string | null
          phone?: string | null
          timezone?: string
          branding?: Json
          onboarding_completed_at?: string | null
          onboarding_step?: number
          status?: 'active' | 'suspended' | 'trial'
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tenant_members: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'agent'
          status: 'active' | 'invited' | 'inactive'
          invited_by: string | null
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'agent'
          status?: 'active' | 'invited' | 'inactive'
          invited_by?: string | null
          joined_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'agent'
          status?: 'active' | 'invited' | 'inactive'
          invited_by?: string | null
          joined_at?: string
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          tenant_id: string
          first_name: string
          last_name: string | null
          phone: string
          email: string | null
          avatar_url: string | null
          is_lead: boolean
          lead_stage: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          source: 'whatsapp' | 'manual' | 'import' | 'campaign' | 'automation'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          first_name: string
          last_name?: string | null
          phone: string
          email?: string | null
          avatar_url?: string | null
          is_lead?: boolean
          lead_stage?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          source?: 'whatsapp' | 'manual' | 'import' | 'campaign' | 'automation'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          first_name?: string
          last_name?: string | null
          phone?: string
          email?: string | null
          avatar_url?: string | null
          is_lead?: boolean
          lead_stage?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          source?: 'whatsapp' | 'manual' | 'import' | 'campaign' | 'automation'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          tenant_id: string
          contact_id: string
          whatsapp_integration_id: string
          status: 'open' | 'closed' | 'archived'
          assigned_to: string | null
          last_message_at: string
          last_message_preview: string | null
          unread_count: number
          created_at: string
          updated_at: string
        }
      }
      messages: {
        Row: {
          id: string
          tenant_id: string
          conversation_id: string
          whatsapp_message_id: string | null
          direction: 'inbound' | 'outbound'
          type: 'text' | 'image' | 'video' | 'document' | 'audio'
          body: string | null
          media_url: string | null
          status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
          error: string | null
          sent_by: string | null
          campaign_id: string | null
          workflow_execution_id: string | null
          sent_at: string
          delivered_at: string | null
          read_at: string | null
          created_at: string
        }
      }
      campaigns: {
        Row: {
          id: string
          tenant_id: string
          name: string
          template_id: string | null
          segment_id: string | null
          status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'paused' | 'failed'
          scheduled_at: string | null
          started_at: string | null
          completed_at: string | null
          total_recipients: number
          sent_count: number
          delivered_count: number
          read_count: number
          replied_count: number
          failed_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
      }
      workflows: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          trigger_type: 'message_received' | 'keyword' | 'tag_added' | 'appointment_booked' | 'webhook'
          trigger_config: Json
          nodes: Json
          status: 'draft' | 'active' | 'paused'
          execution_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
      }
      appointments: {
        Row: {
          id: string
          tenant_id: string
          contact_id: string
          service_id: string
          slot_id: string | null
          slot_time: string
          status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          reminder_sent: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      services: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          duration_minutes: number
          price: number | null
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          tenant_id: string
          plan_name: 'starter' | 'growth' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due' | 'trial'
          message_quota: number
          current_period_start: string
          current_period_end: string
          trial_ends_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
