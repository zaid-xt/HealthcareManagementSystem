import React from 'react';
import { Mail, Clock, Paperclip, AlertCircle } from 'lucide-react';
import { Message } from '../../types';
import { users } from '../../utils/mockData';

interface MessageListProps {
  messages: Message[];
  onMessageClick: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onMessageClick }) => {
  const getSenderName = (senderId: string) => {
    const sender = users.find(user => user.id === senderId);
    return sender?.name || 'Unknown User';
  };

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return 'text-gray-400';
      case 'delivered':
        return 'text-blue-400';
      case 'read':
        return 'text-green-400';
      case 'archived':
        return 'text-amber-400';
      case 'deleted':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Mail className="h-4 w-4" />;
      case 'delivered':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case 'read':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
            <polyline points="20 12 9 23 4 18" />
          </svg>
        );
      case 'archived':
        return <Mail className="h-4 w-4" />;
      case 'deleted':
        return <Mail className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {messages.map((message) => (
        <div
          key={message.id}
          onClick={() => onMessageClick(message)}
          className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
            !message.read ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`${message.priority === 'urgent' ? 'text-red-500' : 'text-gray-400'}`}>
                {message.priority === 'urgent' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </div>
              <span className="ml-2 font-medium text-gray-900">{getSenderName(message.senderId)}</span>
              {message.priority === 'urgent' && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                  Urgent
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${getStatusColor(message.status)}`}>
                {getStatusIcon(message.status)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(message.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
          <h3 className={`mt-1 text-sm ${message.read ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
            {message.subject}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {message.content}
          </p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Paperclip className="h-4 w-4 mr-1" />
              {message.attachments.length} attachment(s)
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;