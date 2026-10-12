/**
 * Utilitaires pour le mode mock de développement / démonstration.
 */

export const isMockEnabled = () => {
  return import.meta.env.VITE_USE_MOCKS === 'true';
};

/**
 * Simule une latence réseau entre min et max ms
 * @param {number} [min=300]
 * @param {number} [max=600]
 * @returns {Promise<void>}
 */
export const delay = (min = 300, max = 600) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Emballe des données dans un format de réponse paginée Spring Boot
 */
export const mockPagedResponse = (items, page = 0, size = 10) => {
  const start = page * size;
  const content = items.slice(start, start + size);
  return {
    content,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size) || 1,
    number: page,
    size,
    first: page === 0,
    last: page >= Math.ceil(items.length / size) - 1,
    empty: content.length === 0,
  };
};
