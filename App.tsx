
import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from './components/admin/Header';
import Sidebar from './components/admin/Sidebar';
import UserInfoDisplay from './components/admin/UserInfoDisplay';
import LoadingSpinner from './components/admin/LoadingSpinner';
import ErrorDisplay from './components/admin/ErrorDisplay';
import LoginPage from './components/admin/LoginPage';
import { fetchAllUsers, fetchUserSettings } from './services/api';
import type { CardConfig } from './types/admin';

const ADMIN_DASHBOARD_ZONE_USERS_KEY = 'adminDashboardZoneUsers';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [globalDate, setGlobalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [allAvailableUsers, setAllAvailableUsers] = useState<string[]>([]); // All users fetched from API
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const [cardConfigs, setCardConfigs] = useState<CardConfig[] | null>(null);
  
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  
  const [isLoadingConfigs, setIsLoadingConfigs] = useState<boolean>(false);
  const [configsError, setConfigsError] = useState<string | null>(null);

  const [sheetDataCache, setSheetDataCache] = useState<Record<string, any>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Zone Specific State
  const [selectedZoneUsers, setSelectedZoneUsers] = useState<string[]>(() => {
    try {
      const storedZoneUsers = localStorage.getItem(ADMIN_DASHBOARD_ZONE_USERS_KEY);
      return storedZoneUsers ? JSON.parse(storedZoneUsers) : [];
    } catch (e) {
      console.error("Failed to parse zone users from localStorage", e);
      return [];
    }
  });
  const [isZoneModeActive, setIsZoneModeActive] = useState<boolean>(false);

  // Save selectedZoneUsers to localStorage
  useEffect(() => {
    localStorage.setItem(ADMIN_DASHBOARD_ZONE_USERS_KEY, JSON.stringify(selectedZoneUsers));
  }, [selectedZoneUsers]);

  // Fetch all users
  useEffect(() => {
    if (isAuthenticated) {
      const loadUsers = async () => {
        setIsLoadingUsers(true);
        setUsersError(null);
        try {
          const fetchedUsers = await fetchAllUsers();
          setAllAvailableUsers(fetchedUsers);
        } catch (error) {
          console.error("Failed to load users:", error);
          setUsersError(error instanceof Error ? error.message : String(error));
        } finally {
          setIsLoadingUsers(false);
        }
      };
      loadUsers();
    } else {
      setAllAvailableUsers([]);
      setSelectedUser(null);
      setCardConfigs(null);
      setIsLoadingUsers(false);
      setUsersError(null);
      setSheetDataCache({});
      setIsSidebarOpen(false);
      // setIsZoneModeActive(false); // Optional: reset zone mode on logout, or keep it persistent
    }
  }, [isAuthenticated]);

  // Load card configs for selected user
  useEffect(() => {
    if (selectedUser && isAuthenticated) {
      const loadConfigs = async () => {
        setIsLoadingConfigs(true);
        setConfigsError(null);
        setCardConfigs(null); 
        try {
          const fetchedConfigs = await fetchUserSettings(selectedUser);
          setCardConfigs(fetchedConfigs);
        } catch (error) {
          console.error(`Failed to load settings for ${selectedUser}:`, error);
          setConfigsError(error instanceof Error ? error.message : String(error));
        } finally {
          setIsLoadingConfigs(false);
        }
      };
      loadConfigs();
    } else {
      setCardConfigs(null); 
    }
  }, [selectedUser, isAuthenticated]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const handleUserSelect = useCallback((username: string) => {
    setSelectedUser(prevUser => {
      const newUser = prevUser === username ? null : username;
      if (newUser !== null) { 
        if (window.innerWidth < 1024) { 
           setIsSidebarOpen(false);
        }
      }
      return newUser;
    });
  }, []);
  
  const handleDateChange = useCallback((date: string) => {
    setGlobalDate(date);
    setSheetDataCache({}); 
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Zone Mode Handlers
  const handleToggleZoneMode = useCallback(() => {
    setIsZoneModeActive(prev => !prev);
    setSelectedUser(null); // Clear selected user when toggling mode
  }, []);

  const handleZoneUserSelectionChange = useCallback((newZoneUsers: string[]) => {
    setSelectedZoneUsers(newZoneUsers);
    if (isZoneModeActive && selectedUser && !newZoneUsers.includes(selectedUser)) {
      setSelectedUser(null); // Clear selected user if no longer in active zone selection
    }
  }, [isZoneModeActive, selectedUser]);

  // Determine users to display in sidebar based on zone mode
  const usersForSidebar = isZoneModeActive 
    ? selectedZoneUsers.filter(user => allAvailableUsers.includes(user)) // Ensure selected zone users are currently available
    : allAvailableUsers;


  const renderMainContent = () => {
    if (selectedUser) {
      return (
        <UserInfoDisplay
          username={selectedUser}
          cardConfigs={cardConfigs}
          globalDate={globalDate}
          isLoading={isLoadingConfigs}
          error={configsError}
          sheetDataCache={sheetDataCache}
          setSheetDataCache={setSheetDataCache}
        />
      );
    }
    if (isLoadingUsers) { // This reflects loading of allAvailableUsers
      return (
        <div className="flex flex-col items-center justify-center text-center py-10 h-full">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-500">กำลังโหลดรายชื่อผู้ใช้...</p>
        </div>
      );
    }
    if (usersError) {
      return (
        <div className="flex justify-center py-10">
           <ErrorDisplay title="เกิดข้อผิดพลาด" message={`ไม่สามารถโหลดรายชื่อผู้ใช้: ${usersError}`} className="max-w-md"/>
        </div>
      );
    }
    // usersForSidebar is used to check if there are users to select from in current mode
    if (usersForSidebar.length === 0 && !isLoadingUsers && !usersError) {
       const message = isZoneModeActive 
        ? "ไม่พบผู้ใช้งานที่เลือกไว้สำหรับเขตนี้ หรือผู้ใช้เหล่านั้นไม่พร้อมใช้งาน"
        : "ไม่พบรายชื่อผู้ใช้งานในระบบ";
      return (
        <p className="text-center text-slate-500 py-10">
          {message}
        </p>
      );
    }
    return (
      <p className="text-center text-slate-500 py-10">
        {isSidebarOpen ? 'กรุณาเลือกผู้ใช้งานจากแถบด้านข้าง' : 'คลิกปุ่มเมนู (แถบซ้ายบน) เพื่อเลือกผู้ใช้งาน'}
      </p>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 selection:bg-indigo-500 selection:text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        // Users for the UserSelector component:
        users={usersForSidebar}
        selectedUser={selectedUser}
        onSelectUser={handleUserSelect}
        // For the zone selection UI:
        allAvailableUsers={allAvailableUsers}
        selectedZoneUsers={selectedZoneUsers}
        onZoneUserSelectionChange={handleZoneUserSelectionChange}
        isZoneModeActive={isZoneModeActive}
        onToggleZoneMode={handleToggleZoneMode}
        // Loading/error state for the allAvailableUsers list
        isLoading={isLoadingUsers}
        error={usersError}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          currentGlobalDate={globalDate} 
          onGlobalDateChange={handleDateChange}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 no-scrollbar">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
