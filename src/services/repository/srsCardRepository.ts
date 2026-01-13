/**
 * Repository para tarjetas SRS
 */

import { BaseRepository } from './baseRepository';
import type { SRSCard } from '@/types/srs';

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

export class SRSCardRepository extends BaseRepository<SRSCard> {
  constructor() {
    super('srs_cards');
  }

  /**
   * Obtiene tarjetas que necesitan repaso hoy
   */
  async findDueCards(userId?: string): Promise<SRSCard[]> {
    const query = this.buildQuery();
    if (!query) return [];

    try {
      const now = new Date().toISOString();

      const where = userId
        ? `user_id=eq.${userId}&next_review_date=lte.${now}`
        : `next_review_date=lte.${now}`;

      const data = await applyFilter(
        query.select('*', { count: 'exact' }),
        where
      ).order('next_review_date', { ascending: true });

      return data?.data ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Obtiene tarjetas nuevas
   */
  async findNewCards(userId?: string, limit = 10): Promise<SRSCard[]> {
    const query = this.buildQuery();
    if (!query) return [];

    try {
      const where = userId ? `user_id=eq.${userId}&status=eq.new` : 'status=eq.new';

      const data = await applyFilter(
        query.select(),
        where
      ).order('created_at', { ascending: true })
        .limit(limit);

      return data?.data ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Obtiene estadísticas de un usuario
   */
  async getUserStats(userId: string): Promise<{
    total: number;
    new: number;
    learning: number;
    review: number;
    graduated: number;
  }> {
    const query = this.buildQuery();
    if (!query) {
      return { total: 0, new: 0, learning: 0, review: 0, graduated: 0 };
    }

    try {
      const { data } = await query
        .select('status', { count: 'exact' })
        .eq('user_id', userId);

      if (!data) return { total: 0, new: 0, learning: 0, review: 0, graduated: 0 };

      const stats = {
        total: data.length,
        new: data.filter((c) => c.status === 'new').length,
        learning: data.filter((c) => c.status === 'learning').length,
        review: data.filter((c) => c.status === 'review').length,
        graduated: data.filter((c) => c.status === 'graduated').length,
      };

      return stats;
    } catch {
      return { total: 0, new: 0, learning: 0, review: 0, graduated: 0 };
    }
  }

  /**
   * Busca tarjetas por texto o traducción
   */
  async search(query: string, userId?: string, limit = 20): Promise<SRSCard[]> {
    const supabase = this.getClient();
    if (!supabase) return [];

    try {
      let builder = supabase
        .from(this.tableName)
        .select()
        .or(`phrase.ilike.%${query}%,translation.ilike.%${query}%`)
        .limit(limit);

      if (userId) {
        builder = builder.eq('user_id', userId);
      }

      const { data } = await builder;
      return data ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Obtiene tarjetas por tag
   */
  async findByTag(tag: string, userId?: string): Promise<SRSCard[]> {
    const query = this.buildQuery();
    if (!query) return [];

    try {
      const where = userId
        ? `user_id=eq.${userId}&tags=cs.{${tag}}`
        : `tags=cs.{${tag}`;

      const { data } = await applyFilter(query.select(), where);
      return data ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Obtiene tarjetas para una sesión de estudio
   */
  async getStudySession(userId: string, maxNew: number, maxReview: number): Promise<{
    newCards: SRSCard[];
    reviewCards: SRSCard[];
  }> {
    const now = new Date().toISOString();

    const [newCards, reviewCards] = await Promise.all([
      this.findMany({
        where: `user_id=eq.${userId}&status=eq.new`,
        orderBy: { column: 'created_at', ascending: true },
        pageSize: maxNew,
      }),
      this.findMany({
        where: `user_id=eq.${userId}&next_review_date=lte.${now}`,
        orderBy: { column: 'next_review_date', ascending: true },
        pageSize: maxReview,
      }),
    ]);

    return {
      newCards: newCards.data ?? [],
      reviewCards: reviewCards.data ?? [],
    };
  }

  /**
   * Actualiza多个 tarjetas (batch update)
   */
  async batchUpdate(cards: Array<{ id: string } & Partial<SRSCard>>): Promise<void> {
    const supabase = this.getClient();
    if (!supabase) return;

    // Supabase no soporta batch update nativamente, así que usamos RPC
    // Por ahora, hacemos updates individuales en paralelo
    await Promise.all(
      cards.map((card) =>
        this.update(card.id, card).catch((_err) => {
        })
      )
    );
  }

  /**
   * Obtiene tarjeta por frase exacta
   */
  async findByPhrase(phrase: string, userId: string): Promise<SRSCard | null> {
    const result = await this.findOne({
      where: `user_id=eq.${userId}&phrase=eq.${phrase}`,
    });

    return result.data;
  }
}

// Singleton instance
export const srsCardRepository = new SRSCardRepository();
