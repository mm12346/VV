import type { CardConfig, AllUsersResponse, UserSettingsResponse, SheetDataResponse, SheetEntry, ApiResponse } from '../types/admin';

export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbnI6LiDVZsC4-1iMuV9CtMeN320QbHL6KxR9tl8CK58TAmwq8KB1rPTFwWzljMinm/exec';

// Simple in-memory cache for sheet data to avoid repeated calls for the same sheet and date.
// This cache is now managed in App.tsx and passed to components that need it.
// const sheetDataCache: Record<string, SheetEntry[]> = {};

export async function apiCall<T_ResponsePayload>(
  action: string,
  payload: Record<string, any> = {}
): Promise<T_ResponsePayload> {
  const isGet = action.startsWith('load') || action.startsWith('get') || action === 'getAllUsers' || action === 'getSheetData';
  const options: RequestInit = {
    method: isGet ? 'GET' : 'POST',
    headers: {}, // Keep empty for GET, will be set for POST if Content-Type is needed
  };

  const url = new URL(SCRIPT_URL);
  if (isGet) {
    url.searchParams.append('action', action);
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) { // Important: only append if value exists
         url.searchParams.append(key, String(value));
      }
    });
  } else {
    // For POST, Google Apps Script doGet/doPost often expect parameters in query string
    // or a specific Content-Type like 'application/x-www-form-urlencoded' or 'application/json' in the body
    // The original script uses text/plain for POST body with JSON.stringify
    options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
    options.body = JSON.stringify({ action, ...payload });
  }
  
  const res = await fetch(url.toString(), options);

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Network error: ${res.status} ${res.statusText}`, errorText);
    throw new Error(`Network error: ${res.status} ${res.statusText}. Details: ${errorText}`);
  }

  const result = await res.json();

  // Check for errors returned by the Google Apps Script itself
  // Assuming structure like { error: "message" } or { success: false, error: "message" }
  if (result.error || result.success === false) {
    console.error('API Error:', result.error || 'Unknown API error from script');
    throw new Error(result.error || 'Unknown API error from script');
  }
  
  // Assuming the actual data is nested (e.g., result.users, result.config, or just result itself if flat)
  // The specific parsing logic might depend on how your GAS script structures successful responses.
  // For example, if getAllUsers returns { users: [...] }, then result.users is the data.
  // If getSheetData returns rows directly, then result is the data.
  // The type T_ResponsePayload should match what the caller expects.
  return result as T_ResponsePayload;
}

export async function fetchAllUsers(): Promise<string[]> {
  const result = await apiCall<AllUsersResponse>('getAllUsers');
  if (result && Array.isArray(result.users)) {
    return result.users;
  }
  // Handle cases where result.users might not be in the expected format, or throw error
  console.warn('fetchAllUsers did not return the expected structure:', result);
  return []; // Or throw new Error('Invalid response structure for users');
}

export async function fetchUserSettings(username: string): Promise<CardConfig[]> {
  const result = await apiCall<UserSettingsResponse>('loadSettings', { username });
   if (result && Array.isArray(result.config)) {
    return result.config;
  }
  console.warn(`fetchUserSettings for ${username} did not return the expected structure:`, result);
  return []; // Or throw new Error('Invalid response structure for user settings');
}

export async function fetchSheetData(
  sheetId: string,
  sheetName: string,
  date: string,
  cache: Record<string, SheetEntry[]>,
  setCache: (updater: (prevCache: Record<string, SheetEntry[]>) => Record<string, SheetEntry[]>) => void
): Promise<SheetEntry[]> {
  if (!sheetId || !sheetName) {
    throw new Error('Sheet ID and Sheet Name are required.');
  }
  if (!date) {
    // Or return empty array / specific status to indicate no date selected
    throw new Error('Date is required to fetch sheet data.'); 
  }

  const cacheKey = `${sheetId}-${sheetName}-${date}`;
  if (cache[cacheKey]) {
    // console.log('Serving from cache:', cacheKey);
    return cache[cacheKey];
  }

  // console.log('Fetching from network:', cacheKey);
  // The payload for getSheetData usually includes sheetId, sheetName, and date
  // Assuming the API returns the rows directly or nested under a 'data' property
  const result = await apiCall<SheetDataResponse | SheetEntry[]>('getSheetData', { sheetId, sheetName, date });
  
  let dataToCache: SheetEntry[];
  if(Array.isArray(result)){ // If result is directly the array of entries
    dataToCache = result;
  } else if (result && Array.isArray(result.data)) { // If result is { data: [...] }
    dataToCache = result.data;
  } else {
    console.warn('fetchSheetData did not return the expected array structure:', result);
    dataToCache = []; // Or throw an error
  }
  
  setCache(prevCache => ({ ...prevCache, [cacheKey]: dataToCache }));
  return dataToCache;
}
