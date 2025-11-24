/**
 * Pagination Helper Utilities
 * Consistent pagination across all API endpoints
 */

export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * Parse pagination parameters from request URL
 * Defaults: page=1, limit=20
 * Max limit: 100
 *
 * @param request - Request object with URL search params
 * @returns Pagination parameters with page, limit, and offset
 */
export function parsePaginationParams(request: Request): PaginationParams {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

/**
 * Build paginated response with metadata
 *
 * @param data - Array of items for current page
 * @param total - Total number of items across all pages
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Paginated response object
 */
export function buildPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

/**
 * Parse date range filters from request
 *
 * @param request - Request object with URL search params
 * @returns Object with date_from and date_to as ISO strings (or undefined)
 */
export function parseDateRangeParams(request: Request): {
    date_from?: string;
    date_to?: string;
} {
    const url = new URL(request.url);
    const date_from = url.searchParams.get('date_from') || undefined;
    const date_to = url.searchParams.get('date_to') || undefined;

    return { date_from, date_to };
}
