import React from 'react';
import { Mail, Clock, Paperclip, AlertCircle, MessageSquare, User, ArrowRight, Eye } from 'lucide-react';
import { Message } from '../../api/messagesApi';
import { User as UserType } from '../../api/usersApi';

interface MessageListProps {
  messages: Message[];
  users: UserType[];
  onMessageClick: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, users, onMessageClick }) => {
  const getSenderName = (senderId: string) => {
    const sender = users.find(user => user.id == senderId);
    return sender?.name || 'Unknown User';
  };

  const getReceiverName = (receiverId: string) => {
    const receiver = users.find(user => user.id == receiverId);
    return receiver?.name || 'Unknown User';
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

  if (messages.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start a conversation by sending a new message.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {messages.map((message) => (
        <div
          key={message.id}
          onClick={() => onMessageClick(message)}
          className={`bg-white rounded-2xl shadow-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden ${
            !message.is_read 
              ? 'border-blue-400 bg-gradient-to-br from-blue-50 via-white to-blue-50' 
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          {/* Message Header with Enhanced Styling */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Priority Icon with Enhanced Styling */}
                <div className={`p-4 rounded-full shadow-lg ${
                  message.priority === 'urgent' 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white ring-4 ring-red-100' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-4 ring-blue-100'
                }`}>
                  {message.priority === 'urgent' ? (
                    <AlertCircle className="h-7 w-7" />
                  ) : (
                    <Mail className="h-7 w-7" />
                  )}
                </div>
                
                {/* Message Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {message.subject}
                    </h3>
                    {message.priority === 'urgent' && (
                      <span className="px-4 py-2 text-sm font-bold text-red-700 bg-red-100 rounded-full border-2 border-red-200 shadow-sm">
                        🔴 URGENT
                      </span>
                    )}
                  </div>
                  
                  {/* Sender/Receiver Info with Better Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-600 font-medium">From:</span>
                      <span className="font-bold text-gray-900">{getSenderName(message.senderId)}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                      <User className="h-5 w-5 text-green-600" />
                      <span className="text-gray-600 font-medium">To:</span>
                      <span className="font-bold text-gray-900">{getReceiverName(message.receiverId)}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span className="text-gray-600 font-medium">Sent:</span>
                      <span className="font-bold text-gray-900">{new Date(message.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-col items-end space-y-3 ml-6">
                <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                  message.is_read 
                    ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                    : 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                }`}>
                  {message.is_read ? '✓ Read' : '● Unread'}
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
                  message.status === 'read' ? 'bg-green-50 text-green-600 border border-green-200' :
                  message.status === 'delivered' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                  'bg-gray-50 text-gray-600 border border-gray-200'
                }`}>
                  {message.status}
                </div>
              </div>
            </div>
          </div>

          {/* Message Content Preview with Enhanced Styling */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 rounded-xl p-5 border-2 border-gray-100 shadow-inner">
              <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Message Preview:
              </h4>
              <p className="text-gray-800 leading-relaxed line-clamp-3 text-lg">
                {message.content}
              </p>
            </div>
            
            {/* Action Hint with Better Styling */}
            <div className="mt-5 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
              <span className="text-sm text-blue-700 font-semibold">
                💡 Click anywhere on this message to read the full content and reply
              </span>
              <div className="flex items-center space-x-2 text-blue-600 font-bold">
                <span>View Full Message</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;