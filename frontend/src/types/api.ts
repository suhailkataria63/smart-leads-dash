interface ApiResponse<TData> {
  success: boolean;
  data: TData;
}

interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type { ApiResponse, PaginationMeta };

