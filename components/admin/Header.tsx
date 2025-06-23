import React from 'react';

interface AdminHeaderProps {
  currentGlobalDate: string;
  onGlobalDateChange: (date: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ currentGlobalDate, onGlobalDateChange, onToggleSidebar, isSidebarOpen }) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onGlobalDateChange(event.target.value);
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200"> {/* z-index lower than sidebar */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8"> {/* Changed to max-w-full for header button alignment */}
        <div className="py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-label={isSidebarOpen ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <div className="flex items-center space-x-2">
                 <svg 
                    className="w-7 h-7 text-indigo-600 hidden sm:block" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor"
                    aria-hidden="true"
                 >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Admin Dashboard</h1>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-full xs:w-auto sm:w-auto" style={{maxWidth: '200px'}}>
            <label htmlFor="globalCheckDate" className="sr-only">Global Check Date</label>
            <input 
              type="date" 
              id="globalCheckDate" 
              value={currentGlobalDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition shadow-sm text-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;