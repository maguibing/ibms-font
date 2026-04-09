/** The common type namespace */
declare namespace CommonType {
  /** The strategic pattern */
  interface StrategicPattern {
    /** The condition */
    condition: boolean;
    /** If the condition is true, then call the action function */
    callback: () => void;
  }

  /**
   * The option type
   *
   * @property value: The option value
   * @property label: The option label
   */
  type Option<K = string, M = string> = { value: K; label: M };

  /** The record type */
  type Record<K extends string | number = string> = { [key in K]: string };

  type YesOrNo = 'Y' | 'N';

  /** add null to all properties */
  type RecordNullable<T> = {
    [K in keyof T]?: T[K] | null;
  };

  /** The id type */
  type IdType = string | number;

  /** The res error code */
  type ErrorCode = '401' | '403' | '404' | 'default';

  /** The configuration options for constructing tree structure data */
  type TreeConfig<T> = {
    /** id field name */
    idField?: keyof T;
    /** parent id field name */
    parentIdField?: keyof T;
    /** children field name */
    childrenField?: keyof T;
    /** filter function */
    filterFn?: (node: any) => boolean;
  };

  /** 通用请求参数的options选项类型 */
  interface CommonRequestOptions {
    options?: Array<{
      key: number;
    }>;
  }

  interface CommonKeysOptions {
    key: number;
  }

  interface CommonTypeOptions {
    type: number;
    value: any | null;
  }

  interface CommonListOptions {
    limit?: number;
    offset?: number;
    options?: CommonTypeOptions[];
  }

  interface CommonListQueryParams {
    options?: Array<{
      key: number;
    }>;
    list_option?: CommonListOptions;
  }
}
