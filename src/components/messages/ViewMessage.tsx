import React from 'react';
import { ArrowLeft, Paperclip, Clock, User } from 'lucide-react';
import Button from '../ui/Button';
import { Message } from '../../types';
import { users } from '../../utils/mockData';

interface ViewMessageProps {
  message: Message;
  onBack: () => void;
}

const ViewMessage: React.FC<ViewMessageProps> = ({ message, onBack }) => {
  const sender = users.find(user => user.id === message.senderId);
  const receiver = users.find(user => user.id === message.receiverId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Messages
        </Button>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(message.timestamp).toLocaleString()}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{sender?.name}</p>
                <p className="text-sm text-gray-500">{sender?.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">To: {receiver?.name}</p>
          </div>
          {message.read && (
            <span className="text-sm text-gray-500">Read</span>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">{message.subject}</h2>
          <div className="mt-4 text-gray-700 whitespace-pre-wrap">
            {message.content}
          </div>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center">
                  <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                  <a
                    href={attachment.url}
                    className="text-sm text-blue-600 hover:text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {attachment.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewMessage;