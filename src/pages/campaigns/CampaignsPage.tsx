import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { dummyCampaigns } from '../../lib/dummyData';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { CampaignModal } from '../../components/campaigns/CampaignModal';
import { Modal } from '../../components/ui/Modal';
import { Send, Plus, TrendingUp } from 'lucide-react';
import type { Campaign } from '../../types';

export const CampaignsPage: React.FC = () => {
  const { tenant, isDemoMode } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | undefined>();
  const [showDetailView, setShowDetailView] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (isDemoMode) {
        setCampaigns(dummyCampaigns);
        setLoading(false);
        return;
      }

      if (!tenant) return;

      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCampaigns(data || []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [tenant, isDemoMode]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      draft: 'default',
      scheduled: 'warning',
      processing: 'info',
      completed: 'success',
      paused: 'warning',
      failed: 'danger',
    };
    return colors[status] || 'default';
  };

  const calculateDeliveryRate = (campaign: Campaign) => {
    if (campaign.total_recipients === 0) return 0;
    return Math.round((campaign.delivered_count / campaign.total_recipients) * 100);
  };

  const calculateReadRate = (campaign: Campaign) => {
    if (campaign.delivered_count === 0) return 0;
    return Math.round((campaign.read_count / campaign.delivered_count) * 100);
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(undefined);
    setShowModal(true);
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailView(true);
  };

  const fetchCampaigns = async () => {
    if (isDemoMode) {
      setCampaigns(dummyCampaigns);
      return;
    }

    if (!tenant) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h1>
          <p className="text-gray-600">Create and manage broadcast campaigns</p>
        </div>
        <Button onClick={handleCreateCampaign}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Send className="w-12 h-12" />}
            title="No campaigns yet"
            description="Create your first broadcast campaign to reach your customers on WhatsApp."
            action={
              <Button onClick={handleCreateCampaign}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {campaign.name}
                      </h3>
                      <Badge variant={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewCampaign(campaign)}>
                      View
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Recipients</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {campaign.total_recipients}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Sent</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {campaign.sent_count}
                      </p>
                    </div>
                  </div>

                  {campaign.status === 'completed' && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Delivered</p>
                          <p className="text-lg font-semibold text-green-600">
                            {calculateDeliveryRate(campaign)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Read</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {calculateReadRate(campaign)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Replied</p>
                          <p className="text-lg font-semibold text-purple-600">
                            {campaign.replied_count}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {campaign.scheduled_at && campaign.status === 'scheduled' && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Scheduled for{' '}
                        <span className="font-medium text-gray-900">
                          {new Date(campaign.scheduled_at).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <CampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        campaign={selectedCampaign}
        onSuccess={() => {
          fetchCampaigns();
          setShowModal(false);
        }}
      />

      {showDetailView && selectedCampaign && (
        <Modal
          isOpen={showDetailView}
          onClose={() => setShowDetailView(false)}
          title={selectedCampaign.name}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900">{selectedCampaign.description || 'No description'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Message Template</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedCampaign.message_template}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Status</h3>
                <Badge variant={getStatusColor(selectedCampaign.status)}>
                  {selectedCampaign.status}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Recipients</h3>
                <p className="text-2xl font-bold text-gray-900">{selectedCampaign.total_recipients}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Sent</h3>
                <p className="text-xl font-bold text-gray-900">{selectedCampaign.sent_count}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Delivered</h3>
                <p className="text-xl font-bold text-green-600">{selectedCampaign.delivered_count}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Read</h3>
                <p className="text-xl font-bold text-blue-600">{selectedCampaign.read_count}</p>
              </div>
            </div>

            {selectedCampaign.scheduled_at && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Scheduled For</h3>
                <p className="text-gray-900">{new Date(selectedCampaign.scheduled_at).toLocaleString()}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDetailView(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
