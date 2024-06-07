import api from "../index";

export class TDict {
  id!: number;

  /**
   * 字典类型
   */
  dictType!: string;

  /**
   * 字典名称
   */
  dictName!: string;

  /**
   * 字典值
   */
  dictValue!: string;

  /**
   * 删除状态
   */
  deleteFlag!: number;

  /**
   * 创建时间
   */
  createdAt!: string;

  /**
   * 更新时间
   */
  updatedAt!: string;
};

export type TDictPageReq = {
  /**
   * 字典类型
   */
  dictType?: string;

  /**
   * 字典名称关键字
   */
  dictName?: string;

  /**
   * 页码
   */
  page?: number;

  /**
   * 每页数量
   */
  size?: number;
};

export type TDictPageRes = {
  /**
   * 总数量
   */
  count: number;
  rows: Array<TDict>;
};

export type TDictEdit = {
  id?: number;
  ids?: Array<number>;
  dictType?: string;
  dictName?: string;
  dictValue?: string;
};

export default {
  /**
   * 字典分页
   */
  page: (params: TDictPageReq) =>
    api.get<TDictPageRes>("/dict/page", { params }),
  /**
   * 保存字典
   */
  save: (data: TDictEdit) => api.post<Boolean>("/dict/save", data),
  /**
   * 删除字典
   */
  delete: (data: TDictEdit) => api.post<Boolean>("/dict/delete", data),
};
