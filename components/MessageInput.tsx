
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);
  
  return (
    <div className="w-full pt-2 md:pt-4">
      <div className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-4xl">
        <form onSubmit={handleSubmit} className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="flex w-full items-center p-2 rounded-2xl bg-gray-800 shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message Gemini..."
              className="m-0 w-full resize-none border-0 bg-transparent p-2 pr-10 text-white placeholder-gray-400 focus:ring-0 focus-visible:ring-0 outline-none"
              style={{maxHeight: '200px'}}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 text-white"
            >
              <SendIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
       <div className="px-3 pb-3 pt-2 text-center text-xs text-gray-500 md:px-4 md:pb-6 md:pt-3">
          Gemini may display inaccurate info, including about people, so double-check its responses.
      </div>
    </div>
  );
};

export default MessageInput;
