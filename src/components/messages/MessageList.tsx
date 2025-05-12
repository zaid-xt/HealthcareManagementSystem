import React from 'react';
import { Mail, Clock, Paperclip } from 'lucide-react';
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
              <Mail className={`h-5 w-5 ${message.read ? 'text-gray-400' : 'text-blue-500'}`} />
              <span className="ml-2 font-medium text-gray-900">{getSenderName(message.senderId)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(message.timestamp).toLocaleDateString()}
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