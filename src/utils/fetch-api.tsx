/**
 * A simplified fetch API specifically made for interating with our own API:
 *
 *   - Automatically sets headers to JSON content type
 *   - Stringifies body if received as an object
 *   - Throws if resulting status code is not OK
 *   - Resolves to JSON
 */

const GLOBAL_TIMEOUT = 10000

import { useState, useEffect } from 'react'

export type APIRequestOptions = Omit<RequestInit, 'body'> & {
  body?: { [key: string]: any } | RequestInit['body']
  headers?: { [name: string]: string }
  timeout?: number
}

export const fetchAPI = (
  path: string,
  requestOptions: APIRequestOptions = {},
  defaultValue?: any,
) => {
  const { timeout = GLOBAL_TIMEOUT } = requestOptions
  const body =
    typeof requestOptions.body === 'string'
      ? requestOptions.body
      : JSON.stringify(requestOptions.body)

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  return fetch(path, {
    ...requestOptions,
    headers: new Headers({
      accept: 'application/json',
      'content-type': 'application/json',
      ...(requestOptions.headers ?? {}),
    }),
    ...(body ? ({ body } as any) : {}),
    signal: controller.signal,
  })
    .then(async (resp) => {
      clearTimeout(id)
      if (!resp.ok) throw Error('Request failed')
      return resp ? resp.json() : null
    })
    .catch((e) => {
      clearTimeout(id)
      if (typeof defaultValue !== 'undefined') return defaultValue
      throw e
    })
}

export const useAPI = <T extends {} = {}>(
  url: string,
  deps: any[] = [],
  requestOptions?: APIRequestOptions,
): T => {
  const [result, setResult] = useState()

  useEffect(() => {
    fetchAPI(url, requestOptions).then(setResult)
  }, deps)

  return result
}
