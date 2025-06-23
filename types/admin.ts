export interface CardConfig {
  title: string;
  sheetId: string;
  sheetName: string;
  targetCount: number;
  // Add any other properties that come from the config
}

// A row from the Google Sheet. Adjust based on actual column data types if known.
// For now, it's an array of any, or string/number if specific columns are known.
export type SheetEntry = any[]; 

// Example of a more specific SheetEntry if columns are fixed:
// export type SheetEntry = [
//   string, // Column A (e.g., Timestamp)
//   string, // Column B
//   ...
//   string, // Column H (User - index 7)
//   string, // Column I 
//   string  // Column J (Number - index 9)
//   ...
// ];


export interface ApiError {
  error: string;
}

export interface ApiResponseSuccess<T> {
  success: true;
  data: T; // Generic data payload
  [key: string]: any; // Allow other properties like 'users', 'config'
}

export interface ApiResponseFailure {
  success: false;
  error: string;
  [key: string]: any;
}

export type ApiResponse<T = any> = ApiResponseSuccess<T> | ApiResponseFailure;

// Specific response types based on observed Google Apps Script responses

export interface AllUsersResponse {
  users: string[];
  [key: string]: any; // Allow other properties if GAS sends more
}

export interface UserSettingsResponse {
  config: CardConfig[];
   [key: string]: any;
}

export interface SheetDataResponse {
   // Assuming it's an array of rows, where each row is an array of cell values
  data: SheetEntry[];
  [key: string]: any;
}
