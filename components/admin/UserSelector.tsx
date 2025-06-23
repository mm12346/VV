
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface UserSelectorProps {
  users: string[];
  selectedUser: string | null;
  onSelectUser: (username: string) => void;
  isLoading: boolean;
  error: string | null;
  title?: string; // Optional title for the selector
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, selectedUser, onSelectUser, isLoading, error, title }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-4 h-full">
        <LoadingSpinner size="md" />
        <span className="mt-3 text-slate-400">กำลังโหลดรายชื่อ...</span>
      </div>
    );
  }

  if (error) {
    return (
        <div className="p-4">
            <ErrorDisplay title="เกิดข้อผิดพลาด" message={`ไม่สามารถโหลดรายชื่อผู้ใช้: ${error}`} small />
        </div>
    );
  }

  if (users.length === 0) {
    return (
        <div className="p-4 space-y-3">
            <h3 className="text-md font-semibold text-slate-100 px-2">{title || 'เลือกผู้ใช้งาน'}</h3>
            <p className="text-slate-400 text-center p-4">ไม่พบรายชื่อผู้ใช้งาน</p>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
        <h3 className="text-md font-semibold text-slate-100 px-2">{title || 'เลือกผู้ใช้งาน'}</h3>
        <div id="user-buttons-container" className="flex flex-col gap-2">
        {users.map(user => (
            <button
            key={user}
            onClick={() => onSelectUser(user)}
            className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-all duration-150 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-indigo-400 truncate
                        ${selectedUser === user 
                            ? 'bg-indigo-500 text-white shadow-md' 
                            : 'bg-slate-600 text-slate-100 hover:bg-slate-500 hover:text-white'
                        }`}
            aria-pressed={selectedUser === user}
            title={user} // Added title attribute for full name on hover if truncated
            >
            {user}
            </button>
        ))}
        </div>
    </div>
  );
};

export default UserSelector;
