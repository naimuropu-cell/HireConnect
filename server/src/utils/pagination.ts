export interface PaginationParams {
  page: number;
  pageSize: number;
}

export function getPagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 12));
  return { page, pageSize };
}

export function paginated<T>(items: T[], total: number, params: PaginationParams) {
  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize) || 1,
  };
}
