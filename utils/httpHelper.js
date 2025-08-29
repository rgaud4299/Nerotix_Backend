const axios = require("axios");
const https = require("https");



async function makeAxiosRequest(
  requestUrl,
  params = {},
  requestMethod = "GET",
  timeoutSeconds = 10,
  token = null,
  contentType = "",
  extra = {}
) {
  try {
    // Validate URL
    try {
      new URL(requestUrl); // will throw if invalid
    } catch {
      throw new Error(`Invalid URL: ${requestUrl}`);
    }

    // SSL verify toggle
    const httpsAgent = extra?.insecure
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

    // Base headers
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...(extra?.headers || {}),
    };

    // Axios config
    const config = {
      url: requestUrl,
      method: requestMethod.toUpperCase(),
      timeout: Math.max(1, Math.floor(timeoutSeconds * 1000)),
      headers,
      httpsAgent,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 300,
    };

    // Attach params/data
    if (config.method === "GET") {
      config.params = params;
    } else {
      if ((contentType || "").toLowerCase() === "application/json") {
        config.data = params; // auto JSON
      } else if (
        (contentType || "").toLowerCase() ===
        "application/x-www-form-urlencoded"
      ) {
        const body = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) =>
          body.append(k, v ?? "")
        );
        config.data = body.toString();
      } else {
        config.headers["Content-Type"] = "application/json";
        config.data = params;
      }
    }

    // Request
    console.log(config);
    
    const axiosResponse = await axios.request(config);

    return {
      success: true,
      response:
        typeof axiosResponse.data === "string"
          ? axiosResponse.data
          : JSON.stringify(axiosResponse.data),
    };
  } catch (error) {
    // Handle Axios error
    if (error.response) {
      const { status, headers, data } = error.response;
      const ct = (headers?.["content-type"] || "").toLowerCase();
      const bodyString =
        typeof data === "string" ? data : JSON.stringify(data);

      if (
        ct.includes("application/json") ||
        ct.includes("application/xml") ||
        ct.includes("text/")
      ) {
        return { success: false, response: bodyString };
      }
      return { success: false, response: `HTTP Error: ${status}` };
    } else if (error.request) {
      return { success: false, response: "HTTP Error: No Response" };
    } else {
      return { success: false, response: error.message };
    }
  }
}
module.exports = { makeAxiosRequest };