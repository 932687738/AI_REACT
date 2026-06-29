import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import { platformHeaders, platformWriteRequestOptions } from '@/services/platformAdminCommon';
import type {
  PromptTemplate,
  PromptTemplatePageResponse,
  SavePromptTemplateRequest,
  RollbackPromptRequest,
  PromptExperimentResponse,
  SavePromptExperimentRequest,
  PromptInvokeLogListResponse,
} from '@/types/promptManagement';

export async function listPromptTemplates(params?: {
  category?: string;
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<PromptTemplatePageResponse> {
  return request<PromptTemplatePageResponse>(API_PATHS.superAgents.promptsTemplates, {
    method: 'GET',
    headers: platformHeaders(),
    params,
  });
}

export async function createPromptTemplate(
  input: SavePromptTemplateRequest,
): Promise<PromptTemplate> {
  return request<PromptTemplate>(API_PATHS.superAgents.promptsTemplates, {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function updatePromptTemplate(
  name: string,
  input: Omit<SavePromptTemplateRequest, 'name'>,
): Promise<PromptTemplate> {
  return request<PromptTemplate>(API_PATHS.superAgents.promptTemplate(name), {
    method: 'PUT',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function deletePromptTemplate(name: string): Promise<void> {
  return request<void>(API_PATHS.superAgents.promptTemplate(name), {
    method: 'DELETE',
    headers: platformHeaders(),
    ...platformWriteRequestOptions,
  });
}

export async function listPromptTemplateVersions(name: string): Promise<PromptTemplate[]> {
  return request<PromptTemplate[]>(API_PATHS.superAgents.promptTemplateVersions(name), {
    method: 'GET',
    headers: platformHeaders(),
  });
}

export async function rollbackPromptTemplate(
  name: string,
  input: RollbackPromptRequest,
): Promise<PromptTemplate> {
  return request<PromptTemplate>(API_PATHS.superAgents.promptTemplateRollback(name), {
    method: 'POST',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function getPromptExperiment(sceneKey: string): Promise<PromptExperimentResponse> {
  return request<PromptExperimentResponse>(API_PATHS.superAgents.promptExperiment(sceneKey), {
    method: 'GET',
    headers: platformHeaders(),
  });
}

export async function savePromptExperiment(
  sceneKey: string,
  input: SavePromptExperimentRequest,
): Promise<PromptExperimentResponse> {
  return request<PromptExperimentResponse>(API_PATHS.superAgents.promptExperiment(sceneKey), {
    method: 'PUT',
    headers: platformHeaders(),
    data: input,
    ...platformWriteRequestOptions,
  });
}

export async function listPromptInvokeLogs(
  name: string,
  params?: { from?: string; to?: string; page?: number; size?: number },
): Promise<PromptInvokeLogListResponse> {
  return request<PromptInvokeLogListResponse>(API_PATHS.superAgents.promptTemplateInvokes(name), {
    method: 'GET',
    headers: platformHeaders(),
    params,
  });
}
