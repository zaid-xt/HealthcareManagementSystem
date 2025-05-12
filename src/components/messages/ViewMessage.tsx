import React, { useState } from 'react';
import { ArrowLeft, Paperclip, Clock, User, Reply } from 'lucide-react';
import Button from '../ui/Button';
import { Message } from '../../types';
import { users } from '../../utils/mockData';

interface ViewMessageProps {
  message: Message;
  onBack: () => void;
  onReply: (content: string) => void;
}

const ViewMessage: React.FC<ViewMessageProps> = ({ message, onBack, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const sender = users.find(user => user.id === message.senderId);
  const receiver = users.find(user => user.id === message.receiverId);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(replyContent);
      setIsReplying(false);
      setReplyContent('');
    }
  };

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

        <div className="border-t pt-4">
          {!isReplying ? (
            <Button
              onClick={() => setIsReplying(true)}
              variant="outline"
              leftIcon={<Reply className="h-4 w-4" />}
            >
              Reply
            </Button>
          ) : (
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Reply
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Type your reply here..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Send Reply
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMessage;