import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import isObject from '@misakey/helpers/isObject';

import moment from 'moment';
import 'moment/locale/fr';

import numeral from 'numeral';
import 'numeral/locales/fr';

import fr from 'constants/locales/fr/common';
import frFields from 'constants/locales/fr/fields';

const DEFAULT_LNG = 'fr';

i18n
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next) // if not using I18nextProvider
  .init({
    debug: false, // I18N TRANS HELP: turn true
    fallbackLng: DEFAULT_LNG,
    ns: 'common',
    defaultNS: 'common',
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
      loadPath: `${
        (isObject(process) && isObject(process.env))
          ? process.env.PUBLIC_URL
          : ''
      }/locales/{{lng}}/{{ns}}.json`,
    },
  });

// This method may not working if locales
// are explicit vs implicit (fr-FR != fr)
// especially with common explicit languages like en-GB != en
const changeLocale = (lng) => {
  moment.locale(lng);
  numeral.locale(lng);
};

// Forcing default locale
changeLocale(DEFAULT_LNG);

i18n.on('languageChanged', changeLocale);

i18n.addResourceBundle('fr', 'common', fr, true, false);
i18n.addResourceBundle('fr', 'fields', frFields, true, false);


export default i18n;
