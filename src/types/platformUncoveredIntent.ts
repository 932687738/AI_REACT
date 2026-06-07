export interface PlatformUncoveredIntentItem {
  id: number;
  conversationId: string;
  userQuery: string;
  createdAt: string;
}

export interface PlatformUncoveredIntentListResponse {
  items: PlatformUncoveredIntentItem[];
}
