import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import { platformHeaders, platformWriteRequestOptions } from '@/services/platformAdminCommon';
import { postStream } from '@/utils/StreamSse';
import type {
  PromptMarketplaceListResponse,
  PromptTemplate,
  ToggleFavoriteRequest,
  ToggleFavoriteResponse,
  UsePromptRequest,
  SaveGeneratedPromptRequest,
  QuickCommand,
  QuickCommandListResponse,
  QuickCommandRequest,
  PromptFavorite,
} from '@/types/promptMarketplace';

export type {
  PromptTemplate,
  QuickCommand,
  PromptFavorite,
};

// ── Prompt 市场 ──

export async function listPromptMarketplace(params?: {
  category?: string;
  keyword?: string;
}): Promise<PromptMarketplaceListResponse> {
  return request<PromptMarketplaceListResponse>(API_PATHS.superAgents.promptsMarketplace, {
    method: 'GET',
    headers: platformHeaders(),
    params,
  });
}

export async function toggleFavorite(input: ToggleFavoriteRequest): Promise<ToggleFavoriteResponse> {
  return request<ToggleFavoriteResponse>(API_PATHS.superAgents.promptsMarketplaceFavorites, {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
  });
}

export async function listFavorites(): Promise<PromptFavorite[]> {
  return request<PromptFavorite[]>(API_PATHS.superAgents.promptsMarketplaceFavorites, {
    method: 'GET',
    headers: platformHeaders(),
  });
}

export async function generatePromptStream(
  description: string,
  onChunk: (chunk: string) => void,
): Promise<string> {
  return postStream(
    API_PATHS.superAgents.promptsGenerate,
    { description },
    {
      headers: platformHeaders(),
      onChunk,
    },
  );
}

export async function usePrompt(input: UsePromptRequest): Promise<void> {
  return request<void>(API_PATHS.superAgents.promptsMarketplaceUse, {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function saveGeneratedPrompt(
  input: SaveGeneratedPromptRequest,
): Promise<PromptTemplate> {
  return request<PromptTemplate>(API_PATHS.superAgents.promptsMarketplaceSaveGenerated, {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

// ── 快捷指令 ──

export async function listQuickCommands(agentName: string): Promise<QuickCommand[]> {
  const res = await request<QuickCommandListResponse>(
    API_PATHS.superAgents.quickCommands(agentName),
    {
      method: 'GET',
      headers: platformHeaders(),
    },
  );
  return res?.items ?? [];
}

export async function createQuickCommand(
  agentName: string,
  input: QuickCommandRequest,
): Promise<QuickCommand> {
  return request<QuickCommand>(API_PATHS.superAgents.quickCommands(agentName), {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function updateQuickCommand(
  agentName: string,
  id: number,
  input: QuickCommandRequest,
): Promise<QuickCommand> {
  return request<QuickCommand>(API_PATHS.superAgents.quickCommand(agentName, id), {
    method: 'PUT',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function deleteQuickCommand(agentName: string, id: number): Promise<void> {
  return request<void>(API_PATHS.superAgents.quickCommand(agentName, id), {
    method: 'DELETE',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}
