# Chat File Components - React Implementation

This directory contains React components for handling file uploads and display in chat applications, designed to work with your NestJS backend API.

## Components

### 1. `ChatFile.tsx` - File Display Component
Renders uploaded files in chat messages with proper authentication.

**Features:**
- ✅ Secure file loading with JWT authentication
- ✅ Support for images, documents, and other file types
- ✅ Automatic file type detection and appropriate rendering
- ✅ Download functionality
- ✅ Error handling and retry mechanism
- ✅ Loading states and responsive design
- ✅ Dark mode support

**Props:**
```typescript
interface ChatFileProps {
    chatId: number        // Chat ID
    uploadId: number      // File upload ID
    fileName: string      // Original filename
    mimeType: string      // File MIME type
    fileSize?: number     // File size in bytes
    authToken: string     // JWT authentication token
    onError?: (error: string) => void
    className?: string
}
```

### 2. `ChatFileUpload.tsx` - File Upload Component
Handles file uploads to chat with drag & drop support.

**Features:**
- ✅ Drag & drop file upload
- ✅ File type validation (images, PDFs, documents)
- ✅ File size validation (5MB limit)
- ✅ Upload progress indication
- ✅ Error handling
- ✅ Multiple upload modes (full, compact, inline)

**Props:**
```typescript
interface ChatFileUploadProps {
    chatId: number
    authToken: string
    onUploadSuccess: (upload: UploadResult) => void
    onUploadError?: (error: string) => void
    disabled?: boolean
    className?: string
}
```

### 3. `ChatExample.tsx` - Complete Chat Implementation
Full chat interface demonstrating file upload and display integration.

## Usage Examples

### 1. Basic File Display (React)
```tsx
import React from 'react'
import ChatFile from './ChatFile'

const MessageWithFile: React.FC = () => {
    const authToken = localStorage.getItem('authToken')
    
    return (
        <div className="message">
            <p>Here's the document you requested:</p>
            <ChatFile
                chatId={123}
                uploadId={456}
                fileName="contract.pdf"
                mimeType="application/pdf"
                fileSize={1024000}
                authToken={authToken}
                onError={(error) => console.error('File load error:', error)}
            />
        </div>
    )
}
```

### 2. File Upload with State Management (React)
```tsx
import React, { useState } from 'react'
import ChatFileUpload from './ChatFileUpload'

interface Message {
    id: number
    content: string
    upload?: any
    timestamp: Date
}

const ChatWithUpload: React.FC<{ chatId: number }> = ({ chatId }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [uploading, setUploading] = useState(false)
    const authToken = localStorage.getItem('authToken')

    const handleUploadSuccess = (upload: any) => {
        const newMessage: Message = {
            id: Date.now(),
            content: '',
            upload,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newMessage])
        setUploading(false)
    }

    const handleUploadError = (error: string) => {
        console.error('Upload failed:', error)
        alert(`Upload failed: ${error}`)
        setUploading(false)
    }

    return (
        <div className="chat-container">
            {/* Messages */}
            <div className="messages">
                {messages.map(message => (
                    <div key={message.id} className="message">
                        {message.content && <p>{message.content}</p>}
                        {message.upload && (
                            <ChatFile
                                chatId={chatId}
                                uploadId={message.upload.id}
                                fileName={message.upload.name}
                                mimeType={message.upload.mimetype}
                                fileSize={message.upload.size}
                                authToken={authToken}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Upload Area */}
            <ChatFileUpload
                chatId={chatId}
                authToken={authToken}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                disabled={uploading}
            />
        </div>
    )
}
```

