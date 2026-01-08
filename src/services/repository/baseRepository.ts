/**
 * Repository Pattern para Supabase
 * Proporciona una capa de abstracción sobre operaciones de base de datos
 */

import { supabase } from '@/lib/supabase';
import { supabaseQuery, supabaseQueryOptional, isAuthError } from '@/services/errorHandler';
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper para filter con string (TypeScript strict mode fix)
// Supabase filter acepta múltiples sobrecargas, usamos una firma genérica
function applyFilter<T>(
  builder: { filter: (column: string, operator: string, value: unknown) => T },
  filterStr: string
): T {
  // El filtro viene en formato "columna=operador.valor" o similar
  const parts = filterStr.split('.');
  if (parts.length >= 2) {
    const column = parts[0];
    const value = parts[1];
    return builder.filter(column, 'eq', value) as T;
  }
  // Fallback para otros formatos
  return builder as T;
}

// ============================================
// TIPOS GENÉRICOS
// ============================================

export type QueryBuilder = ReturnType<SupabaseClient['from']>;

export interface RepositoryOptions {
  useClient?: 'server' | 'browser';
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  from?: number;
  to?: number;
}

export interface OrderByOptions {
  column: string;
  ascending?: boolean;
}

export interface FindManyOptions extends PaginationOptions {
  where?: string | null;
  orderBy?: OrderByOptions;
}

export interface FindOneOptions {
  where?: string;
}

// ============================================
// RESULTADOS
// ============================================

export interface RepositoryResult<T> {
  data: T | null;
  error: Error | null;
}

export interface RepositoryListResult<T> {
  data: T[];
  error: Error | null;
  count?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

// ============================================
// CLASE BASE
// ============================================

export abstract class BaseRepository<T extends Record<string, unknown>> {
  protected tableName: string;
  protected primaryKey: string = 'id';

  constructor(tableName: string, protected options: RepositoryOptions = {}) {
    this.tableName = tableName;
  }

  /**
   * Obtiene el cliente de Supabase
   */
  protected getClient(): SupabaseClient {
    return supabase;
  }

  /**
   * Construye un query básico
   */
  protected buildQuery() {
    return this.getClient().from(this.tableName);
  }

