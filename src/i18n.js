import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import isObject from '@misakey/helpers/isObject';

import moment from 'moment';
import 'moment/locale/fr';

import numeral from 'numeral';
import 'numeral/locales/fr';

// FR namespaces
import frCommonNew from 'constants/locales/fr/common__new';
import frComponentsNew from 'constants/locales/fr/components__new';
import frFieldsNew from 'constants/locales/fr/fields__new';
import frLandingNew from 'constants/locales/fr/landing__new';

const DEFAULT_LANGUAGE = 'fr';
const AVAILABLE_LANGUAGES = ['fr'];

const COMMONS_NAMESPACES = {
  fr: [
    {
      name: 'common__new',
      ressources: frCommonNew,
    },
    {
      name: 'components__new',
      ressources: frComponentsNew,
    },
    {
      name: 'fields__new',
      ressources: frFieldsNew,
    },
    {
      name: 'landing__new',
      ressources: frLandingNew,
    },
  ],
};

i18n
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next) // if not using I18nextProvider
  .init({
    debug: true, // I18N TRANS HELP: turn true
    fallbackLng: DEFAULT_LANGUAGE,
    ns: 'common__new',
    defaultNS: 'common__new',
    lng: DEFAULT_LANGUAGE, // 'fr', // language to use
    whitelist: AVAILABLE_LANGUAGES,
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
changeLocale(DEFAULT_LANGUAGE);

i18n.on('languageChanged', changeLocale);


AVAILABLE_LANGUAGES.forEach((lng) => {
  COMMONS_NAMESPACES[lng].forEach((bundle) => {
    i18n.addResourceBundle(lng, bundle.name, bundle.ressources, true, false);
  });
});

export default i18n;
