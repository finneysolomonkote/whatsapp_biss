import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Workflow } from '../../types';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow?: Workflow;
  onSuccess: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  workflow,
  onSuccess,
}) => {
  const { tenant, isDemoMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'message_received',
    trigger_config: {},
    actions: [],
    status: 'draft',
  });

  useEffect(() => {
    if (workflow) {
      setFormData({
        name: workflow.name,
        description: workflow.description || '',
        trigger_type: workflow.trigger_type,
        trigger_config: workflow.trigger_config || {},
        actions: workflow.actions || [],
        status: workflow.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        trigger_type: 'message_received',
        trigger_config: {},
        actions: [],
        status: 'draft',
      });
    }
  }, [workflow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      alert('Demo mode: Workflow would be ' + (workflow ? 'updated' : 'created') + ' in production');
      onSuccess();
      onClose();
      return;
    }

    if (!tenant) return;

    setLoading(true);
    try {
      if (workflow) {
        const { error } = await supabase
          .from('workflows')
          .update({
            name: formData.name,
            description: formData.description,
            trigger_type: formData.trigger_type,
            trigger_config: formData.trigger_config,
            actions: formData.actions,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflow.id)
          .eq('tenant_id', tenant.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('workflows')
          .insert({
            tenant_id: tenant.id,
            name: formData.name,
            description: formData.description,
            trigger_type: formData.trigger_type,
            trigger_config: formData.trigger_config,
            actions: formData.actions,
            status: formData.status,
            execution_count: 0,
          });

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={workflow ? 'Edit Workflow' : 'Create Workflow'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Workflow Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Welcome Message"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this workflow does"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trigger Type
          </label>
          <select
            value={formData.trigger_type}
            onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          >
            <option value="message_received">Message Received</option>
            <option value="keyword">Keyword Match</option>
            <option value="tag_added">Tag Added</option>
            <option value="appointment_booked">Appointment Booked</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>

        {formData.trigger_type === 'keyword' && (
          <Input
            label="Keyword"
            value={(formData.trigger_config as any).keyword || ''}
            onChange={(e) => setFormData({
              ...formData,
              trigger_config: { ...formData.trigger_config, keyword: e.target.value }
            })}
            placeholder="e.g., hello, help, pricing"
          />
        )}

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
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
