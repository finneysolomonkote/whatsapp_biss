import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Building2, Users, CreditCard, Bell, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState('workspace');

  const tabs = [
    { id: 'workspace', label: 'Workspace', icon: Building2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your workspace settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'workspace' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Workspace Settings</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Workspace Name" value={tenant?.name} readOnly />
                <Input label="Industry" value={tenant?.industry || 'Not set'} readOnly />
                <Input label="Phone" value={tenant?.phone || 'Not set'} readOnly />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge variant={tenant?.status === 'active' ? 'success' : 'warning'}>
                    {tenant?.status}
                  </Badge>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'team' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  <Button size="sm">Invite Member</Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user?.first_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.first_name} {user?.last_name} (You)
                        </p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    <Badge variant="info">Owner</Badge>
                  </div>
                  <p className="text-sm text-gray-500 text-center py-4">
                    No other team members yet
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Billing & Subscription</h3>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Plan</p>
                  <div className="flex items-center space-x-3">
                    <Badge variant="success" size="md">
                      Starter Plan
                    </Badge>
                    <span className="text-sm text-gray-600">Free Trial</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Message Quota</p>
                  <p className="text-2xl font-bold text-gray-900">10,000 / month</p>
                </div>
                <Button>Upgrade Plan</Button>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">New Messages</p>
                    <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Campaign Status</p>
                    <p className="text-sm text-gray-600">Updates on campaign completion</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Weekly Reports</p>
                    <p className="text-sm text-gray-600">Receive weekly analytics summary</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-gray-600 mb-4">
                  Use API keys to integrate with external systems
                </p>
                <Button>Generate API Key</Button>
                <p className="text-sm text-gray-500 mt-4">No API keys generated yet</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
