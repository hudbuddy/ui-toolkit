import * as RM from '@rainmaker/ui'

export const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text)
  RM.Toasts.success('Copied to clipboard', 2000)
}
