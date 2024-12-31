'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatArea.module.css';
import {
    sendDirectMessage,
    editDirectMessage,
    deleteDirectMessage,
} from '@/services/directMessageService';
import { User } from '@/utils/interfaces';
import { createClient } from '@supabase/supabase-js';
import ChatHeader from './ChatHeader/ChatHeader';
import MessageInput from './DirectMessageInput/DirectMessageInput';
import EditMessageForm from './EditMessageForm/EditMessageForm';
import useDirectMessages from '@/hooks/individualProjects/messages/sidebar/useDirectMessage';
import useDirectMessageSubscription from '@/hooks/individualProjects/messages/chatArea/useDirectMessageSubscription';
import DirectMessageList from './DirectMessageList/DirectMessageList';
import useReceiverInfo from '@/hooks/individualProjects/messages/useReceiverInfo';

interface DirectMessageChatAreaProps {
    recipient_id: string;
    projectId: string;
    currentUser: User;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const DirectMessageChatArea: React.FC<DirectMessageChatAreaProps> = ({
    recipient_id,
    projectId,
    currentUser,
}) => {
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState<string>('');
    const [newMessagesCount, setNewMessagesCount] = useState<number>(0);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const hasInitiallyScrolled = useRef<boolean>(false);
    const [userMap, setUserMap] = useState<{ [key: string]: User }>({});
    const [firstLoad, setFirstLoad] = useState<boolean>(true);
     const userMapRef = useRef(userMap);

    useEffect(() => {
        userMapRef.current = userMap
    },[userMap])

    const {
        directMessages: messages,
        isLoading,
        error,
        setDirectMessages: setMessages,
    } = useDirectMessages(currentUser.id, recipient_id, userMapRef.current, setUserMap);

    const { receiver } = useReceiverInfo(recipient_id);

    useEffect(() => {
        setFirstLoad(true)
        hasInitiallyScrolled.current = false;
    }, [recipient_id]);


    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior,
            });
            setNewMessagesCount(0);
        }
    };

    const isUserAtBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
                messagesContainerRef.current;
            const threshold = 20;
            return Math.abs(scrollHeight - scrollTop - clientHeight) <= threshold;
        }
        return false;
    };


    useDirectMessageSubscription({
        supabase,
        initialLoadCompleted: !isLoading,
        currentUserId: currentUser.id,
        recipient_id: recipient_id,
        userMap,
        setUserMap,
        setMessages,
        scrollToBottom,
        isUserAtBottom,
        setNewMessagesCount,
    });



    const filteredMessages = messages
        .filter(
            (msg) =>
                (msg.sender_id === currentUser.id && msg.recipient_id === recipient_id) ||
                (msg.sender_id === recipient_id && msg.recipient_id === currentUser.id),
        )
        .sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );


    useEffect(() => {
        if (!isLoading && messages.length > 0) {
             if (firstLoad) {
                 scrollToBottom('auto');
                 hasInitiallyScrolled.current = true;
                 setFirstLoad(false);
             }
             else if (!hasInitiallyScrolled.current && isUserAtBottom()) {
                scrollToBottom('auto');
                 hasInitiallyScrolled.current = true;
            }

        }
    }, [isLoading, messages, recipient_id, firstLoad]);



    const handleSendMessage = async (message: string) => {
        const wasAtBottom = isUserAtBottom();
        try {
            await sendDirectMessage(projectId, recipient_id, message, currentUser.id);
            if (wasAtBottom) {
                setTimeout(() => {
                  scrollToBottom('smooth')
                },0)
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };
    const handleEditMessage = (messageId: string) => {
        setEditingMessageId(messageId);
        const message = messages.find((msg) => msg.id === messageId);
        if (message) {
            setEditedContent(message.content);
        }
    };

    const handleEditConfirm = async (messageId: string, editedContent: string) => {
        if (editedContent.trim()) {
            await editDirectMessage(messageId, editedContent);
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === messageId ? { ...msg, content: editedContent, edited: true } : msg
                )
            );
            setEditingMessageId(null);
            setEditedContent('');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        await deleteDirectMessage(messageId);
        setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.id !== messageId),
        );
    };


    return (
        <div className={styles.chatArea}>
            <ChatHeader
                chatTitle={
                    receiver ? `DM: ${receiver.username || receiver.email}` : 'Loading...'
                }
            />
            <div className={styles.chatMessages} ref={messagesContainerRef}>
                {isLoading && <p className={styles.loading}>Loading messages...</p>}
                {error && <p className={styles.error}>Error: {error}</p>}
                {!isLoading && !error && (
                    <DirectMessageList
                        messages={filteredMessages}
                        currentUser={currentUser}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                        userMap={userMap}
                    />
                )}
            </div>
            {newMessagesCount > 0 && !isUserAtBottom() && (
                <div
                    className={styles.newMessagesIndicator}
                    onClick={() => {
                        scrollToBottom('smooth');
                        setNewMessagesCount(0);
                    }}
                    role="button"
                    aria-label="There are new messages"
                    tabIndex={0}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            scrollToBottom('smooth');
                            setNewMessagesCount(0);
                        }
                    }}
                >
                    <span style={{ marginRight: '8px' }}>⬆</span>
                    There are new messages!
                </div>
            )}
            {editingMessageId ? (
                <EditMessageForm
                    messageId={editingMessageId}
                    currentContent={editedContent}
                    onEditConfirm={handleEditConfirm}
                    onCancel={() => setEditingMessageId(null)}
                />
            ) : (
                <MessageInput onSend={handleSendMessage} />
            )}
        </div>
    );
};

export default DirectMessageChatArea;