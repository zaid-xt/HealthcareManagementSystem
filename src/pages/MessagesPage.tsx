import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, Search, Send, User, ArrowRight, RefreshCw } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import MessageList from '../components/messages/MessageList';
import ComposeMessage from '../components/messages/ComposeMessage';
import ViewMessage from '../components/messages/ViewMessage';

import MessageNotification from '../components/messages/MessageNotification';
import { useAuth } from '../context/AuthContext';

import { Message, createMessage, getUserMessages, markMessageAsRead } from '../api/messagesApi';
import { User as UserType, getUsersByRole } from '../api/usersApi';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newMessageNotification, setNewMessageNotification] = useState<Message | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch messages and users
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setError(null);
      
      // Fetch messages for the current user
      const userMessages = await getUserMessages(user.id);
      
      // Check for new messages
      if (messages.length > 0 && userMessages.length > messages.length) {
        const newMessages = userMessages.filter(msg => 
          !messages.some(existingMsg => existingMsg.id === msg.id)
        );
        
        if (newMessages.length > 0) {
          // Show notification for new messages
          const latestNewMessage = newMessages[0];
          setNewMessageNotification(latestNewMessage);
          setShowNotification(true);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setShowNotification(false);
          }, 5000);
        }
      }
      
      setMessages(userMessages);
      
      // Fetch users for recipients list and message display
      let allUsers: UserType[] = [];
      if (user?.role === 'doctor') {
        const patients = await getUsersByRole('patient');
        const doctors = await getUsersByRole('doctor');
        allUsers = [...patients, ...doctors];
      } else if (user?.role === 'patient') {
        const doctors = await getUsersByRole('doctor');
        const patients = await getUsersByRole('patient');
        allUsers = [...doctors, ...patients];
      } else if (user?.role === 'admin') {
        // Admin can message anyone
        const allDoctors = await getUsersByRole('doctor');
        const allPatients = await getUsersByRole('patient');
        allUsers = [...allDoctors, ...allPatients];
      }
      setUsers(allUsers);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, user?.role, messages.length]);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    setLastRefresh(new Date());
    await fetchData();
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isComposing && !selectedMessage) {
        fetchData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchData, loading, isComposing, selectedMessage]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter messages based on user role and search term
  const getFilteredMessages = () => {
    // First, filter messages that belong to the current user
    let userMessages = messages.filter(message => {
      const isSender = message.senderId == user?.id; // Use == for type coercion
      const isReceiver = message.receiverId == user?.id; // Use == for type coercion
      const isForUser = isSender || isReceiver;
      
      return isForUser;
    });

    // Then apply search filter if there's a search term
    if (searchTerm.trim()) {
      userMessages = userMessages.filter(message =>
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return userMessages;
  };

  const filteredMessages = getFilteredMessages();



  // Get available recipients based on user role
  const getAvailableRecipients = () => {
    if (user?.role === 'doctor') {
      return users.filter(u => u.role === 'patient');
    } else if (user?.role === 'patient') {
      return users.filter(u => u.role === 'doctor');

    } else if (user?.role === 'admin') {
      return users;
    }
    return [];
  };


  const handleSendMessage = async (subject: string, content: string, recipientId: string, priority: 'normal' | 'urgent' = 'normal') => {
    if (!user?.id) return;
    
    try {
      const newMessage = await createMessage({
        senderId: user.id,
      receiverId: recipientId,
      subject,
      content,

        priority
      });
    

      // Add the new message to the list and refresh to get updated data
    setMessages(prev => [newMessage, ...prev]);
    setIsComposing(false);

      
      // Show success message
      console.log('✅ Message sent successfully!');
      
      // Auto-refresh after sending to ensure consistency
      setTimeout(() => {
        fetchData();
      }, 1000);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleMessageClick = async (message: Message) => {
    // Mark message as read if the current user is the receiver

    if (message.receiverId === user?.id && !message.is_read) {
      try {
        await markMessageAsRead(message.id);
    setMessages(prev => prev.map(msg => 

          msg.id === message.id ? { ...msg, is_read: true, status: 'read' } : msg
      ));

      } catch (err) {
        // Handle error silently for professional appearance
      }
    }
    setSelectedMessage(message);
  };

  const handleBackFromMessage = () => {
    setSelectedMessage(null);
    // Refresh the message list to show updated read status
    fetchData();
  };

  const handleReply = async (content: string) => {
    if (selectedMessage && user) {

      try {
        const replyMessage = await createMessage({
        senderId: user.id,
        receiverId: selectedMessage.senderId,
        subject: `Re: ${selectedMessage.subject}`,
        content,

          priority: 'normal'
        });
      
      setMessages(prev => [replyMessage, ...prev]);
      setSelectedMessage(null);

        
        // Auto-refresh after replying
        setTimeout(() => {
          fetchData();
        }, 1000);
        
      } catch (err) {
        setError('Failed to send reply. Please try again.');
      }
    }
  };

  // Handle notification actions
  const handleNotificationClose = () => {
    setShowNotification(false);
    setNewMessageNotification(null);
  };

  const handleNotificationView = () => {
    if (newMessageNotification) {
      setSelectedMessage(newMessageNotification);
      setShowNotification(false);
      setNewMessageNotification(null);
    }
  };

  // Render empty state with communication flow
  const renderEmptyState = () => {
    const recipientCount = getAvailableRecipients().length;
    
    return (
      <div className="p-8 text-center">
        <div className="mb-6">
          <MessageSquare className="mx-auto h-16 w-16 text-gray-300" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchTerm ? 'No messages found' : 'No messages yet'}
        </h3>
        
        {!searchTerm && (
          <>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              {user?.role === 'patient' 
                ? "You haven't sent or received any messages yet. Start a conversation with your doctor to get medical advice or ask questions."
                : user?.role === 'doctor'
                ? "You haven't received any patient messages yet. Patients can send you questions about their health or treatment."
                : "No messages in the system yet. Users can start conversations based on their roles."
              }
            </p>

            {/* Simple Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                {user?.role === 'patient' 
                  ? "• Send messages to your doctor for medical advice"
                  : user?.role === 'doctor'
                  ? "• Patients can send you health questions"
                  : "• Users can message each other based on their roles"
                }
              </p>
            </div>

            {/* Available Recipients Info */}
            {recipientCount > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  {user?.role === 'patient' 
                    ? `You can message ${recipientCount} doctor${recipientCount > 1 ? 's' : ''}`
                    : user?.role === 'doctor'
                    ? `You can receive messages from ${recipientCount} patient${recipientCount > 1 ? 's' : ''}`
                    : `You can message ${recipientCount} user${recipientCount > 1 ? 's' : ''}`
                  }
                </p>
              </div>
            )}
          </>
        )}

        {!searchTerm && (
          <Button
            onClick={() => setIsComposing(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send Your First Message
          </Button>
        )}
      </div>
    );
  };

  const renderContent = () => {

    if (loading) {
      return (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <MessageSquare className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Error Loading Messages</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      );
    }

    if (isComposing) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Compose Message</h2>
          <ComposeMessage
            recipients={getAvailableRecipients()}
            onSend={handleSendMessage}
            onCancel={() => setIsComposing(false)}
          />
        </div>
      );
    }

    if (selectedMessage) {
      return (
        <ViewMessage
          message={selectedMessage}
          users={users}
          onBack={handleBackFromMessage}
          onReply={handleReply}
        />
      );
    }

    return (
      <>
        {/* Simple Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              leftIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />}
              variant="outline"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {filteredMessages.length > 0 ? (
            <MessageList
              messages={filteredMessages}
              users={users}
              onMessageClick={handleMessageClick}
            />
          ) : (
            renderEmptyState()
          )}
        </div>
        
        {/* Simple Last Update Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      
      {/* Message Notification */}
      {newMessageNotification && (
        <MessageNotification
          message={newMessageNotification}
          users={users}
          onClose={handleNotificationClose}
          onView={handleNotificationView}
          isVisible={showNotification}
        />
      )}
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>

                {messages.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {!selectedMessage && !isComposing && (
                <Button
                  onClick={() => setIsComposing(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  New Message
                </Button>
              )}
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};


export default MessagesPage;