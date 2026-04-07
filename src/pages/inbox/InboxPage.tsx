import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { dummyConversations } from '../../lib/dummyData';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { ChatView } from '../../components/inbox/ChatView';
import { MessageSquare, Search, Send } from 'lucide-react';
import type { Conversation, Contact, Message } from '../../types';

export const InboxPage: React.FC = () => {
  const { tenant, isDemoMode } = useAuth();
  const [conversations, setConversations] = useState<(Conversation & { contact: Contact })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { contact: Contact }) | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (isDemoMode) {
        setConversations(dummyConversations);
        setLoading(false);
        return;
      }

      if (!tenant) return;

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            contact:contacts(*)
          `)
          .eq('tenant_id', tenant.id)
          .order('last_message_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setConversations(data as any);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [tenant, isDemoMode]);

  const filteredConversations = conversations.filter((conv) => {
    const contactName = `${conv.contact.first_name} ${conv.contact.last_name || ''}`.toLowerCase();
    const phone = conv.contact.phone.toLowerCase();
    const searchLower = search.toLowerCase();
    return contactName.includes(searchLower) || phone.includes(searchLower);
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSelectConversation = async (conversation: Conversation & { contact: Contact }) => {
    setSelectedConversation(conversation);

    if (isDemoMode) {
      const dummyMessages: Message[] = [
        {
          id: '1',
          conversation_id: conversation.id,
          content: 'Hi! I would like to know more about your services.',
          direction: 'inbound',
          status: 'delivered',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          conversation_id: conversation.id,
          content: 'Hello! Thank you for reaching out. We offer a wide range of services. What specifically are you interested in?',
          direction: 'outbound',
          status: 'read',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
        },
        {
          id: '3',
          conversation_id: conversation.id,
          content: 'I am interested in your premium package.',
          direction: 'inbound',
          status: 'delivered',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
      setMessages(dummyMessages);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation) return;

    if (isDemoMode) {
      const newMessage: Message = {
        id: Date.now().toString(),
        conversation_id: selectedConversation.id,
        content: text,
        direction: 'outbound',
        status: 'sent',
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          tenant_id: tenant!.id,
          contact_id: selectedConversation.contact_id,
          content: text,
          direction: 'outbound',
          status: 'sent',
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setMessages([...messages, data]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inbox</h1>
        <p className="text-gray-600">Manage your customer conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        <div className="lg:col-span-1 flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredConversations.length === 0 ? (
            <Card>
              <EmptyState
                icon={<MessageSquare className="w-12 h-12" />}
                title="No conversations yet"
                description="Start receiving messages from your customers to see conversations here."
              />
            </Card>
          ) : (
            <Card className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {conversation.contact.first_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {conversation.contact.first_name} {conversation.contact.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_at)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {conversation.last_message_preview || 'No messages yet'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={conversation.status === 'open' ? 'success' : 'default'}
                            size="sm"
                          >
                            {conversation.status}
                          </Badge>
                          {conversation.unread_count > 0 && (
                            <Badge variant="info" size="sm">
                              {conversation.unread_count} unread
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-full">
              <ChatView
                conversation={{
                  ...selectedConversation,
                  contact_name: `${selectedConversation.contact.first_name} ${selectedConversation.contact.last_name || ''}`,
                  contact_phone: selectedConversation.contact.phone,
                }}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <EmptyState
                icon={<MessageSquare className="w-16 h-16" />}
                title="Select a conversation"
                description="Choose a conversation from the list to view and send messages"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
