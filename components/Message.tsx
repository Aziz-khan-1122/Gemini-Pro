
import React, { useEffect } from 'react';
import { Message, MessageRole } from '../types';
import { UserIcon, GeminiIcon } from './icons';

declare global {
    interface Window {
        marked: any;
        hljs: any;
    }
}

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const isError = message.role === MessageRole.ERROR;

  const containerClasses = isUser ? "bg-white/5" : "";
  const contentClasses = "max-w-4xl w-full mx-auto p-4 md:p-6 flex items-start gap-4";

  const icon = isUser ? (
    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
      <UserIcon className="h-5 w-5" />
    </div>
  ) : (
    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-white flex-shrink-0">
      <GeminiIcon className="h-6 w-6" />
    </div>
  );
  
  const createMarkup = (content: string) => {
    if (window.marked) {
        return { __html: window.marked.parse(content) };
    }
    return { __html: content };
  };

  useEffect(() => {
    if (window.hljs) {
        document.querySelectorAll('pre code').forEach((block) => {
            window.hljs.highlightBlock(block);
        });
    }
  }, [message.content]);

  return (
    <div className={`text-white ${containerClasses}`}>
      <div className={contentClasses}>
        {icon}
        <div className={`prose prose-invert prose-p:my-0 prose-pre:bg-gray-850 prose-pre:p-4 prose-pre:rounded-lg prose-code:text-white pt-1 message-content ${isError ? 'text-red-400' : ''}`}
             dangerouslySetInnerHTML={createMarkup(message.content)}
        >
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
