
export const api = async (route, body) => {
  try {
    if (!body) body = {}
    let url = `${import.meta.env.VITE_API_URL}${route}`
    let headers = {}
    const isFormData = body instanceof FormData

    if (!isFormData) {
      headers["Content-Type"] = "application/json"
      body = JSON.stringify(body)
    }

    const res = await fetch(url, {
      method: "POST",
      body: body,
      credentials: "include",
      headers
    })
    const data = await res.json()
    return data
  } catch (error) {
    console.error("API Call Failed", { route, body, error })
  }
}
