interface BaseLoginSelectItem {
  key: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}

export type LoginSelectItem =
  | (BaseLoginSelectItem & {
      type: 'corp';
      raw: Api.Auth.CorpLoginItem;
    })
  | (BaseLoginSelectItem & {
      type: 'project';
      raw: Api.Auth.ProjectLoginItem;
    });
