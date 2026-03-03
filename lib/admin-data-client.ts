type Envelope<T> = {
  data?: T;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
};

export async function fetchAdminData<T>(
  endpoint: string
): Promise<{ data: T | null; pagination?: Envelope<T>['pagination'] }> {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!response.ok) {
      return { data: null };
    }

    const payload = (await response.json()) as Envelope<T> | T;
    if (payload && typeof payload === 'object' && 'data' in payload) {
      const wrapped = payload as Envelope<T>;
      return { data: wrapped.data ?? null, pagination: wrapped.pagination };
    }

    return { data: payload as T };
  } catch {
    return { data: null };
  }
}
