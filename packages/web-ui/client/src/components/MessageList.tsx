import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../store/chatStore';

interface MessageListProps {
  messages: Message[];
  currentMessage: string;
}

const cleanContent = (content: string) => {
  // Remove tool_call tags and incomplete tool syntax
  let cleaned = content
    .replace(/<tool_call>[\s\S]*$/i, '')
    .replace(/<function=[^>]*$/i, '')
    .trim();

  // If content is wrapped in markdown code block, extract it
  const markdownBlockMatch = cleaned.match(/^```markdown\n([\s\S]*?)\n```$/);
  if (markdownBlockMatch) {
    cleaned = markdownBlockMatch[1];
  }

  return cleaned;
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
                remarkPlugins={[remarkGfm]}
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
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return <thead className="bg-gray-50">{children}</thead>;
                  },
                  th({ children }) {
                    return (
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        {children}
                      </td>
                    );
                  },
                  ul({ children }) {
                    return (
                      <ul className="list-disc list-inside my-2 space-y-1">
                        {children}
                      </ul>
                    );
                  },
                  ol({ children }) {
                    return (
                      <ol className="list-decimal list-inside my-2 space-y-1">
                        {children}
                      </ol>
                    );
                  },
                  li({ children, className }) {
                    // Check if this is a task list item
                    const isTaskList = className?.includes('task-list-item');
                    return (
                      <li
                        className={isTaskList ? 'flex items-start gap-2' : ''}
                      >
                        {children}
                      </li>
                    );
                  },
                  input({ checked, ...props }) {
                    // Task list checkbox
                    return (
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled
                        className="mt-1"
                        {...props}
                      />
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600">
                        {children}
                      </blockquote>
                    );
                  },
                  h1({ children }) {
                    return (
                      <h1 className="text-2xl font-bold mt-4 mb-2">
                        {children}
                      </h1>
                    );
                  },
                  h2({ children }) {
                    return (
                      <h2 className="text-xl font-bold mt-3 mb-2">
                        {children}
                      </h2>
                    );
                  },
                  h3({ children }) {
                    return (
                      <h3 className="text-lg font-semibold mt-2 mb-1">
                        {children}
                      </h3>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline hover:no-underline ${msg.role === 'user' ? 'text-white' : 'text-blue-600'}`}
                      >
                        {children}
                      </a>
                    );
                  },
                  hr() {
                    return <hr className="my-4 border-gray-300" />;
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {cleanContent(currentMessage)}
                </ReactMarkdown>
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
