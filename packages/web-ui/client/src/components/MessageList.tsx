import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../store/chatStore';

interface MessageListProps {
  messages: Message[];
  currentMessage: string;
}

const cleanContent = (content: string) => {
  // Remove tool_call tags and incomplete tool syntax
  return content
    .replace(/<tool_call>[\s\S]*$/i, '')
    .replace(/<function=[^>]*$/i, '')
    .trim();
};

const hasToolExecution = (content: string) => {
  return /<tool_call>|<function=/.test(content);
};

export function MessageList({ messages, currentMessage }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentMessage]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-2xl px-6 py-4 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg my-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={`${className} px-1.5 py-0.5 rounded ${msg.role === 'user' ? 'bg-white/20' : 'bg-gray-100'}`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {cleanContent(msg.content)}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {currentMessage && (
          <div className="flex justify-start">
            <div className="max-w-3xl rounded-2xl px-6 py-4 bg-white text-gray-900 border border-gray-200 shadow-md">
              {cleanContent(currentMessage) && (
                <ReactMarkdown>{cleanContent(currentMessage)}</ReactMarkdown>
              )}
              {hasToolExecution(currentMessage) && (
                <div className="text-sm text-gray-500 italic mt-2">
                  Working...
                </div>
              )}
              <span className="inline-block w-2 h-4 ml-1 bg-blue-600 animate-pulse" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
