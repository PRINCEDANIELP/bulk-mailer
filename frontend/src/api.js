const API_URL = process.env.REACT_APP_API_URL || "/api";

async function request(path, { method = "GET", body, token, isForm } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no JSON body */
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: { username, password } }),

  sendMail: (token, formData) =>
    request("/mail/send", { method: "POST", token, body: formData, isForm: true }),

  history: (token) => request("/mail/history", { token }),
};
