import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Send, Phone, Video, MoreVertical } from 'lucide-react';
import type { Conversation, Message } from '../../types';

interface ChatViewProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  messages,
  onSendMessage,
}) => {
  const [messageText, setMessageText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            {conversation.contact_name.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{conversation.contact_name}</h2>
            <p className="text-sm text-gray-500">{conversation.contact_phone}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.direction === 'outbound'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span
                    className={`text-xs ${
                      message.direction === 'outbound' ? 'text-purple-100' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </span>
                  {message.direction === 'outbound' && (
                    <span className="text-xs text-purple-100">
                      {message.status === 'delivered' && '✓✓'}
                      {message.status === 'read' && '✓✓'}
                      {message.status === 'sent' && '✓'}
                      {message.status === 'failed' && '✗'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Button type="submit" disabled={!messageText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
