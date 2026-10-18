const pendingRequests = new Map<string, Promise<unknown>>();

export async function deduplicateRequest<T>(
  key: string,
  operation: () => Promise<T>,
): Promise<T> {
  const existingRequest = pendingRequests.get(key);

  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const request = operation();

  pendingRequests.set(key, request);

  try {
    return await request;
  } finally {
    // Delete only if this is still the current request for this key.
    if (pendingRequests.get(key) === request) {
      pendingRequests.delete(key);
    }
  }
}