export interface PlatformModelProviderState {
  providerId: string;
  enabled: boolean;
}

export interface PlatformModelProviderListResponse {
  providers: PlatformModelProviderState[];
}

export interface PlatformModelProviderRefreshResponse {
  refreshed: boolean;
  providers: PlatformModelProviderState[];
}
