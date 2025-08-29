import { useEffect, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { useNotification } from '../context/NotificationContext';
import type { Ward } from '../types';

interface UseWardUpdatesProps {
  onWardCreated: (ward: Ward) => void;
  onWardUpdated: (ward: Ward) => void;
  onWardDeleted: (wardId: string) => void;
}

export const useWardUpdates = ({ onWardCreated, onWardUpdated, onWardDeleted }: UseWardUpdatesProps) => {
  const { socket, isConnected } = useWebSocket();
  const { showNotification } = useNotification();

  const handleWardUpdate = useCallback((data: { type: string; data: any }) => {
    switch (data.type) {
      case 'created':
        onWardCreated(data.data);
        showNotification({
          type: 'success',
          title: 'Ward Added',
          message: `New ward "${data.data.name}" has been added successfully.`,
          duration: 4000
        });
        break;
      case 'updated':
        onWardUpdated(data.data);
        showNotification({
          type: 'info',
          title: 'Ward Updated',
          message: `Ward "${data.data.name}" has been updated.`,
          duration: 4000
        });
        break;
      case 'deleted':
        onWardDeleted(data.data.id);
        showNotification({
          type: 'info',
          title: 'Ward Deleted',
          message: 'A ward has been deleted.',
          duration: 4000
        });
        break;
      default:
        console.log('Unknown ward update type:', data.type);
    }
  }, [onWardCreated, onWardUpdated, onWardDeleted, showNotification]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for ward updates
    socket.on('wardUpdate', handleWardUpdate);

    return () => {
      socket.off('wardUpdate', handleWardUpdate);
    };
  }, [socket, isConnected, handleWardUpdate]);

  return { isConnected };
};
