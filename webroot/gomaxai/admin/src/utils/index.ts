import path from 'path-browserify'
import {ACCESS_STATUS_OPTIONS, KeyVal} from "@/constants";

export function resolveRoutePath(basePath: string, routePath?: string) {
  return basePath ? path.resolve(basePath, routePath ?? '') : routePath ?? ''
}

export const deepClone = (data: any) => JSON.parse(JSON.stringify(data))


// 将数组转成对象模型
export const array2Obj =  (array: KeyVal[]) => array.reduce(
    (pre: any, cur, index) =>  {
      pre[cur.value] = cur.label;
      return pre;
    }, {})

