import React from 'react';
import DataCard from './DataCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import type { CardConfig, SheetEntry } from '../../types/admin';

interface UserInfoDisplayProps {
  username: string;
  cardConfigs: CardConfig[] | null;
  globalDate: string;
  isLoading: boolean;
  error: string | null;
  sheetDataCache: Record<string, SheetEntry[]>;
  setSheetDataCache: (updater: (prevCache: Record<string, SheetEntry[]>) => Record<string, SheetEntry[]>) => void;
}

const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({ 
  username, 
  cardConfigs, 
  globalDate, 
  isLoading, 
  error,
  sheetDataCache,
  setSheetDataCache
}) => {
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-slate-500">กำลังโหลดการตั้งค่าสำหรับ {username}...</p>
        </div>
      );
    }
  
    if (error) {
      return <ErrorDisplay title="เกิดข้อผิดพลาด" message={`ไม่สามารถโหลดการตั้งค่า: ${error}`} />;
    }
  
    if (!cardConfigs || cardConfigs.length === 0) {
      return <p className="text-slate-500 text-center col-span-full py-10">ผู้ใช้นี้ยังไม่มีการตั้งค่าการ์ด หรือไม่พบการตั้งค่า</p>;
    }

    return (
      <div id="app-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardConfigs.map((config, index) => (
          <DataCard 
            key={`${config.sheetId}-${config.sheetName}-${index}`} // Ensure unique key
            config={config} 
            currentDate={globalDate}
            cache={sheetDataCache}
            setCache={setSheetDataCache}
          />
        ))}
      </div>
    );
  };

  return (
    <div id="user-info">
      <h3 className="text-2xl font-bold text-slate-800 mb-4" id="current-user-header">
        ข้อมูลของ: <span className="text-indigo-600">{username}</span>
      </h3>
      {renderContent()}
    </div>
  );
};

export default UserInfoDisplay;