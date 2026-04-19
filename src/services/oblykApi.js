import Jsona from 'jsona'
const apiBaseUrl = import.meta.env.VITE_OBLYK_API_BASE_URL

async function handleResponse (response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message ?? `HTTP error: ${response.status}`)
  }

  // no body
  if (response.status === 204) {
    return null
  }
  const data = await response.json()
  console.log(new Jsona().deserialize(data))
  return new Jsona().deserialize(data)
}

async function request (endpoint, params = {}, options = {}) {
  let urlParams = new URLSearchParams()
  for (const key in params) {
    urlParams.append(key, params[key])
  }
  if (params.length > 0) {
    urlParams = `?${urlParams}`
  }
  const response = await fetch(`${apiBaseUrl}${endpoint}${urlParams}`, { ...options })
  return handleResponse(response)
}

export const oblykApi = {
  get: (endpoint, params = {}, options = {}) =>
    request(endpoint, params, { ...options, method: 'GET' }),
}
