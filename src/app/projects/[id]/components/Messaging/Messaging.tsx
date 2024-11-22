import React, { useState, useEffect } from 'react';
import getSupabaseClient from '@/lib/supabaseClient/supabase';
import ChatArea from './ChatArea/ChatArea';
import styles from './Messaging.module.css';
import { RealtimeChannel } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  timestamp: string;
  users: {
    email: string | '';
  };
}

interface ProjectMessagingProps {
  projectId: string;
  currentUser: User;
}

const ProjectMessaging: React.FC<ProjectMessagingProps> = ({ projectId, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Fetch initial messages
    fetchMessages();
  
    const channel: RealtimeChannel = supabase.channel(`messages-project-${projectId}`);
  
    // Handle real-time INSERT
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      async (payload) => {
        console.log('Insert payload received:', payload);
        const { data, error } = await supabase
          .from('messages')
          .select('*, users(email)')
          .eq('id', payload.new.id);
    
        if (error) {
          console.error('Error fetching new message:', error); // Log or handle the error
          return;
        }
    
        if (data) {
          setMessages((currentMessages) =>
            [...currentMessages, ...data].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
          );
        }
      }
    );
    
  
    // Handle real-time UPDATE
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      async (payload) => {
        console.log('Update payload received:', payload);
        const { data, error } = await supabase
          .from('messages')
          .select('*, users(email)')
          .eq('id', payload.new.id);

              
        if (error) {
          console.error('Error fetching new message:', error); // Log or handle the error
          return;
        }
  
        if (data) {
          setMessages((currentMessages) =>
            currentMessages
              .map((message) => (message.id === payload.new.id ? data[0] : message))
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          );
        }
      }
    );
  
    // Handle real-time DELETE
    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        console.log('Delete payload received:', payload);
        setMessages((currentMessages) =>
          currentMessages.filter((message) => message.id !== payload.old.id)
        );
      }
    );
  
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to real-time updates for project:', projectId);
      } else {
        console.error('Subscription failed:', status);
      }
    });
  
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
  
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, users(email)')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: true });
  
    if (data) {
      setMessages(data as Message[]);
    }
  };
  

  return (
    <div className={styles.messagingContainer}>
      <ChatArea
        messages={messages}
        chatTitle="Project Chat"
        projectId={projectId}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ProjectMessaging;