### 3. React Hook for File Management
```tsx
import { useState, useCallback, useEffect } from 'react'

interface UseFileManagerOptions {
  authToken: string
  chatId: number
}

interface FileState {
  loading: boolean
  error: string | null
  files: Map<number, string> // uploadId -> blob URL
}

export const useFileManager = ({ authToken, chatId }: UseFileManagerOptions) => {
  const [state, setState] = useState<FileState>({
    loading: false,
    error: null,
    files: new Map()
  })

  const loadFile = useCallback(async (uploadId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/uploads/chat/${chatId}/${uploadId}/image`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      if (!response.ok) throw new Error('Failed to load file')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      setState(prev => ({
        ...prev,
        loading: false,
        files: new Map(prev.files).set(uploadId, url)
      }))

      return url
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load file'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [authToken, chatId])

  const getFileUrl = useCallback((uploadId: number) => {
    return state.files.get(uploadId)
  }, [state.files])

  const clearFile = useCallback((uploadId: number) => {
    const url = state.files.get(uploadId)
    if (url) {
      URL.revokeObjectURL(url)
      setState(prev => {
        const newFiles = new Map(prev.files)
        newFiles.delete(uploadId)
        return { ...prev, files: newFiles }
      })
    }
  }, [state.files])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      state.files.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  return {
    ...state,
    loadFile,
    getFileUrl,
    clearFile
  }
}

// Usage
const ChatMessage: React.FC<{ uploadId: number }> = ({ uploadId }) => {
  const { loadFile, getFileUrl, loading, error } = useFileManager({
    authToken: 'your-token',
    chatId: 123
  })

  useEffect(() => {
    loadFile(uploadId)
  }, [uploadId, loadFile])

  const fileUrl = getFileUrl(uploadId)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!fileUrl) return null

  return <img src={fileUrl} alt="Chat file" />
}
```

### 4. Complete Chat Interface
```tsx
import React from 'react'
import ChatExample from './ChatExample'

const App: React.FC = () => {
    const authToken = localStorage.getItem('authToken')
    const currentUserId = parseInt(localStorage.getItem('userId') || '0')

    return (
        <div className="app">
            <ChatExample
                chatId={123}
                authToken={authToken}
                currentUserId={currentUserId}
            />
        </div>
    )
}

export default App
```

## API Integration

The components are designed to work with your NestJS backend endpoints:

### Upload File
```
POST /uploads/chat/{chatId}
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: FormData with 'file' field
```

### Get File
```
GET /uploads/chat/{chatId}/{uploadId}/image
Authorization: Bearer {token}

Returns: File stream with appropriate headers
```

## Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
- **Text**: Plain text, CSV
- **Size Limit**: 5MB per file

## Styling

Each component comes with comprehensive CSS:

- **Responsive design** - Works on mobile and desktop
- **Dark mode support** - Automatic dark/light theme detection
- **Modern UI** - Clean, professional appearance
- **Animations** - Smooth transitions and hover effects
- **Accessibility** - Proper focus states and keyboard navigation

## Installation

1. Copy the component files to your React project
2. Install dependencies (if not already installed):
   ```bash
   npm install react @types/react
   ```
3. Import and use the components in your chat application

## Customization

### Styling
- Modify the CSS files to match your design system
- Use CSS custom properties for easy theming
- Add your own class names via the `className` prop

### File Types
- Update `allowedTypes` array in `ChatFileUpload.tsx`
- Modify `getFileIcon()` function for custom file type icons
- Adjust file size limits as needed

### Authentication
- Components expect JWT tokens in Authorization header
- Modify fetch requests if using different auth methods
- Add token refresh logic if needed

## Security Features

- ✅ **Authentication Required** - All file operations require valid JWT
- ✅ **Chat Access Control** - Users can only access files from their chats
- ✅ **File Type Validation** - Only allowed file types can be uploaded
- ✅ **Size Limits** - Prevents large file uploads
- ✅ **Secure URLs** - File URLs require authentication

## Browser Compatibility

- Modern browsers with ES2018+ support
- File API and Fetch API required
- Drag & Drop API for upload functionality

## Performance Considerations

- Files are loaded on-demand when displayed
- Blob URLs are properly cleaned up to prevent memory leaks
- Images are automatically resized for chat display
- Caching headers improve repeat access performance

## Error Handling

- Network errors are caught and displayed to users
- Invalid file types show clear validation messages
- Upload failures include retry functionality
- Missing files show appropriate error states

This implementation provides a complete, production-ready solution for file handling in chat applications with your NestJS backend.
