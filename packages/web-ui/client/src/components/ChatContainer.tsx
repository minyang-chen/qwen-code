import { useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ToolApproval } from './ToolApproval';
import { FileViewer } from './FileViewer';
import { Settings } from './Settings';
import { SessionSidebar } from './SessionSidebar';
import { StatusBar } from './StatusBar';
import { useChatStore, type FileAttachment } from '../store/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';

export function ChatContainer() {
  const { socket, isConnected } = useWebSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const {
    sessionId,
    messages,
    currentMessage,
    isStreaming,
    currentFile,
    isSettingsOpen,
    sessionStats,
    addMessage,
    appendToCurrentMessage,
    finalizeCurrentMessage,
    setStreaming,
    deleteMessage,
    updateMessage,
    openFile,
    closeFile,
    updateFileContent,
    openSettings,
    closeSettings,
    setSessionStats,
  } = useChatStore();

  useEffect(() => {
    if (!socket) return;

    socket.on(
      'message:chunk',
      (chunk: { type: string; data: { text?: string } }) => {
        if (chunk.type === 'text' && chunk.data.text) {
          appendToCurrentMessage(chunk.data.text);
        }
      },
    );

    socket.on('message:complete', () => {
      finalizeCurrentMessage();
      setStreaming(false);
    });

    socket.on('message:error', (error: { message: string }) => {
      console.error('Message error:', error);
      setStreaming(false);
    });

    socket.on(
      'tool:call',
      (toolCall: { name: string; args: Record<string, unknown> }) => {
        // Show tool call as a message instead of modal (server auto-executes in YOLO mode)
        addMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: `🔧 **Executing tool: ${toolCall.name}**\n\`\`\`json\n${JSON.stringify(toolCall.args, null, 2)}\n\`\`\``,
          timestamp: new Date(),
        });
      },
    );

    socket.on('tool:response', (data: { name: string; result: string }) => {
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ **Tool result: ${data.name}**\n\`\`\`\n${data.result}\n\`\`\``,
        timestamp: new Date(),
      });
    });

    socket.on('file:open', (data: { path: string; content: string }) => {
      openFile(data);
    });

    return () => {
      socket.off('message:chunk');
      socket.off('message:complete');
      socket.off('message:error');
      socket.off('tool:call');
      socket.off('tool:response');
      socket.off('file:open');
    };
  }, [
    socket,
    appendToCurrentMessage,
    finalizeCurrentMessage,
    setStreaming,
    addMessage,
    openFile,
  ]);

  const loadStats = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}/stats`, {
        credentials: 'include',
      });
      if (res.ok) {
        const stats = await res.json();
        setSessionStats(stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCompress = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}/compress`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const result = await res.json();
        alert(
          `Compression successful!\nBefore: ${result.tokensBeforeCompression} tokens\nAfter: ${result.tokensAfterCompression} tokens\nRatio: ${(result.compressionRatio * 100).toFixed(1)}%`,
        );
        loadStats();
      }
    } catch (error) {
      console.error('Compression failed:', error);
      alert('Compression failed');
    }
  };

  const handleSend = (message: string, files?: FileAttachment[]) => {
    if (!sessionId || !socket) return;

    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      files,
    });

    setStreaming(true);
    socket.emit('chat:message', { sessionId, message, files });
  };

  const handleCancel = () => {
    if (!socket) return;
    socket.emit('chat:cancel');
    setStreaming(false);
    finalizeCurrentMessage();
  };

  const handleSaveFile = (content: string) => {
    if (!currentFile || !socket) return;
    updateFileContent(content);
    socket.emit('file:save', { path: currentFile.path, content });
  };

  const handleEditMessage = (messageId: string, content: string) => {
    updateMessage(messageId, content);
  };

  const handleRegenerateMessage = (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Find the last user message before this assistant message
    const userMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((m) => m.role === 'user');

    if (userMessage && socket && sessionId) {
      // Delete messages from the assistant message onwards
      const messagesToDelete = messages.slice(messageIndex);
      messagesToDelete.forEach((m) => deleteMessage(m.id));

      // Resend the user message
      setStreaming(true);
      socket.emit('chat:message', { sessionId, message: userMessage.content });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const handleResendMessage = (messageId: string, content: string) => {
    if (!socket || !sessionId) return;

    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Update the message content
    updateMessage(messageId, content);

    // Delete all messages after this one
    const messagesToDelete = messages.slice(messageIndex + 1);
    messagesToDelete.forEach((m) => deleteMessage(m.id));

    // Resend with new content
    setStreaming(true);
    socket.emit('chat:message', { sessionId, message: content });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sessions"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Qwen Code
            </h1>
            {!isConnected && (
              <span className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Reconnecting...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadStats();
                setShowStats(!showStats);
              }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Session Stats"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>
            <button
              onClick={openSettings}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
                window.location.reload();
              }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {showStats && sessionStats && (
          <div className="max-w-5xl mx-auto mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex gap-6 text-sm">
                <span className="text-gray-700">
                  <strong>Messages:</strong> {sessionStats.messageCount}
                </span>
                <span className="text-gray-700">
                  <strong>Est. Tokens:</strong> {sessionStats.estimatedTokens}
                </span>
              </div>
              <button
                onClick={handleCompress}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Compress History
              </button>
            </div>
          </div>
        )}
      </header>

      <MessageList
        messages={messages}
        currentMessage={currentMessage}
        onEdit={handleEditMessage}
        onRegenerate={handleRegenerateMessage}
        onDelete={handleDeleteMessage}
        onResend={handleResendMessage}
      />

      <MessageInput
        onSend={handleSend}
        onCancel={handleCancel}
        disabled={isStreaming}
      />

      <StatusBar />

      <ToolApproval />

      {currentFile && (
        <FileViewer
          path={currentFile.path}
          content={currentFile.content}
          onClose={closeFile}
          onSave={handleSaveFile}
        />
      )}

      <Settings isOpen={isSettingsOpen} onClose={closeSettings} />

      <SessionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
