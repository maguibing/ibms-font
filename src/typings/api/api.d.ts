/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common metadata of paginating */
    interface PaginateMeta {
      /** page size */
      limit: number;
      /** total count */
      total: number;
      /** current offset */
      offset?: number;
    }

    /** common params of paginating query list data */
    type PaginatingQueryRecord<T = any, Extra extends Record<string, unknown> = Record<string, never>> = {
      paginate: PaginateMeta;
      list: T[];
    } & Extra;

    /** common search params of table */
    type CommonSearchParams = {
      pageNum: number;
      pageSize?: number;
    };

    /**
     * 启用状态
     *
     * - "0": 正常
     * - "1": 停用
     */
    type EnableStatus = '0' | '1';

    /**
     * 显示状态
     *
     * - "0": 显示
     * - "1": 隐藏
     */
    type VisibleStatus = '0' | '1';

    /**
     * 是否状态
     *
     * - "Y": 是
     * - "N": 否
     */
    type YesOrNoStatus = 'Y' | 'N';

    /** common record */
    type CommonRecord<T = any> = {
      created_at: number;
      updated_at: number;
    } & T;

    /** common id list */
    type CommonIdList = {
      id_list: CommonType.IdType[];
    };

    type CommonTenantRecord<T = any> = {
      /** record tenant id */
      tenantId: string;
    } & CommonRecord<T>;

    /** common tree record */
    interface DeptNode {
      dept_id: number;
      dept_name: string;
      dept_parent_id?: number;
      leader_id?: number;
      sort?: number;
      children?: DeptNode[];
    }

    interface DeptTreeResponse {
      trees: DeptNode[];
      leader_map?: Record<
        string,
        {
          user_id: number;
          username: string;
          phone?: string;
          email?: string;
          dept_id?: number;
          role_id?: number;
          status?: number;
          [key: string]: unknown;
        }
      >;
    }
  }
}
