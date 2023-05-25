/**
 * A simplified fetch API specifically made for interating with our own API:
 *
 *   - Automatically sets headers to JSON content type
 *   - Stringifies body if received as an object
 *   - Throws if resulting status code is not OK
 *   - Resolves to JSON
 */

export const fetchAPI = (
  path: string,
  requestOptions: Omit<RequestInit, 'body'> & {
    body?: { [key: string]: any } | RequestInit['body']
    headers?: { [name: string]: string }
  } = {},
) => {
  const body =
    typeof requestOptions.body === 'string'
      ? requestOptions.body
      : JSON.stringify(requestOptions.body)

  return fetch(path, {
    ...requestOptions,
    headers: new Headers({
      accept: 'application/json',
      'content-type': 'application/json',
      ...(requestOptions.headers ?? {}),
    }),
    ...(body ? ({ body } as any) : {}),
  }).then(async (resp) => {
    if (!resp.ok) throw Error('Request failed')
    return resp ? resp.json() : null
  })
}
