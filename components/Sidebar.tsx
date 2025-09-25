
import React, { useState, useEffect } from 'react';
import { Conversation } from '../types';
import { PlusIcon, SunIcon, MoonIcon, UserIcon, DotsHorizontalIcon } from './icons';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSwitchConversation: (id: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ conversations, activeConversationId, onNewChat, onSwitchConversation, theme, onToggleTheme }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sortedConversations = [...conversations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!isSidebarOpen) {
        return (
            <button onClick={toggleSidebar} className="fixed top-4 left-4 z-20 p-2 text-white bg-gray-800 rounded-md md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        );
    }
  
  return (
    <div className={`flex flex-col bg-gray-950 text-white h-full transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} md:w-64`}>
        <div className="p-2 flex-shrink-0">
            <button 
                onClick={onNewChat}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-800"
            >
                <div className="flex items-center gap-2">
                    <UserIcon className="h-6 w-6 p-1 rounded-full bg-blue-500" />
                    <span>New Chat</span>
                </div>
                <PlusIcon className="h-5 w-5" />
            </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {sortedConversations.map(convo => (
                <a
                    key={convo.id}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        onSwitchConversation(convo.id);
                    }}
                    className={`block p-2 rounded-md truncate ${activeConversationId === convo.id ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                >
                    {convo.title}
                </a>
            ))}
        </nav>
        <div className="border-t border-gray-700 p-2 flex-shrink-0">
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800 cursor-pointer">
                <div className="flex items-center gap-3">
                    <UserIcon className="h-8 w-8 rounded-full bg-gray-600 p-1" />
                    <span className="font-medium">User</span>
                </div>
                <DotsHorizontalIcon />
            </div>
            <button 
                onClick={onToggleTheme}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-800"
            >
                {theme === 'dark' ? <SunIcon className="h-5 w-5"/> : <MoonIcon className="h-5 w-5"/>}
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
        </div>
    </div>
  );
};

export default Sidebar;
