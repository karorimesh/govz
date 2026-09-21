const defaultBackendBaseUrl = "http://localhost:8080";

export function getBackendUrl(path: string) {
  const backendBaseUrl =
    process.env.BACKEND_BASE_URL ?? defaultBackendBaseUrl;

  return new URL(path, backendBaseUrl).toString();
}