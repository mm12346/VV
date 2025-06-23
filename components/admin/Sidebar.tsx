
import React from 'react';
import UserSelector from './UserSelector';
import LoadingSpinner from './LoadingSpinner'; // Added for zone settings loading state

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  users: string[]; // Users to display in UserSelector (can be all or zone-specific)
  selectedUser: string | null;
  onSelectUser: (username: string) => void;
  isLoading: boolean; // Loading state for allAvailableUsers
  error: string | null; // Error state for allAvailableUsers
  onLogout: () => void;
  
  // Zone specific props
  allAvailableUsers: string[];
  selectedZoneUsers: string[];
  onZoneUserSelectionChange: (selectedUsers: string[]) => void;
  isZoneModeActive: boolean;
  onToggleZoneMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  users, 
  selectedUser, 
  onSelectUser, 
  isLoading, 
  error,
  onLogout,
  allAvailableUsers,
  selectedZoneUsers,
  onZoneUserSelectionChange,
  isZoneModeActive,
  onToggleZoneMode
}) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" 
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      <aside 
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-800 text-white shadow-xl
                    w-64 sm:w-72 md:w-80 lg:w-64  
                    transition-transform duration-300 ease-in-out 
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:sticky lg:shadow-none lg:bg-slate-800 
                    ${isOpen ? 'lg:w-64' : 'lg:w-0 lg:invisible lg:opacity-0 lg:p-0'}`}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">เมนูผู้ใช้งาน</h2>
            <button 
              onClick={onClose} 
              className="p-1 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 lg:hidden"
              aria-label="ปิดเมนู"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar">
            {/* Zone Specific Settings */}
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-md font-semibold text-slate-100 mb-2">ตั้งค่าเฉพาะเขต</h3>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="zone-mode-toggle" className="text-sm text-slate-300 cursor-pointer">
                  เปิดใช้งานโหมดเฉพาะเขต
                </label>
                <button
                  id="zone-mode-toggle"
                  onClick={onToggleZoneMode}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${
                    isZoneModeActive ? 'bg-indigo-600' : 'bg-slate-600'
                  }`}
                  role="switch"
                  aria-checked={isZoneModeActive}
                >
                  <span className="sr-only">เปิดใช้งานโหมดเฉพาะเขต</span>
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      isZoneModeActive ? 'translate-x-6' : 'translate-x-1' // Adjusted for better visual alignment
                    }`}
                  />
                </button>
              </div>

              {isZoneModeActive && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 no-scrollbar p-2 bg-slate-700/60 rounded-md">
                  <p className="text-xs text-slate-300 mb-1.5 px-1 font-medium">เลือกผู้ใช้งานในเขต:</p>
                  {isLoading ? (
                     <div className="flex justify-center items-center py-3">
                        <LoadingSpinner size="sm" color="border-slate-300" />
                     </div>
                  ) : error ? (
                     <p className="text-xs text-rose-300 px-1 py-2 text-center">{`ไม่สามารถโหลดรายชื่อ`}</p>
                  ) : allAvailableUsers.length > 0 ? allAvailableUsers.map(user => (
                    <label key={user} className="flex items-center space-x-2.5 p-1.5 rounded-md hover:bg-slate-600/70 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-indigo-500 bg-slate-500 border-slate-400 rounded focus:ring-indigo-400 focus:ring-offset-slate-700 focus:ring-offset-1 shrink-0"
                        checked={selectedZoneUsers.includes(user)}
                        onChange={() => {
                          const newSelected = selectedZoneUsers.includes(user)
                            ? selectedZoneUsers.filter(u => u !== user)
                            : [...selectedZoneUsers, user];
                          onZoneUserSelectionChange(newSelected);
                        }}
                        aria-label={user}
                      />
                      <span className="text-sm text-slate-200 truncate" title={user}>{user}</span>
                    </label>
                  )) : <p className="text-xs text-slate-400 px-1 py-2 text-center">ไม่พบรายชื่อผู้ใช้ให้เลือก</p>}
                </div>
              )}
            </div>

            <UserSelector 
              users={users} // This is usersForSidebar from App.tsx
              selectedUser={selectedUser}
              onSelectUser={onSelectUser}
              isLoading={isLoading} // Reflects loading of allAvailableUsers for initial list population
              error={error}
              title={`เลือกผู้ใช้งาน ${isZoneModeActive ? '(เฉพาะเขต)' : '(ทั้งหมด)'}`}
            />
          </div>

          <div className="p-4 border-t border-slate-700 space-y-3">
             <button
              onClick={onLogout}
              className="w-full flex items-center justify-start space-x-2.5 px-3 py-2.5 text-sm rounded-md transition-all duration-150 ease-in-out bg-slate-700 text-slate-100 hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-rose-500"
              aria-label="ออกจากระบบ"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              <span>ออกจากระบบ</span>
            </button>
            <p className="text-xs text-slate-400 text-center pt-2">Admin Checker v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
