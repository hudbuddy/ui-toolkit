export const toHref = (url: string) => {
  // Do not modify full URLs
  if (url[0] !== '/') return url

  // Remove the v2 prefix if it exists
  const pathParts = url.split('v2')
  const path = pathParts[1] ?? pathParts[0]

  // Handle relative link when i-framed
  if (window.self !== window.top) {
    // Send to legacy router
    return '/#' + path
  } else {
    return '/v2' + path
  }
}
