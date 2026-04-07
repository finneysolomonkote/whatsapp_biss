import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { dummyDashboardSummary } from '../../lib/dummyData';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import {
  Users,
  MessageSquare,
  Send,
  Calendar,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Upload,
  Sparkles,
} from 'lucide-react';
import type { DashboardSummary } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user, tenant, isDemoMode } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (isDemoMode) {
        setSummary(dummyDashboardSummary);
        setLoading(false);
        return;
      }

      if (!tenant) return;

      try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        const [
          { count: newLeads },
          { count: unreadConversations },
          { count: activeCampaigns },
          { count: appointmentsToday },
          { count: automationResponses },
          { data: subscription },
        ] = await Promise.all([
          supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .eq('is_lead', true)
            .gte('created_at', last24h),
          supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .eq('status', 'open')
            .gt('unread_count', 0),
          supabase
            .from('campaigns')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .in('status', ['scheduled', 'processing']),
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .gte('slot_time', `${today}T00:00:00`)
            .lte('slot_time', `${today}T23:59:59`)
            .eq('status', 'confirmed'),
          supabase
            .from('workflow_executions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenant.id)
            .gte('created_at', last24h),
          supabase
            .from('subscriptions')
            .select('*')
            .eq('tenant_id', tenant.id)
            .single(),
        ]);

        const { data: usage } = await supabase
          .from('usage_logs')
          .select('quantity')
          .eq('tenant_id', tenant.id)
          .eq('resource_type', 'message')
          .eq('month', new Date().toISOString().slice(0, 7));

        const messageUsage = usage?.reduce((sum, log) => sum + log.quantity, 0) || 0;

        setSummary({
          new_leads: newLeads || 0,
          unread_conversations: unreadConversations || 0,
          active_campaigns: activeCampaigns || 0,
          appointments_today: appointmentsToday || 0,
          automation_responses: automationResponses || 0,
          message_quota_used: messageUsage,
          message_quota_total: subscription?.message_quota || 10000,
        });
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [tenant, isDemoMode]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'New Leads',
      value: summary?.new_leads || 0,
      subtitle: 'Last 24 hours',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      change: '+12%',
    },
    {
      title: 'Unread Messages',
      value: summary?.unread_conversations || 0,
      subtitle: 'Awaiting response',
      icon: MessageSquare,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/20 to-teal-500/20',
      change: '+8%',
    },
    {
      title: 'Active Campaigns',
      value: summary?.active_campaigns || 0,
      subtitle: 'In progress',
      icon: Send,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/20 to-orange-500/20',
      change: '+5%',
    },
    {
      title: 'Appointments Today',
      value: summary?.appointments_today || 0,
      subtitle: 'Confirmed bookings',
      icon: Calendar,
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      change: '+15%',
    },
    {
      title: 'Automation Responses',
      value: summary?.automation_responses || 0,
      subtitle: 'Last 24 hours',
      icon: Zap,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/20 to-purple-500/20',
      change: '+25%',
    },
    {
      title: 'Message Usage',
      value: summary?.message_quota_used || 0,
      subtitle: `of ${summary?.message_quota_total || 0} this month`,
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-500/20 to-rose-500/20',
      showProgress: true,
      progressPercent: Math.min(
        100,
        ((summary?.message_quota_used || 0) / (summary?.message_quota_total || 1)) * 100
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {getGreeting()}, {user?.first_name}!
          </h1>
          <p className="text-gray-400 text-lg">
            Here's what's happening in your workspace today
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-gray-300">All systems operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="group glass-card p-6 rounded-2xl hover:shadow-glow transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">{card.title}</p>
                  <p className="text-4xl font-bold text-white">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              {card.showProgress ? (
                <div className="mt-4">
                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-500`}
                      style={{ width: `${card.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{card.subtitle}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                  {card.change && (
                    <div className="flex items-center space-x-1 text-emerald-400">
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="text-xs font-semibold">{card.change}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            <button className="group w-full text-left px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Send className="w-4 h-4 text-cyan-400" />
                    <p className="font-semibold text-white">Create New Campaign</p>
                  </div>
                  <p className="text-sm text-gray-400">Send messages to your contacts</p>
                </div>
                <Plus className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </button>
            <button className="group w-full text-left px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <p className="font-semibold text-white">Add Automation</p>
                  </div>
                  <p className="text-sm text-gray-400">Set up auto-replies and workflows</p>
                </div>
                <Plus className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
            </button>
            <button className="group w-full text-left px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/20 hover:border-amber-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <p className="font-semibold text-white">Import Contacts</p>
                  </div>
                  <p className="text-sm text-gray-400">Upload CSV to add contacts</p>
                </div>
                <Plus className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-xl font-bold text-white">Getting Started</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-glow">
                <span className="text-white font-bold">✓</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">Create your workspace</p>
                <p className="text-sm text-gray-400">You've successfully set up your account</p>
                <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-full" />
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">Connect WhatsApp</p>
                <p className="text-sm text-gray-400">Link your WhatsApp Business account</p>
                <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-1/3" />
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 font-bold">3</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white mb-1">Create your first automation</p>
                <p className="text-sm text-gray-400">Set up auto-replies for common questions</p>
                <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 bg-gray-700 rounded-full w-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
