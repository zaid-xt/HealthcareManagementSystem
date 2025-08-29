import React from 'react';
import { MessageSquare, X, Bell } from 'lucide-react';
import { Message } from '../../api/messagesApi';
import { User } from '../../api/usersApi';

interface MessageNotificationProps {
  message: Message;
  users: User[];
  onClose: () => void;
  onView: () => void;
  isVisible: boolean;
}

const MessageNotification: React.FC<MessageNotificationProps> = ({
  message,
  users,
  onClose,
  onView,
  isVisible
}) => {
  const sender = users.find(user => user.id === message.senderId);
  const isUrgent = message.priority === 'urgent';

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${
      isUrgent ? 'border-l-red-500' : 'border-l-blue-500'
    } transform transition-all duration-300 ease-in-out animate-in slide-in-from-right`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              isUrgent ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Bell className={`h-5 w-5 ${
                isUrgent ? 'text-red-600' : 'text-blue-600'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  New message from {sender?.name || 'Unknown User'}
                </span>
                {isUrgent && (
                  <span className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {message.subject}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">
                {message.content}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-3 flex space-x-2">
          <button
            onClick={onView}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              isUrgent
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            View Message
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageNotification;
