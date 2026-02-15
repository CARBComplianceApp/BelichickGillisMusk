export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  MILA_CHAT = 'MILA_CHAT',
  KESHA_VOICE = 'KESHA_VOICE',
  CREATIVE_LAB = 'CREATIVE_LAB',
  ASSET_ANALYZER = 'ASSET_ANALYZER',
  MAPS_GROUNDING = 'MAPS_GROUNDING',
  DOCUMENTS = 'DOCUMENTS',
  LEAD_DATABASE = 'LEAD_DATABASE'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface KPI {
  label: string;
  value: string;
  trend: number;
  unit: string;
}

export interface AssetData {
  type: 'Real Estate' | 'Fleet Vehicle' | 'Heavy Equipment';
  name: string;
  cost: number;
  weight?: number; // For GVWR logic
  units?: number;
  monthlyRevenue: number;
  purchaseDate: string;
}

export interface Lead {
  id: string;
  name: string;
  category: string;
  website?: string;
  phone?: string;
  address: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string;
  status: 'Not Contacted' | 'Contacted' | 'Response Received';
}

export interface AssetAnalysis {
  taxStrategy: string;
  efficiencyScore: number;
  projectedSavings: number;
  recommendation: string;
}
