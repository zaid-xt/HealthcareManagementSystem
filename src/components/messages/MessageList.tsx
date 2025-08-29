import React from 'react';
import { Mail, Clock, AlertCircle, User, ArrowRight } from 'lucide-react';
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

  if (messages.length === 0) {
    return (
      <div className="p-8 text-center">
        <Mail className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No messages found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start a conversation by sending a new message.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          onClick={() => onMessageClick(message)}
          className={`bg-white rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 ${
            !message.is_read 
              ? 'border-blue-300 bg-blue-50' 
              : 'border-gray-200'
          }`}
        >
          <div className="p-4">
            {/* Message Header - Simple and Clean */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                  {message.subject}
                </h3>
                
                {/* Priority Badge - Simple */}
                {message.priority === 'urgent' && (
                  <span className="inline-block px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
                    URGENT
                  </span>
                )}
              </div>
              
              {/* Read Status - More Prominent */}
              <div className={`ml-3 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                message.is_read 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-blue-100 text-blue-700 border border-blue-300 animate-pulse'
              }`}>
                {message.is_read ? '✓ Read' : '● New'}
              </div>
            </div>
            
            {/* Message Details - Clean Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>From: <span className="font-medium text-gray-900">{getSenderName(message.senderId)}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>To: <span className="font-medium text-gray-900">{getReceiverName(message.receiverId)}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{new Date(message.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Message Preview - Simple */}
            <div className="mb-3">
              <p className="text-gray-700 line-clamp-2">
                {message.content}
              </p>
            </div>
            
            {/* Action Hint - Simple */}
            <div className="flex items-center justify-between text-sm text-blue-600">
              <span>Click to read full message</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;