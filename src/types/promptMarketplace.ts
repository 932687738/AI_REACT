export interface PromptTemplate {
  id: number;
  name: string;
  description: string | null;
  version: number;
  status: string;
  category: string;
  content: string;
  tags: string[];
  source: string;
  createdBy: string | null;
}

export interface PromptMarketplaceListResponse {
  items: PromptTemplate[];
  categories: string[];
}

export interface ToggleFavoriteRequest {
  templateId: number;
}

export interface ToggleFavoriteResponse {
  promptId: number;
  favorited: boolean;
}

export interface UsePromptRequest {
  templateId: number;
  agentName: string;
  sceneKey?: string;
}

export interface SaveGeneratedPromptRequest {
  name: string;
  content: string;
}

export interface QuickCommand {
  id: number;
  agentName: string;
  name: string;
  content: string;
  icon: string | null;
  version: number;
}

export interface QuickCommandListResponse {
  items: QuickCommand[];
}

export interface QuickCommandRequest {
  name: string;
  content: string;
  icon?: string;
}

export interface PromptFavorite {
  id: number;
  templateId: number;
  createdAt: string;
}
