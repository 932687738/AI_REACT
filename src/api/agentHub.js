import { get } from '@/utils/request'

export function fetchAgentHubStatus() {
  return get('/api/agent-hub/status')
}
