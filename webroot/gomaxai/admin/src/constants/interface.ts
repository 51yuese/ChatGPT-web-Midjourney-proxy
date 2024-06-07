export interface Child {
  label: string,
  value: string
}


export interface Menu {
  name: string,
  checkAll: boolean,
  isIndeterminate: boolean,
  checked: string[],
  children: Child[]
}


export interface Pager {
  page: number,
  size: number,
  total: number
}
