import { API_PATHS } from '@/constants/ApiPaths';
import { request } from '@/openapi/request';
import type { JsonMap } from '@/openapi/typings';

const BASE = API_PATHS.humanLoop.base;

export function hilStep1(threadId: string, prompt = '') {
  return request<JsonMap>(`${BASE}/step1`, {
    method: 'GET',
    params: { threadId, prompt },
  });
}

export function hilStep2(body: JsonMap) {
  return request<JsonMap>(`${BASE}/step2`, {
    method: 'POST',
    data: body,
  });
}

export function toolFeedbackInvoke(threadId: string, question: string) {
  return request<JsonMap>(`${BASE}/tool-feedback/invoke`, {
    method: 'GET',
    params: { threadId, question },
  });
}

export function toolFeedbackResume(body: JsonMap) {
  return request<JsonMap>(`${BASE}/tool-feedback/resume`, {
    method: 'POST',
    data: body,
  });
}

export function toolFeedbackApprove(threadId: string) {
  return request<JsonMap>(`${BASE}/tool-feedback/resume/approve`, {
    method: 'POST',
    params: { threadId },
  });
}

export function toolFeedbackReject(threadId: string, rejectReason: string) {
  return request<JsonMap>(`${BASE}/tool-feedback/resume/reject`, {
    method: 'POST',
    params: { threadId, rejectReason },
  });
}

export function toolFeedbackEdit(threadId: string, toolName: string, editedArguments?: string) {
  const params: Record<string, string> = { threadId, toolName };
  if (editedArguments) {
    params.editedArguments = editedArguments;
  }
  return request<JsonMap>(`${BASE}/tool-feedback/resume/edit`, {
    method: 'POST',
    params,
  });
}

export function enterpriseContractReview(contractText = '') {
  return request<JsonMap>(`${BASE}/enterprise/contract-review`, {
    method: 'GET',
    params: { contractText },
  });
}

export function enterpriseEcommerceCs(userMessage = '') {
  return request<JsonMap>(`${BASE}/enterprise/ecommerce-cs`, {
    method: 'GET',
    params: { userMessage },
  });
}

export function enterprisePublishingStep1(threadId: string, hotKeywords = '') {
  return request<JsonMap>(`${BASE}/enterprise/publishing/step1`, {
    method: 'GET',
    params: { threadId, hotKeywords },
  });
}

export function enterprisePublishingStep2(body: JsonMap) {
  return request<JsonMap>(`${BASE}/enterprise/publishing/step2`, {
    method: 'POST',
    data: body,
  });
}
