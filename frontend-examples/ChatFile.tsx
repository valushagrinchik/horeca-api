import React, { useState, useEffect, useCallback } from 'react'
import './ChatFile.css'

interface ChatFileProps {
    chatId: number
    uploadId: number
    fileName: string
    mimeType: string
    fileSize?: number
    authToken: string
    onError?: (error: string) => void
    className?: string
}

interface FileDisplayProps {
    fileUrl: string
    fileName: string
    mimeType: string
    fileSize?: number
    onDownload: () => void
}

const ChatFile: React.FC<ChatFileProps> = ({
    chatId,
    uploadId,
    fileName,
    mimeType,
    fileSize,
    authToken,
    onError,
    className = ''
}) => {
    const [fileUrl, setFileUrl] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    const loadFile = useCallback(async () => {
        try {
            setLoading(true)
            setError('')

            const response = await fetch(`/api/uploads/chat/${chatId}/upload/${uploadId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': '*/*'
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to load file: ${response.status} ${response.statusText}`)
            }

            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            setFileUrl(url)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load file'
            setError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [chatId, uploadId, authToken, onError])

    useEffect(() => {
        loadFile()

        // Cleanup blob URL on unmount
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl)
            }
        }
    }, [loadFile])

    const handleDownload = useCallback(() => {
        if (fileUrl) {
            const link = document.createElement('a')
            link.href = fileUrl
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }, [fileUrl, fileName])

    const handleRetry = useCallback(() => {
        loadFile()
    }, [loadFile])

    if (loading) {
        return (
            <div className={`chat-file loading ${className}`}>
                <div className="loading-spinner"></div>
                <span>Loading {fileName}...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`chat-file error ${className}`}>
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                    <p className="error-message">Failed to load {fileName}</p>
                    <button onClick={handleRetry} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`chat-file ${className}`}>
            <FileDisplay
                fileUrl={fileUrl}
                fileName={fileName}
                mimeType={mimeType}
                fileSize={fileSize}
                onDownload={handleDownload}
            />
        </div>
    )
}

const FileDisplay: React.FC<FileDisplayProps> = ({
    fileUrl,
    fileName,
    mimeType,
    fileSize,
    onDownload
}) => {
    const [imageError, setImageError] = useState(false)

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return ''
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
    }

    const getFileIcon = (mimeType: string): string => {
        if (mimeType.includes('pdf')) return '📄'
        if (mimeType.includes('word')) return '📝'
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
        if (mimeType.includes('text')) return '📃'
        if (mimeType.includes('image')) return '🖼️'
        return '📎'
    }

    // Handle images
    if (mimeType.startsWith('image/') && !imageError) {
        return (
            <div className="chat-image">
                <img
                    src={fileUrl}
                    alt={fileName}
                    onError={() => setImageError(true)}
                    onClick={() => window.open(fileUrl, '_blank')}
                />
                <div className="image-overlay">
                    <div className="image-info">
                        <span className="file-name">{fileName}</span>
                        {fileSize && <span className="file-size">{formatFileSize(fileSize)}</span>}
                    </div>
                    <button onClick={onDownload} className="download-button" title="Download">
                        ⬇️
                    </button>
                </div>
            </div>
        )
    }

    // Handle documents and other files
    return (
        <div className="chat-document">
            <div className="file-icon">{getFileIcon(mimeType)}</div>
            <div className="file-info">
                <div className="file-details">
                    <p className="file-name" title={fileName}>{fileName}</p>
                    <div className="file-meta">
                        <span className="file-type">{mimeType.split('/')[1]?.toUpperCase()}</span>
                        {fileSize && <span className="file-size">{formatFileSize(fileSize)}</span>}
                    </div>
                </div>
                <div className="file-actions">
                    <button onClick={() => window.open(fileUrl, '_blank')} className="view-button">
                        View
                    </button>
                    <button onClick={onDownload} className="download-button">
                        Download
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatFile

// Hook for managing multiple chat files
export const useChatFiles = (authToken: string) => {
    const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set())
    const [fileErrors, setFileErrors] = useState<Map<string, string>>(new Map())

    const handleFileError = useCallback((fileKey: string, error: string) => {
        setFileErrors(prev => new Map(prev).set(fileKey, error))
    }, [])

    const clearFileError = useCallback((fileKey: string) => {
        setFileErrors(prev => {
            const newMap = new Map(prev)
            newMap.delete(fileKey)
            return newMap
        })
    }, [])

    return {
        loadingFiles,
        fileErrors,
        handleFileError,
        clearFileError
    }
}
