/**
 * AI 模型配置 API 服务。
 */
import { request } from '@/openapi/request';
import { API_PATHS } from '@/constants/ApiPaths';
import type {
  ApiResponse,
  ModelConfig,
  ModelConfigCreateRequest,
  ModelConfigUpdateRequest,
  ModelTestResult,
  PageResult,
  ProviderInfo,
} from '@/types/modelConfig';

/**
 * 创建模型配置。
 */
export async function createModelConfig(
  data: ModelConfigCreateRequest,
): Promise<{ id: string }> {
  const res = await request<ApiResponse<{ id: string }>>(API_PATHS.agentHub.models, {
    method: 'POST',
    data,
  });
  if (res?.code !== 0) {
    throw new Error(res?.message || 'Failed to create model config');
  }
  return res.result!;
}

/**
 * 更新模型配置。
 */
export async function updateModelConfig(
  id: string,
  data: ModelConfigUpdateRequest,
): Promise<void> {
  const res = await request<ApiResponse<void>>(`${API_PATHS.agentHub.models}/${id}`, {
    method: 'PUT',
    data,
  });
  if (res?.code !== 0) {
    throw new Error(res?.message || 'Failed to update model config');
  }
}

/**
 * 查询模型配置。
 */
export async function getModelConfig(id: string): Promise<ModelConfig> {
  const res = await request<ApiResponse<ModelConfig>>(`${API_PATHS.agentHub.models}/${id}`, {
    method: 'GET',
  });
  if (res?.code !== 0) {
    throw new Error(res?.message || 'Failed to get model config');
  }
  return res.result!;
}

/**
 * 分页查询模型列表。
 */
export async function listModelConfigs(params?: {
  provider?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<PageResult<ModelConfig>> {
  const res = await request<ApiResponse<PageResult<ModelConfig>>>(
    API_PATHS.agentHub.modelList,
    {
      method: 'GET',
      params,
    },
  );
  if (res?.code !== 0) {
    throw new Error(res?.message || 'Failed to list model configs');
  }
  return res.result!;
}

/**
 * 删除模型配置。
 */
export async function deleteModelConfig(id: string): Promise<void> {
  const res = await request<ApiResponse<void>>(`${API_PATHS.agentHub.models}/${id}`, {
    method: 'DELETE',
  });
  if (res?.code !== 0 && res?.code !== 409) {
    throw new Error(res?.message || 'Failed to delete model config');
  }
  if (res?.code === 409) {
    throw new Error('Cannot delete default model');
  }
}

/**
 * 测试模型连通性。
 */
export async function testModel(id: string): Promise<ModelTestResult> {
  const res = await request<ApiResponse<ModelTestResult>>(
    `${API_PATHS.agentHub.models}/${id}/test`,
    {
      method: 'POST',
    },
  );
  if (res?.code !== 0) {
    throw new Error(res?.message || 'Failed to test model');
  }
  return res.result!;
}

/**
 * 激活模型。
 */
export async function activateModel(id: string): Promise<void> {
  const res = await request<ApiResponse<void>>(
    `${API_PATHS.agentHub.models}/${id}/activate`,
    {
      method: 'POST',
    },
  );
  if (res?.code !== 0) {
    throw new Error(res?.message || 'Failed to activate model');
  }
}

/**
 * 禁用模型。
 */
export async function deactivateModel(id: string): Promise<void> {
  const res = await request<ApiResponse<void>>(
    `${API_PATHS.agentHub.models}/${id}/deactivate`,
    {
      method: 'POST',
    },
  );
  if (res?.code !== 0) {
    throw new Error(res?.message || 'Failed to deactivate model');
  }
}

/**
 * 设置默认模型。
 */
export async function setDefaultModel(id: string): Promise<void> {
  const res = await request<ApiResponse<void>>(
    `${API_PATHS.agentHub.models}/${id}/set-default`,
    {
      method: 'POST',
    },
  );
  if (res?.code !== 0) {
    throw new Error(res?.message || 'Failed to set default model');
  }
}

/**
 * 获取支持的提供商列表。
 */
export async function getSupportedProviders(): Promise<ProviderInfo[]> {
  const res = await request<ApiResponse<ProviderInfo[]>>(
    API_PATHS.agentHub.modelProviders,
    {
      method: 'GET',
    },
  );
  if (res?.code !== 0) {
    throw new Error(res?.message || 'Failed to get providers');
  }
  return res.result!;
}
