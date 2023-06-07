import * as RM from '@rainmaker/ui'

export const copyToClipboard = async (
  text: string,
  message = 'Copied to clipboard',
) => {
  await navigator.clipboard.writeText(text)
  RM.Toasts.success(message, 3000)
}

export const sortObjectKeys = <T extends {}>(obj: T): T => {
  return Object.keys(obj)
    .sort()
    .reduce((_obj, key) => {
      _obj[key] = obj[key]
      return _obj
    }, {} as T)
}
