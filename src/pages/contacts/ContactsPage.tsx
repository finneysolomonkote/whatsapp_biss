import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { dummyContacts } from '../../lib/dummyData';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { Users, Search, Plus, Mail, Phone } from 'lucide-react';
import type { Contact } from '../../types';

export const ContactsPage: React.FC = () => {
  const { tenant, isDemoMode } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [tenant, isDemoMode]);

  const fetchContacts = async () => {
    if (isDemoMode) {
      setContacts(dummyContacts);
      setLoading(false);
      return;
    }

    if (!tenant) return;

    try{
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!tenant || !newContact.first_name || !newContact.phone) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('contacts').insert({
        tenant_id: tenant.id,
        ...newContact,
        source: 'manual',
      });

      if (error) throw error;

      setShowAddModal(false);
      setNewContact({ first_name: '', last_name: '', phone: '', email: '' });
      fetchContacts();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const name = `${contact.first_name} ${contact.last_name || ''}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return name.includes(searchLower) || contact.phone.includes(searchLower) || (contact.email && contact.email.toLowerCase().includes(searchLower));
  });

  const getStageColor = (stage: string) => {
    const colors: Record<string, any> = {
      new: 'info',
      contacted: 'warning',
      qualified: 'success',
      converted: 'success',
      lost: 'danger',
    };
    return colors[stage] || 'default';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contacts</h1>
          <p className="text-gray-600">Manage your customer contacts and leads</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No contacts yet"
            description="Add your first contact to start building your customer database."
            action={
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">
                            {contact.first_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {contact.first_name} {contact.last_name}
                          </p>
                          {contact.is_lead && (
                            <Badge variant="info" size="sm">
                              Lead
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {contact.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {contact.email ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {contact.email}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStageColor(contact.lead_stage)} size="sm">
                        {contact.lead_stage}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {contact.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Contact"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              value={newContact.first_name}
              onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={newContact.last_name}
              onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
            />
          </div>
          <Input
            label="Phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            required
          />
          <Input
            label="Email (Optional)"
            type="email"
            placeholder="john@example.com"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
          />
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleAddContact} loading={saving} className="flex-1">
              Add Contact
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
