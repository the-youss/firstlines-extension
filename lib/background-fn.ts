import { storageFn } from "./storage"

export const exportSearchLeads = async () => {
  const LK__REQUEST_HEADERS = await storageFn.get<object>('__FL_LK__REQUEST')
  const LK__REQUEST = await storageFn.get<object>('__FL_LK__REQUEST_HEADERS')

  const obj = {
    ...LK__REQUEST_HEADERS,
    ...LK__REQUEST,
  }
  console.log(obj)
}