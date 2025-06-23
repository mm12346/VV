
import React, { useState, useEffect, useCallback } from 'react';
import { fetchSheetData } from '../../services/api';
import type { CardConfig, SheetEntry } from '../../types/admin';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

const COL_USER_IDX = 7; // As per original script, 0-indexed
const COL_NUMBER_IDX = 9; // As per original script, 0-indexed

interface DataCardProps {
  config: CardConfig;
  currentDate: string;
  cache: Record<string, SheetEntry[]>;
  setCache: (updater: (prevCache: Record<string, SheetEntry[]>) => Record<string, SheetEntry[]>) => void;
}

const DataCard: React.FC<DataCardProps> = ({ config, currentDate, cache, setCache }) => {
  const [entries, setEntries] = useState<SheetEntry[]>([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!config.sheetId || !config.sheetName) {
      setError("กรุณาตั้งค่า Sheet ID และ Sheet Name");
      setEntries([]); // Ensure empty on config error
      setIsLoading(false);
      return;
    }
    if (!currentDate) {
      setError(null); // Clear error if no date selected
      setEntries([]); // Ensure empty if no date
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setEntries([]); // Clear previous entries before fetching new ones

    try {
      const data = await fetchSheetData(config.sheetId, config.sheetName, currentDate, cache, setCache);
      setEntries(data); // data itself can be an empty array from fetchSheetData
    } catch (err) {
      console.error(`Error fetching data for ${config.title}:`, err);
      setError(err instanceof Error ? err.message : String(err));
      setEntries([]); // Ensure entries is empty on API error
    } finally {
      setIsLoading(false);
    }
  }, [config, currentDate, cache, setCache]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderCardContent = () => {
    if (isLoading) {
      return <LoadingSpinner size="sm" />; // Will be centered by parent
    }
    if (error) {
      return <ErrorDisplay title="เกิดข้อผิดพลาดในการโหลดข้อมูล" message={error} small={true}/>;
    }
    if (!currentDate) {
        return <p className="text-slate-500 p-4 text-center">กรุณาเลือกวันที่</p>;
    }

    // At this point: isLoading is false, error is null, currentDate is present.
    // entries is guaranteed to be SheetEntry[] (never null).
    
    const dateDisplay = new Date(currentDate + 'T00:00:00').toLocaleDateString('th-TH', { dateStyle: 'long' });
    
    if (entries.length === 0) {
      const statusBlock = (
        <div className="flex flex-col items-center justify-center text-center text-slate-500 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mb-2 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
          <p className="font-semibold text-slate-700">ไม่พบข้อมูลสำหรับวันที่ {dateDisplay}</p>
        </div>
      );
      return <div className="w-full">{statusBlock}</div>;
    } else {
        const uniqueNumbers = new Set(entries.map(entry => entry[COL_NUMBER_IDX]).filter(Boolean));
        const uniqueUsers = new Set(entries.map(entry => entry[COL_USER_IDX]).filter(Boolean));
        const targetCount = config.targetCount || 0;
        let statusBlock, detailsBlock;

        if (uniqueNumbers.size >= targetCount) {
            statusBlock = (
            <div className="bg-teal-100/50 border border-teal-200/80 text-teal-800 p-4 rounded-xl flex items-center space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-teal-500"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                </div>
                <div className="min-w-0">
                <p className="font-bold text-md sm:text-lg">ครบแล้ว</p>
                <p className="text-xs sm:text-sm break-words">ตรวจครบ {uniqueNumbers.size} หมายเลข</p>
                </div>
            </div>
            );
        } else {
            const needed = targetCount - uniqueNumbers.size;
            statusBlock = (
            <div className="bg-amber-100/50 border border-amber-200/80 text-amber-800 p-4 rounded-xl flex items-center space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                </div>
                <div className="min-w-0">
                <p className="font-bold text-md sm:text-lg">ยังไม่ครบ ({uniqueNumbers.size}/{targetCount})</p>
                <p className="text-xs sm:text-sm break-words">ขาดอีก {needed} หมายเลข</p>
                </div>
            </div>
            );
        }
        detailsBlock = (
            <div className="space-y-3 pt-4 text-xs sm:text-sm mt-4 border-t border-slate-200 text-left"> {/* Ensure text-left for details */}
            <div className="flex items-start space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-slate-400 mt-0.5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.995 9.995 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" /></svg>
                <div>
                <p className="font-semibold text-slate-600">ผู้ลงข้อมูล:</p>
                <p className="text-slate-800 break-words">{uniqueUsers.size > 0 ? [...uniqueUsers].join(', ') : 'ไม่พบ'}</p>
                </div>
            </div>
            <div className="flex items-start space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-slate-400 mt-0.5"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5z" clipRule="evenodd" /></svg>
                <div>
                <p className="font-semibold text-slate-600">หมายเลขที่ตรวจแล้ว ({uniqueNumbers.size} หมายเลข):</p>
                <p className="text-slate-800 break-words">{uniqueNumbers.size > 0 ? [...uniqueNumbers].join(', ') : 'ไม่พบ'}</p>
                </div>
            </div>
            </div>
        );
        return <div className="w-full">{statusBlock}{detailsBlock}</div>;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl p-4 md:p-6 transition-all duration-300 hover:shadow-indigo-500/10">
      <div className="text-center mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate" title={config.title}>
          {config.title}
        </h1>
      </div>
      <div 
        className="min-h-[150px] flex flex-col justify-center items-center transition-all duration-200 ease-in-out" 
        // items-center will horizontally center children like LoadingSpinner or w-full blocks if they are narrower than this div.
        // justify-center will vertically center children if their combined height is less than min-h-[150px].
      >
        {renderCardContent()}
      </div>
    </div>
  );
};

export default DataCard;
