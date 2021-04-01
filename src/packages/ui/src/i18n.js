import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import isObject from '@misakey/core/helpers/isObject';

import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-gb';

import numbro from 'numbro';
import numbroFR from 'numbro/languages/fr-FR';
import numbroEN from 'numbro/languages/en-GB';

// FR namespaces
import frCommonNew from '@misakey/ui/constants/locales/fr/common.json';
import frComponentsNew from 'packages/ui/src/constants/locales/fr/components.json';
import frFieldsNew from '@misakey/ui/constants/locales/fr/fields';

// FR namespaces
import enCommonNew from '@misakey/ui/constants/locales/en/common.json';
import enComponentsNew from 'packages/ui/src/constants/locales/en/components.json';
import enFieldsNew from '@misakey/ui/constants/locales/en/fields';

import countries from 'i18n-iso-countries';

const langsFr = require('i18n-iso-countries/langs/fr.json');

const DEFAULT_LANGUAGE = 'fr';
const AVAILABLE_LANGUAGES = ['fr', 'en'];

const COMMONS_NAMESPACES = {
  fr: [
    {
      name: 'common',
      ressources: frCommonNew,
    },
    {
      name: 'components',
      ressources: frComponentsNew,
    },
    {
      name: 'fields',
      ressources: frFieldsNew,
    },
  ],
  en: [
    {
      name: 'common',
      ressources: enCommonNew,
    },
    {
      name: 'components',
      ressources: enComponentsNew,
    },
    {
      name: 'fields',
      ressources: enFieldsNew,
    },
  ],
};

export default () => {
  // We should explicitly register languages to numbro to them to be available
  // If we don't, en-US is the fallback for every languages
  numbro.registerLanguage(numbroFR);
  numbro.registerLanguage(numbroEN);

  i18n
    .use(XHR)
    .use(LanguageDetector)
    .use(initReactI18next) // if not using I18nextProvider
    .init({
      debug: false, // I18N TRANS HELP: turn true
      fallbackLng: DEFAULT_LANGUAGE,
      ns: 'common',
      defaultNS: 'common',
      whitelist: AVAILABLE_LANGUAGES,
      nonExplicitWhitelist: true, // if true will pass eg. en-US if finding en in whitelist

      detection: {
        // order and from where user language should be detected
        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

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
    if (lng.startsWith('fr')) {
      moment.locale('fr');
      numbro.setLanguage('fr-FR');
    }
    if (lng.startsWith('en')) {
      // allow en-GB for numbers and dates if it's user's preferences
      if (lng === 'en-GB') {
        moment.locale('en-GB');
        numbro.setLanguage('en-GB');
      } else {
        moment.locale('en-US');
        numbro.setLanguage('en-US');
      }
    }
  };

  i18n.on('languageChanged', changeLocale);

  AVAILABLE_LANGUAGES.forEach((lng) => {
    COMMONS_NAMESPACES[lng].forEach((bundle) => {
      i18n.addResourceBundle(lng, bundle.name, bundle.ressources, true, false);
    });
  });

  countries.registerLocale(langsFr);
};
