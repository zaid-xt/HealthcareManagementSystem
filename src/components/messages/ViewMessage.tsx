import React, { useState } from 'react';
import { ArrowLeft, Clock, User, Reply, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Message } from '../../api/messagesApi';
import { User as UserType } from '../../api/usersApi';

interface ViewMessageProps {
  message: Message;
  users: UserType[];
  onBack: () => void;
  onReply: (content: string) => void;
}

const ViewMessage: React.FC<ViewMessageProps> = ({
  message,
  users,
  onBack,
  onReply
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const sender = users.find(user => user.id == message.senderId);
  const receiver = users.find(user => user.id == message.receiverId);

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          ← Back to Messages
        </Button>
        
        {/* Message Status Badge */}
        <div className="flex items-center space-x-2">
          {message.priority === 'urgent' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <AlertCircle className="h-4 w-4 mr-1" />
              URGENT
            </span>
          )}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            message.is_read 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            <CheckCircle className="h-4 w-4 mr-1" />
            {message.is_read ? 'Read' : 'Unread'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Message Subject - Large and Clear */}
        <div className="text-center border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {message.subject}
          </h1>
          
          {/* Message Meta Information */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>From: <span className="font-semibold text-gray-900">{sender?.name || 'Unknown User'}</span></span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>To: <span className="font-semibold text-gray-900">{receiver?.name || 'Unknown User'}</span></span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatDate(message.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Message Content - Large and Easy to Read */}
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Message Content:</h3>
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg">
              {message.content}
            </div>
          </div>
        </div>

        {/* Message Details */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Status: </span>
              <span className="capitalize text-gray-600">{message.status}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Priority: </span>
              <span className={`font-semibold ${
                message.priority === 'urgent' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {message.priority === 'urgent' ? '🔴 URGENT' : 'Normal'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Read Status: </span>
              <span className={`font-semibold ${
                message.is_read ? 'text-green-600' : 'text-blue-600'
              }`}>
                {message.is_read ? '✅ Read' : '📖 Unread'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Sent: </span>
              <span className="text-gray-600">{formatDate(message.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Reply Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reply to this message:</h3>
          
          {!isReplying ? (
            <Button
              onClick={() => setIsReplying(true)}
              leftIcon={<Reply className="h-4 w-4" />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reply to Message
            </Button>
          ) : (
            <div className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
              />
              <div className="flex space-x-3">
                <Button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  leftIcon={<Reply className="h-4 w-4" />}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Send Reply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMessage;