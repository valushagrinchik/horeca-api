import React, { useState, useRef, useCallback } from 'react'
import './ChatFileUpload.css'

interface ChatFileUploadProps {
    chatId: number
    authToken: string
    onUploadSuccess: (upload: UploadResult) => void
    onUploadError?: (error: string) => void
    disabled?: boolean
    className?: string
}

interface UploadResult {
    id: number
    name: string
    mimetype: string
    size: number
    path: string
    chatId: number
    createdAt: string
    updatedAt: string
}

const ChatFileUpload: React.FC<ChatFileUploadProps> = ({
    chatId,
    authToken,
    onUploadSuccess,
    onUploadError,
    disabled = false,
    className = ''
}) => {
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
    ]

    const maxFileSize = 5 * 1024 * 1024 // 5MB

    const validateFile = (file: File): string | null => {
        if (!allowedTypes.includes(file.type)) {
            return 'File type not allowed. Please upload images, PDFs, or documents.'
        }
        if (file.size > maxFileSize) {
            return 'File size too large. Maximum size is 5MB.'
        }
        return null
    }

    const uploadFile = useCallback(async (file: File) => {
        const validationError = validateFile(file)
        if (validationError) {
            onUploadError?.(validationError)
            return
        }

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`/uploads/chat/${chatId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Upload failed: ${response.status}`)
            }

            const result: UploadResult = await response.json()
            onUploadSuccess(result)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'
            onUploadError?.(errorMessage)
        } finally {
            setUploading(false)
        }
    }, [chatId, authToken, onUploadSuccess, onUploadError])

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files && files.length > 0) {
            uploadFile(files[0])
        }
        // Reset input value to allow selecting the same file again
        event.target.value = ''
    }, [uploadFile])

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setDragOver(true)
    }, [])

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setDragOver(false)
    }, [])

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setDragOver(false)

        const files = event.dataTransfer.files
        if (files && files.length > 0) {
            uploadFile(files[0])
        }
    }, [uploadFile])

    const handleButtonClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    return (
        <div className={`chat-file-upload ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={disabled || uploading}
            />

            <div
                className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleButtonClick}
            >
                {uploading ? (
                    <div className="upload-progress">
                        <div className="spinner"></div>
                        <span>Uploading...</span>
                    </div>
                ) : (
                    <div className="upload-content">
                        <div className="upload-icon">📎</div>
                        <div className="upload-text">
                            <p className="primary-text">Click to upload or drag and drop</p>
                            <p className="secondary-text">Images, PDFs, Documents (max 5MB)</p>
                        </div>
                    </div>
                )}
            </div>

            <button
                className="upload-button"
                onClick={handleButtonClick}
                disabled={disabled || uploading}
            >
                {uploading ? 'Uploading...' : 'Choose File'}
            </button>
        </div>
    )
}

export default ChatFileUpload
