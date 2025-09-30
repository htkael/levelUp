
export const api = async (method, route, body) => {
  try {
    console.log("ROUTE AND BODY", { route, body })
    if (!body) body = {}
    let url = `${import.meta.env.VITE_API_URL}${route}`
    let headers = {}
    const isFormData = body instanceof FormData

    if (!isFormData) {
      headers["Content-Type"] = "application/json"
      body = JSON.stringify(body)
    }

    const res = await fetch(url, {
      method: method,
      body: body,
      credentials: "include",
      headers
    })
    const data = await res.json()
    console.log("res", data)
    return data
  } catch (error) {
    console.error("API Call Failed", { route, body, error })
  }
}
