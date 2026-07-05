declare namespace Api {
  namespace Space {
    /** space type */
    type SpaceType = Api.Common.CommonRecord<{
      id: CommonType.IdType;
      name: string;
      desc: string;
    }>;

    /** space type list */
    type SpaceTypeList = Api.Common.PaginatingQueryRecord<SpaceType>;

    /** space type operate params */
    type SpaceTypeOperateParams = CommonType.RecordNullable<Pick<SpaceType, 'id' | 'name' | 'desc'>>;

    /** space type search params */
    type SpaceTypeSearchParams = CommonType.RecordNullable<
      Api.Common.CommonSearchParams & {
        keyword: string;
      }
    >;

    /** space */
    type Space = Api.Common.CommonRecord<{
      space_id: CommonType.IdType;
      parent_id?: CommonType.IdType;
      space_name: string;
      desc: string;
      space_type_id: CommonType.IdType | null;
      children?: Space[];
    }>;

    /** space search params */
    type SpaceSearchParams = CommonType.RecordNullable<Pick<Space, 'space_name'>>;

    /** space tree response */
    type SpaceTreeResponse = {
      trees: Space[];
      space_type_map?: Record<string, Pick<SpaceType, 'id' | 'name'>>;
    };

    /** space detail response */
    type SpaceDetailResponse = {
      space: Api.Common.CommonRecord<{
        id: CommonType.IdType;
        project_id: CommonType.IdType;
        name: string;
        space_type_id: CommonType.IdType | null;
        desc: string;
        level: number;
      }>;
    };

    /** create space params */
    type CreateSpaceParams = {
      desc: string;
      name: string;
      parent_id: CommonType.IdType;
      space_type_id: CommonType.IdType | null;
    };

    /** update space params */
    type UpdateSpaceParams = CreateSpaceParams & {
      id: CommonType.IdType;
    };
  }
}
