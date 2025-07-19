// api-helper.js
// helper functions for api files

export async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = isJson ? await response.json() : null;
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error("Fetch error: ", error);
    return {
      ok: false,
      status: 500,
      data: null,
      error,
    };
  }
}
