import React, { useState } from 'react';
import { MessageSquare, Plus, Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import MessageList from '../components/messages/MessageList';
import ComposeMessage from '../components/messages/ComposeMessage';
import { useAuth } from '../context/AuthContext';
import { Message } from '../types';
import { users } from '../utils/mockData';

// Mock messages data
const mockMessages: Message[] = [
  {
    id: 'msg1',
    senderId: 'user2', // doctor
    receiverId: 'user4', // patient
    subject: 'Follow-up Appointment Results',
    content: 'Your recent test results look good. Keep up with the prescribed medication.',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 'msg2',
    senderId: 'user4', // patient
    receiverId: 'user2', // doctor
    subject: 'Question about Medication',
    content: 'I've been experiencing some side effects from the new medication.',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true
  }
];

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [messages] = useState<Message[]>(mockMessages);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter messages based on user role
  const filteredMessages = messages.filter(message => 
    (message.senderId === user?.id || message.receiverId === user?.id) &&
    (message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
     message.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get available recipients based on user role
  const getAvailableRecipients = () => {
    if (user?.role === 'doctor') {
      return users.filter(u => u.role === 'patient');
    } else if (user?.role === 'patient') {
      return users.filter(u => u.role === 'doctor');
    }
    return [];
  };

  const handleSendMessage = (subject: string, content: string, recipientId: string) => {
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: user?.id || '',
      receiverId: recipientId,
      subject,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // In a real app, this would make an API call
    messages.push(newMessage);
    setIsComposing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              </div>
              <Button
                onClick={() => setIsComposing(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                New Message
              </Button>
            </div>

            {isComposing ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Compose Message</h2>
                <ComposeMessage
                  recipients={getAvailableRecipients()}
                  onSend={handleSendMessage}
                  onCancel={() => setIsComposing(false)}
                />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="search"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {filteredMessages.length > 0 ? (
                    <MessageList
                      messages={filteredMessages}
                      onMessageClick={(message) => {
                        // In a real app, this would mark the message as read
                        console.log('Viewing message:', message);
                      }}
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by sending a new message.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;