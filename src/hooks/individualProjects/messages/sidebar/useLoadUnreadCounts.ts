
import { useEffect } from 'react';
import { fetchUnreadCounts } from '@/services/unreadCountService';

const useLoadUnreadCounts = (
  currentUserId: string,
  setUnreadCount: (channelId: string, count: number) => void
) => {
  useEffect(() => {
    const loadUnreadCounts = async () => {
      try {
        const unreadData = await fetchUnreadCounts(currentUserId);
        unreadData.forEach((item) => {
          setUnreadCount(item.channel_id, item.unread_count);
        });
      } catch (err) {
        console.error('Error fetching unread counts:', err);
      }
    };
    loadUnreadCounts();
  }, [currentUserId, setUnreadCount]);
};

export default useLoadUnreadCounts;
