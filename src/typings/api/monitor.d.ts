declare namespace Api {
  namespace Monitor {
    type ProviderType = 1 | 2 | 3;

    type ProviderStatus = 1 | 2;

    type ProviderCloudSetting = {
      api_host: string;
      app_key: string;
      app_secret: string;
    };

    type ProviderSetting = {
      cloud: ProviderCloudSetting;
    };

    type Provider = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      name: string;
      provider_type: ProviderType;
      status: ProviderStatus;
      setting: ProviderSetting;
    }>;

    type ProviderList = Api.Common.PaginatingQueryRecord<Provider>;

    type ProviderOperateParams = {
      id?: CommonType.IdType | null;
      name: string;
      provider_type: ProviderType | null;
      setting: ProviderSetting;
      status: ProviderStatus | null;
    };

    type ProviderSearchParams = CommonType.RecordNullable<
      Pick<Provider, 'name' | 'provider_type' | 'status'> & Api.Common.CommonSearchParams
    >;

    type MonitorAccessType = 1 | 2;

    type MonitorStatus = 1 | 2;

    type MonitorCloudSetting = {
      device_serial?: string;
    };

    type MonitorSetting = {
      cloud?: MonitorCloudSetting;
    };

    type Monitor = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      name: string;
      access_type: MonitorAccessType;
      provider_id?: CommonType.IdType;
      status: MonitorStatus;
      setting: MonitorSetting;
    }>;

    type MonitorList = Api.Common.PaginatingQueryRecord<Monitor>;

    type MonitorDetail = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      name: string;
      access_type: MonitorAccessType;
      provider_id?: CommonType.IdType | null;
      status: MonitorStatus;
      setting: MonitorSetting;
    }>;

    type MonitorDetailResponse = {
      monitor: MonitorDetail;
    };

    type MonitorSearchParams = CommonType.RecordNullable<
      Pick<Monitor, 'name' | 'access_type' | 'status'> & Api.Common.CommonSearchParams
    >;

    type MonitorOperateParams = {
      id?: CommonType.IdType | null;
      name: string;
      access_type: MonitorAccessType | null;
      provider_id: CommonType.IdType | null;
      setting: {
        cloud: {
          device_serial: string;
        };
      };
      status: MonitorStatus | null;
    };

    type MonitorCreateParams = Omit<MonitorOperateParams, 'id'>;

    type MonitorChannelPlayProtocol = 3 | 4 | 5;

    type MonitorChannelLocalPullSetting = {
      source_url: string;
      stream_key?: string;
      proxy_key?: string;
    };

    type MonitorChannelSetting = {
      play_protocol: MonitorChannelPlayProtocol | null;
      local_pull: MonitorChannelLocalPullSetting;
    };

    type MonitorChannel = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      monitor_id: CommonType.IdType;
      source_type: number;
      name: string;
      channel_no: number;
      status: MonitorStatus;
      setting: MonitorChannelSetting;
      proxy_key?: string;
    }>;

    type MonitorChannelListExtra = {
      is_online_map?: Record<string, boolean>;
    };

    type MonitorChannelList = Api.Common.PaginatingQueryRecord<MonitorChannel, MonitorChannelListExtra>;

    type MonitorChannelSearchParams = Api.Common.CommonSearchParams;

    type MonitorChannelOperateParams = {
      id?: CommonType.IdType | null;
      monitor_id: CommonType.IdType;
      name: string;
      setting: MonitorChannelSetting;
      status: MonitorStatus | null;
    };

    type MonitorChannelCreateParams = Omit<MonitorChannelOperateParams, 'id'>;

    type MonitorChannelDetailResponse = {
      monitor_channel: MonitorChannel;
    };

    type MonitorChannelLiveUrlInfo = {
      url?: string;
      video_codec?: number;
      access_token?: string;
      live_access_token?: string;
      [key: string]: unknown;
    };

    type MonitorChannelLiveUrlResponse = MonitorChannelLiveUrlInfo & {
      live_url?: MonitorChannelLiveUrlInfo;
      data?: MonitorChannelLiveUrlInfo;
    };

    type MonitorChannelLiveCloseParams = {
      id: CommonType.IdType;
      url: string;
    };
  }
}
