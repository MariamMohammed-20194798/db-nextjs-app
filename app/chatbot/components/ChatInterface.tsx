'use client';
import React, { useState, useRef, useEffect } from 'react';
import { IoSend, IoReload } from 'react-icons/io5';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  documentId: string;
}

export default function ChatInterface({ documentId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset chat when document changes
  useEffect(() => {
    setMessages([
      {
        id: '0',
        content: 'How can I help you with this document?',
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  }, [documentId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          documentId,
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: '0',
        content: 'How can I help you with this document?',
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-bold text-gray-900 dark:text-white">Chat</h3>
        <button
          onClick={resetChat}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Reset conversation"
        >
          <IoReload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block text-right">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg rounded-bl-none max-w-[80%]">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                  style={{ animationDelay: '0s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ minHeight: '44px', maxHeight: '100px' }}
          />
          <button
            className={`rounded-full p-2 ${
              !inputMessage.trim() || isLoading
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <IoSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
