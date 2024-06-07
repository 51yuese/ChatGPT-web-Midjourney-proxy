import { useGptsStore } from '@/store'

export function useGptsChat() {
  const gptsStore = useGptsStore()

  const addGroupChat = (chat: Chat.Chat) => {
    gptsStore.addGroupChat(chat)
  }

  const updateGroupChat = (index: number, chat: Chat.Chat) => {
    gptsStore.updateGroupChat(index, chat)
  }

  const updateGroupChatSome = (index: number, chat: Partial<Chat.Chat>) => {
    gptsStore.updateGroupChatSome(index, chat)
  }

  return {
    addGroupChat,
    updateGroupChat,
    updateGroupChatSome,
  }
}
