import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import moment from 'moment';
import 'moment/locale/fr';

import numeral from 'numeral';
import 'numeral/locales/fr';

const DEFAULT_LNG = 'fr';

i18n
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next) // if not using I18nextProvider
  .init({
    debug: false,
    fallbackLng: DEFAULT_LNG,
    defaultNS: 'main',
    lng: DEFAULT_LNG, // 'fr', // language to use
    whitelist: ['fr'],
    nonExplicitWhitelist: true, // if true will pass eg. en-US if finding en in whitelist

    detection: {
      // order and from where user language should be detected
      order: ['querystring', 'cookie', 'localStorage', 'htmlTag', 'path', 'subdomain', 'navigator'],

      // cache user language on
      caches: ['localStorage', 'cookie'],
      excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)
    },

    interpolation: {
      escapeValue: false, // not needed for react!!
    },

    // react i18next special options (optional)
    react: {
      wait: false,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      omitBoundRerender: false,
      defaultTransParent: 'span',
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

moment.locale(DEFAULT_LNG);

// This method may not working if locales
// are explicit vs implicit (fr-FR != fr)
// especially with common explicit languages like en-GB != en
const changeLocale = (lng) => {
  moment.locale(lng);
  numeral.locale(lng);
};

i18n.on('languageChanged', changeLocale);

export default i18n;
