import { toast } from 'react-toastify';

/**
 * Analyse une réponse d'erreur de l'API Spring Boot et extrait :
 * - message : description lisible de l'erreur
 * - fieldErrors : objet clé/valeur pour les champs invalides
 * 
 * Si setError (de React Hook Form) est fourni, applique automatiquement les fieldErrors aux champs correspondants.
 * Si showToast est vrai (défaut true), affiche un toast toast.error avec le message.
 *
 * @param {any} error L'erreur Axios
 * @param {Function} [setError] Fonction setError de react-hook-form
 * @param {boolean} [showToast=true] Déclenche ou non un toast d'erreur
 * @returns {{ message: string, fieldErrors: Record<string, string>, status: number|null }}
 */
export const parseApiError = (error, setError = null, showToast = true) => {
  let message = 'Une erreur inattendue est survenue.';
  const fieldErrors = {};
  let status = null;

  if (error?.response) {
    status = error.response.status;
    const data = error.response.data;

    if (data) {
      // 1. Message global
      if (data.message && typeof data.message === 'string') {
        message = data.message;
      } else if (data.error && typeof data.error === 'string') {
        message = data.error;
      }

      // 2. Erreurs de validation de champs (MethodArgumentNotValidException)
      if (data.fieldErrors && typeof data.fieldErrors === 'object') {
        Object.entries(data.fieldErrors).forEach(([field, msg]) => {
          fieldErrors[field] = msg;
          if (setError) {
            setError(field, {
              type: 'server',
              message: msg,
            });
          }
        });
      }
    }

    // Messages par défaut selon le statut si aucun message clair
    if (!data?.message) {
      if (status === 400) message = 'Certaines informations saisies sont invalides.';
      else if (status === 401) message = 'Identifiants incorrects ou session expirée.';
      else if (status === 403) message = data?.message || "Accès refusé.";
      else if (status === 404) message = 'Ressource introuvable.';
      else if (status === 409) message = data?.message || 'Conflit détecté avec des données existantes.';
      else if (status >= 500) message = 'Le serveur distant a rencontré un problème. Réessayez dans un instant.';
    }
  } else if (error?.request) {
    message = 'Impossible de joindre le serveur. Vérifiez votre connexion ou que le backend est actif.';
  } else if (error?.message) {
    message = error.message;
  }

  if (showToast && message) {
    toast.error(message, {
      toastId: message.slice(0, 32),
    });
  }

  return { message, fieldErrors, status };
};
