import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Campaign } from '../../types';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign;
  onSuccess: () => void;
}

export const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}) => {
  const { tenant, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    message_template: '',
    status: 'draft',
    scheduled_at: '',
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        message_template: campaign.message_template || '',
        status: campaign.status,
        scheduled_at: campaign.scheduled_at || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        message_template: '',
        status: 'draft',
        scheduled_at: '',
      });
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      alert('Demo mode: Campaign would be ' + (campaign ? 'updated' : 'created') + ' in production');
      onSuccess();
      onClose();
      return;
    }

    if (!tenant) return;

    setLoading(true);
    try {
      if (campaign) {
        const { error } = await supabase
          .from('campaigns')
          .update({
            name: formData.name,
            description: formData.description,
            message_template: formData.message_template,
            status: formData.status,
            scheduled_at: formData.scheduled_at || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', campaign.id)
          .eq('tenant_id', tenant.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('campaigns')
          .insert({
            tenant_id: tenant.id,
            name: formData.name,
            description: formData.description,
            message_template: formData.message_template,
            status: formData.status,
            scheduled_at: formData.scheduled_at || null,
            sent_count: 0,
            delivered_count: 0,
            read_count: 0,
            replied_count: 0,
          });

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign ? 'Edit Campaign' : 'Create Campaign'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Campaign Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Summer Sale 2024"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this campaign"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message Template *
          </label>
          <textarea
            value={formData.message_template}
            onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
            placeholder="Enter your message template..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schedule Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
