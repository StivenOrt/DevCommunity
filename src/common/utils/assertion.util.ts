/**
 * Valida la existencia de un recurso o colección.
 * * Lanza una excepción si el recurso es nulo, indefinido o una lista vacía.
 * Útil para manejar respuestas de bases de datos en servicios de NestJS.
 *
 * @template T - El tipo del recurso esperado.
 * @param {T | null | undefined} res - El recurso o colección a evaluar.
 * @param {Error} error - Instancia de error (ej. NotFoundException) a lanzar si la validación falla.
 * @returns {T} - El recurso validado, garantizado como no nulo.
 * @throws {Error} - El error pasado por parámetro si el recurso no cumple las condiciones.
 * * @example
 * const post = ensureExists(await this.repo.findOne(id), new NotFoundException('Post no encontrado'));
 */
export function ensureExists<T> (res: T | null | undefined, error: Error): T {
    if (res === null || res === undefined) throw error;
    if (Array.isArray(res) && res.length === 0) throw error;
    
    return res as T;
}