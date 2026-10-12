import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations';

const savedLanguage = localStorage.getItem('st_language') || 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

// Met à jour la direction RTL / LTR et la langue sur l'élément document
export const applyLanguageDirection = (lang) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);

  // Également sur les conteneurs app-shell si présents
  const shells = document.querySelectorAll('.app-shell');
  shells.forEach((el) => {
    el.setAttribute('dir', dir);
    if (lang === 'ar') {
      el.classList.add('rtl-mode');
    } else {
      el.classList.remove('rtl-mode');
    }
  });
};

// Initialisation au chargement
applyLanguageDirection(savedLanguage);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('st_language', lng);
  applyLanguageDirection(lng);
});

export default i18n;