  /**
   * Encuentra un registro por ID
   */
  async findById(id: string): Promise<RepositoryResult<T>> {
    const query = this.buildQuery();

    try {
      const data = await supabaseQuery<T>(
        async () => await query.select().eq(this.primaryKey, id).single(),
        {
          onError: (error) => {
            if (isAuthError(error)) {
              console.error('Auth error in repository:', error);
            }
          },
        }
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Encuentra un registro por condiciones
   */
  async findOne(
    options: FindOneOptions = {}
  ): Promise<RepositoryResult<T>> {
    const query = this.buildQuery();

    try {
      let builder = query.select();

      if (options.where) {
        builder = applyFilter(builder, options.where);
      }

      builder = builder.limit(1);

      const data = await supabaseQuery<T>(
        async () => await builder.single()
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Encuentra múltiples registros
   */
  async findMany(
    options: FindManyOptions = {}
  ): Promise<RepositoryListResult<T>> {
    const query = this.buildQuery();

    try {
      let builder = query.select();

      // Filtros
      if (options.where) {
        builder = applyFilter(builder, options.where);
      }

      // Ordenamiento
      if (options.orderBy) {
        builder = builder.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Paginación por rangos (más eficiente para Supabase)
      if (options.from !== undefined && options.to !== undefined) {
        builder = builder.range(options.from, options.to);
      }
      // Paginación por página
      else if (options.page !== undefined && options.pageSize !== undefined) {
        const from = options.page * options.pageSize;
        const to = from + options.pageSize - 1;
        builder = builder.range(from, to);
      }

      const data = await supabaseQueryOptional<T[]>(async () => await builder);

      // Obtener count total si es necesario
      let count: number | undefined;
      let hasMore: boolean | undefined;

      if (options.pageSize) {
        const countQuery = this.buildQuery();
        let countBuilder = countQuery.select('*', { count: 'exact', head: true });
        if (options.where) {
          countBuilder = applyFilter(countBuilder, options.where);
        }

        const countResult = await countBuilder;

        count = countResult.count ?? 0;
        const currentPage = options.page ?? 0;
        hasMore = (currentPage + 1) * options.pageSize < (count ?? 0);
      }

      return {
        data: (data ?? []) as T[],
        error: null,
        ...(count !== undefined && { count }),
        page: options.page ?? 0,
        ...(options.pageSize !== undefined && { pageSize: options.pageSize }),
        ...(hasMore !== undefined && { hasMore }),
      };
    } catch (error) {
      return {
        data: [],
        error: error as Error,
        count: 0,
        page: options.page ?? 0,
        ...(options.pageSize !== undefined && { pageSize: options.pageSize }),
        hasMore: false,
      };
    }
  }

  /**
   * Crea un nuevo registro
   */
  async create(data: Partial<T>): Promise<RepositoryResult<T>> {
    const query = this.buildQuery();

    try {
      const result = await supabaseQuery<T>(
        async () => await query.insert(data).select().single()
      );

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Actualiza un registro
   */
  async update(id: string, data: Partial<T>): Promise<RepositoryResult<T>> {
    const query = this.buildQuery();

    try {
      const result = await supabaseQuery<T>(
        async () => await query.update(data).eq(this.primaryKey, id).select().single()
      );

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Elimina un registro
   */
  async delete(id: string): Promise<RepositoryResult<boolean>> {
    const query = this.buildQuery();

    try {
      await supabaseQuery(
        async () => await query.delete().eq(this.primaryKey, id)
      );

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Crea o actualiza un registro (upsert)
   */
  async upsert(
    data: Partial<T>,
    options: { onConflict?: string } = {}
  ): Promise<RepositoryResult<T>> {
    const query = this.buildQuery();

    try {
      const conflictTarget = options.onConflict ?? this.primaryKey;

      const result = await supabaseQuery<T>(
        async () => await query.upsert(data, { onConflict: conflictTarget }).select().single()
      );

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Cuenta registros que cumplen una condición
   */
  async count(where?: string): Promise<RepositoryResult<number>> {
    const query = this.buildQuery();

    try {
      let builder = query.select('*', { count: 'exact', head: true });

      if (where) {
        builder = applyFilter(builder, where);
      }

      const result = await builder;

      return { data: result.count ?? 0, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Verifica si existe un registro
   */
  async exists(where: string): Promise<boolean> {
    const result = await this.count(where);
    return !result.error && (result.data ?? 0) > 0;
  }

  /**
   * Batch insert (múltiples registros)
   */
  async createMany(data: Partial<T>[]): Promise<RepositoryListResult<T>> {
    const query = this.buildQuery();

    try {
      const records = await supabaseQuery(
        async () => await query.insert(data).select()
      );

      return {
        data: Array.isArray(records) ? (records as T[]) : [records as T],
        error: null,
      };
    } catch (error) {
      return {
        data: [],
        error: error as Error,
      };
    }
  }

  /**
   * Batch update
   */
  async updateMany(
    where: string,
    data: Partial<T>
  ): Promise<RepositoryResult<number>> {
    const query = this.buildQuery();

    try {
      let builder = query.update(data);

      if (where) {
        builder = applyFilter(builder, where);
      }

      // No hay forma directa de obtener count de afectados en Supabase
      // Retornamos 1 como indicador de éxito
      await supabaseQuery(async () => await builder);

      return { data: 1, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Batch delete
   */
  async deleteMany(where: string): Promise<RepositoryResult<number>> {
    const query = this.buildQuery();

    try {
      let builder = query.delete();

      if (where) {
        builder = applyFilter(builder, where);
      }

      await supabaseQuery(async () => await builder);

      return { data: 1, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}
