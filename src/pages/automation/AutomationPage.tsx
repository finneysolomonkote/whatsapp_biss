import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { dummyWorkflows } from '../../lib/dummyData';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { WorkflowModal } from '../../components/automation/WorkflowModal';
import { Zap, Plus, Play, Pause } from 'lucide-react';
import type { Workflow } from '../../types';

export const AutomationPage: React.FC = () => {
  const { tenant, isDemoMode } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | undefined>();

  useEffect(() => {
    const fetchWorkflows = async () => {
      if (isDemoMode) {
        setWorkflows(dummyWorkflows);
        setLoading(false);
        return;
      }

      if (!tenant) return;

      try {
        const { data, error } = await supabase
          .from('workflows')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWorkflows(data || []);
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [tenant, isDemoMode]);

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      message_received: 'Message Received',
      keyword: 'Keyword Match',
      tag_added: 'Tag Added',
      appointment_booked: 'Appointment Booked',
      webhook: 'Webhook',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      draft: 'default',
      active: 'success',
      paused: 'warning',
    };
    return colors[status] || 'default';
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(undefined);
    setShowModal(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setShowModal(true);
  };

  const handleToggleStatus = async (workflow: Workflow) => {
    if (isDemoMode) {
      alert('Demo mode: Workflow status would be toggled in production');
      return;
    }

    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ status: newStatus })
        .eq('id', workflow.id);

      if (error) throw error;
      fetchWorkflows();
    } catch (error) {
      console.error('Error updating workflow status:', error);
    }
  };

  const fetchWorkflows = async () => {
    if (isDemoMode) {
      setWorkflows(dummyWorkflows);
      return;
    }

    if (!tenant) return;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation</h1>
          <p className="text-gray-600">Create workflows to automate your WhatsApp responses</p>
        </div>
        <Button onClick={handleCreateWorkflow}>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Zap className="w-12 h-12" />}
            title="No automation workflows yet"
            description="Create automated workflows to respond to customers instantly based on triggers and keywords."
            action={
              <Button onClick={handleCreateWorkflow}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {workflow.name}
                      </h3>
                      {workflow.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {workflow.description}
                        </p>
                      )}
                      <Badge variant={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEditWorkflow(workflow)}>
                      Edit
                    </Button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Trigger</p>
                    <p className="text-sm font-medium text-gray-900">
                      {getTriggerLabel(workflow.trigger_type)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Executions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {workflow.execution_count}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleToggleStatus(workflow)}
                    >
                      {workflow.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <WorkflowModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        workflow={selectedWorkflow}
        onSuccess={() => {
          fetchWorkflows();
          setShowModal(false);
        }}
      />
    </div>
  );
};
