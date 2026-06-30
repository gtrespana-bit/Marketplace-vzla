export function useLocalizedMessages() {
  return {
    t: function(key) {
      const translations = {
        'productCard.featured': 'Destacado',
        'productCard.boost': 'Boost',
        'productCard.verified': 'Verificado',
      };
      return translations[key] || key;
    }
  };
}