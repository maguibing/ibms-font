declare namespace Api {
  namespace Rule {
    type MessageRuleType = 1 | 2;

    type MessageRuleStatus = 1 | 2;

    type MessageRuleScript = {
      script_type: 2;
      content: string;
    };

    type MessageRule = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      project_id: CommonType.IdType;
      name: string;
      gateway_id: CommonType.IdType;
      rule_type: MessageRuleType;
      rule?: MessageRuleScript;
      status: MessageRuleStatus;
      sync_status?: number;
      script_key?: string;
    }>;

    type MessageRuleList = Api.Common.PaginatingQueryRecord<MessageRule>;

    type MessageRuleOperateParams = {
      id?: CommonType.IdType | null;
      gateway_id: number | null;
      name: string;
      rule: MessageRuleScript;
      rule_type: MessageRuleType | null;
      status: MessageRuleStatus | null;
    };

    type MessageRuleValidateParams = {
      script: string;
      script_type: 2;
      test_data_json: string;
    };

    type MessageRuleValidateResult = Record<string, unknown> | unknown[] | string | number | boolean | null;

    type MessageRuleSearchParams = CommonType.RecordNullable<Pick<MessageRule, 'name'> & Api.Common.CommonSearchParams>;
  }
}
