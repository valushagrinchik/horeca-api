import React, { useState, useEffect } from 'react'
import ChatFile from './ChatFile'
import ChatFileUpload from './ChatFileUpload'
import './ChatExample.css'

interface ChatMessage {
    id: number
    content: string
    authorId: number
    chatId: number
    isServer: boolean
    createdAt: string
    upload?: {
        id: number
        name: string
        mimetype: string
        size: number
        chatId: number
        createdAt: string
        updatedAt: string
    }
}

interface ChatExampleProps {
    chatId: number
    authToken: string
    currentUserId: number
}

const ChatExample: React.FC<ChatExampleProps> = ({ chatId, authToken, currentUserId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    // Simulate loading chat messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                // This would be your actual API call to load chat messages
                // const response = await fetch(`/chats/${chatId}/messages`, {
                //     headers: { 'Authorization': `Bearer ${authToken}` }
                // })
                // const data = await response.json()
                // setMessages(data)
                
                // Mock data for demonstration
                setMessages([
                    {
                        id: 1,
                        content: 'Hello! Here is the document you requested.',
                        authorId: 2,
                        chatId,
                        isServer: false,
                        createdAt: '2024-01-01T10:00:00Z'
                    },
                    {
                        id: 2,
                        content: '',
                        authorId: 2,
                        chatId,
                        isServer: false,
                        createdAt: '2024-01-01T10:01:00Z',
                        upload: {
                            id: 123,
                            name: 'contract.pdf',
                            mimetype: 'application/pdf',
                            size: 1024000,
                            chatId,
                            createdAt: '2024-01-01T10:01:00Z',
                            updatedAt: '2024-01-01T10:01:00Z'
                        }
                    },
                    {
                        id: 3,
                        content: 'Thanks! And here is a photo from our restaurant.',
                        authorId: currentUserId,
                        chatId,
                        isServer: false,
                        createdAt: '2024-01-01T10:02:00Z'
                    },
                    {
                        id: 4,
                        content: '',
                        authorId: currentUserId,
                        chatId,
                        isServer: false,
                        createdAt: '2024-01-01T10:03:00Z',
                        upload: {
                            id: 124,
                            name: 'restaurant-interior.jpg',
                            mimetype: 'image/jpeg',
                            size: 2048000,
                            chatId,
                            createdAt: '2024-01-01T10:03:00Z',
                            updatedAt: '2024-01-01T10:03:00Z'
                        }
                    }
                ])
            } catch (err) {
                setError('Failed to load messages')
            } finally {
                setLoading(false)
            }
        }

        loadMessages()
    }, [chatId, authToken, currentUserId])

    const handleUploadSuccess = (upload: any) => {
        // Add new message with upload
        const newMessage: ChatMessage = {
            id: Date.now(), // In real app, this would come from server
            content: '',
            authorId: currentUserId,
            chatId,
            isServer: false,
            createdAt: new Date().toISOString(),
            upload
        }
        setMessages(prev => [...prev, newMessage])
    }

    const handleUploadError = (error: string) => {
        alert(`Upload failed: ${error}`)
    }

    const handleFileError = (error: string) => {
        console.error('File error:', error)
    }

    if (loading) {
        return <div className="chat-loading">Loading chat...</div>
    }

    if (error) {
        return <div className="chat-error">Error: {error}</div>
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Chat #{chatId}</h3>
            </div>

            <div className="chat-messages">
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`message ${message.authorId === currentUserId ? 'own-message' : 'other-message'}`}
                    >
                        <div className="message-content">
                            {message.content && (
                                <div className="message-text">{message.content}</div>
                            )}
                            
                            {message.upload && (
                                <ChatFile
                                    chatId={message.chatId}
                                    uploadId={message.upload.id}
                                    fileName={message.upload.name}
                                    mimeType={message.upload.mimetype}
                                    fileSize={message.upload.size}
                                    authToken={authToken}
                                    onError={handleFileError}
                                />
                            )}
                        </div>
                        
                        <div className="message-meta">
                            <span className="message-time">
                                {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <ChatFileUpload
                    chatId={chatId}
                    authToken={authToken}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    className="compact"
                />
                
                <div className="message-input-area">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="message-input"
                    />
                    <button className="send-button">Send</button>
                </div>
            </div>
        </div>
    )
}

export default ChatExample
