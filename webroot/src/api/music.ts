import { get, post } from '@/utils/request'

export function createMusic<T>(data: { message_id: string; orderId: number }): Promise<T> {
    return post<T>({
      url: '/api/chatgpt/music-chat',
      data,
    })
  }
  export function musicQuery<T>(data:{modelType:string}): Promise<T> {
    return get<T>({ url: '/group/query' ,data})
  }

  // suno音乐对话
  export function musicChat<T>(data:any): Promise<T> {
    return post<T>({ url: '/chatgpt/music-chat' ,data})
  }
//查询音乐对话
export function queryMusicGroup<T>(data:any): Promise<T> {
  return get<T>({ url: '/group/query' ,data})
}
  //创建音乐对话
  export function createMusicGroup<T>(data:any): Promise<T> {
    return post<T>({ url: '/group/create' ,data})
  }
  //获取音乐生成记录
  export function handleMusicLog<T>(data?:{page:number,size:number,order:string}):Promise<T> {
    return get<T>({url: "/chatlog/musicLog",data})
  }
  //随机生成风格、歌词
  export function musicModeLyrics<T>(data?:{dictType :string}):Promise<T> {
    return get<T>({url: "/dict/random",data})
  }

   //获取音乐广场数据
   export function musicSquare<T>(data:{page :number,size:number,keyword?:string,order?:string}):Promise<T> {
    return get<T>({url: "/chatgpt/music-square",data})
  }
  //获取我的作品
  export function myMusicLog<T>(data:{page?:number,size?:number,order?:string}):Promise<T> {
    return get<T>({url: "/chatlog/musicLog",data})
  }

  //点赞-----弃用
  export function musicLike<T>(data:{chatLogId :number,type:string,action:string}):Promise<T> {
    return post<T>({url: "/chatgpt/chatAgree",data})
  }
//音乐广场点赞
export function musicAgree<T>(data:any):Promise<T>{
  return post<T>({url:"/aiLog/agree",data}) as Promise<T>
}


  //下载
  export function musicDownLoad<T>(data:{url :string}):Promise<T> {
    return get<T>({url: "/proxy/down",data})
  }

  //播放
  export function musicPlay<T>(data:{recoredId :number}):Promise<T> {
    return get<T>({url: "/aiLog/music-play",data})
  }

  //查询所有配置
  export function allQuery<T>(data):Promise<T> {
    return post<T>({url: "/config/query",data})
  }

  //音乐删除
  export function musicDelect<T>(data:{id:number}):Promise<T> {
    return post<T>({url: "/chatLog/del",data})
  }