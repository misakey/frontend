import beforeSend from '.';

describe('test helper sentryBeforeSend', () => {
  const EVENT = {
    exception: {
      values: [
        {
          type: 'Error',
          value: 'Test 2',
          stacktrace: {
            frames: [
              {
                colno: 69,
                filename: 'https://app.misakey.com.local/static/js/main.chunk.js',
                function: '?',
                in_app: true,
                lineno: 1,
              },
              {
                colno: 19,
                filename: 'webpackJsonpCallback@https://app.misakey.com.local/static/js/bundle.js',
                function: '?',
                in_app: true,
                lineno: 33,
              },
              {
                colno: 23,
                filename: 'https://app.misakey.com.local/static/js/bundle.js',
                function: 'checkDeferredModules',
                in_app: true,
                lineno: 46,
              },
            ],
          },
          mechanism: {
            handled: true,
            type: 'generic',
          },
        },
      ],
    },
    level: 'error',
    event_id: 'a351d67eed3c4cd69d3d77d340030c53',
    platform: 'javascript',
    sdk: {
      name: 'sentry.javascript.browser',
      packages: [
        {
          name: 'npm:@sentry/browser',
          version: '5.17.0',
        },
      ],
      version: '5.17.0',
      integrations: [
        'InboundFilters',
        'FunctionToString',
        'TryCatch',
        'Breadcrumbs',
        'GlobalHandlers',
        'LinkedErrors',
        'UserAgent',
      ],
    },
    timestamp: 1607701338.387,
    environment: 'development',
    release: 'frontend@VERSION_TO_SET_ON_BUILD',
    extra: {
      componentStack: '\ndiv\nStyledComponent@https://app.misakey.com.local/static/js/29.chunk.js:17566:22\ndiv\nStyledComponent@https://app.misakey.com.local/static/js/29.chunk.js:17566:22\nToolbar@https://app.misakey.com.local/static/js/29.chunk.js:10562:17\nWithStyles@https://app.misakey.com.local/static/js/29.chunk.js:17793:25\nheader\nPaper@https://app.misakey.com.local/static/js/29.chunk.js:9154:17\nWithStyles@https://app.misakey.com.local/static/js/29.chunk.js:17793:25\nAppBar@https://app.misakey.com.local/static/js/29.chunk.js:1927:17\nWithStyles@https://app.misakey.com.local/static/js/29.chunk.js:17793:25\nAppBar@https://app.misakey.com.local/static/js/5.chunk.js:2599:22\nAppBarDrawer@https://app.misakey.com.local/static/js/11.chunk.js:9724:18\nElevationScroll@https://app.misakey.com.local/static/js/11.chunk.js:918:18\nBoxEditEventContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:2809:18\nBoxEvents@https://app.misakey.com.local/static/js/12.chunk.js:2824:13\nI18nextWithTranslation@https://app.misakey.com.local/static/js/29.chunk.js:148863:26\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\ndiv\nInputBoxesUpload@https://app.misakey.com.local/static/js/12.chunk.js:7255:13\nI18nextWithTranslation@https://app.misakey.com.local/static/js/29.chunk.js:148863:26\nInputBoxesUploadContext@https://app.misakey.com.local/static/js/12.chunk.js:7117:18\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nFilePreviewContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:6734:18\nBoxReadContextProvider@https://app.misakey.com.local/static/js/12.chunk.js:6874:18\nBoxRead@https://app.misakey.com.local/static/js/12.chunk.js:6144:15\nBoxEventSubmitContextProvider@https://app.misakey.com.local/static/js/12.chunk.js:6795:18\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nRouteAuthenticatedBoxRead@https://app.misakey.com.local/static/js/12.chunk.js:8486:24\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nBoxes@https://app.misakey.com.local/static/js/12.chunk.js:6459:15\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nBoxesContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:4216:22\ndiv\nStyledComponent@https://app.misakey.com.local/static/js/29.chunk.js:17566:22\nScreenDrawerContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:9909:24\nHome@https://app.misakey.com.local/static/js/11.chunk.js:1996:125\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nSuspense\nBoxesApp\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nSuspense\nApp\nOidcProvider@https://app.misakey.com.local/static/js/main.chunk.js:3739:18\nErrorBoundary@https://app.misakey.com.local/static/js/main.chunk.js:9326:147\nI18nextWithTranslation@https://app.misakey.com.local/static/js/29.chunk.js:148863:26\nOfflineContextProvider@https://app.misakey.com.local/static/js/main.chunk.js:459:23\nSnackbarProvider@https://app.misakey.com.local/static/js/29.chunk.js:100332:24\nSnackbarProvider@https://app.misakey.com.local/static/js/main.chunk.js:627:18\nRouter@https://app.misakey.com.local/static/js/29.chunk.js:151424:30\nThemeProvider@https://app.misakey.com.local/static/js/29.chunk.js:16497:18\nThemeProvider@https://app.misakey.com.local/static/js/main.chunk.js:700:18\nPersistGate@https://app.misakey.com.local/static/js/29.chunk.js:158080:20\nProvider@https://app.misakey.com.local/static/js/29.chunk.js:149292:15\nSuspense',
      hint: 'ErrorBoundary',
    },
    breadcrumbs: [
      {
        timestamp: 1607701293.688,
        category: 'xhr',
        data: {
          method: 'GET',
          url: 'https://auth.misakey.com.local/_/.well-known/jwks.json',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701293.814,
        category: 'navigation',
        data: {
          from: '/callback#csrf_token=da10430b49004aa2aa74f2f2905d4138&expires_in=120&expiry=2020-12-11T15:43:31Z&id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6InB1YmxpYzoxZTljM2RkNy1iNDUyLTRjZmItOTMyYy02MDg0NGU2YWQ5YTkiLCJ0eXAiOiJKV1QifQ.eyJhY3IiOiIyIiwiYWlkIjoiMWRkM2FlZjUtZjViYy00ZjA4LWFhNGUtZTI2Zjc0NTU3NmFkIiwiYW1yIjpbImJyb3dzZXJfY29va2llIl0sImF0X2hhc2giOiI3OWg3U21saUVOZTNzQmxQQVljeldnIiwiYXVkIjpbIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCJdLCJhdXRoX3RpbWUiOjE2MDc3MDA0NDEsImVtYWlsIjoiY2xhaXJlLmRoZW5pbkBnbWFpbC5jb20iLCJleHAiOjE2MDc3MDE0MTEsImlhdCI6MTYwNzcwMTI5MSwiaXNzIjoiaHR0cHM6Ly9hdXRoLm1pc2FrZXkuY29tLmxvY2FsL18vIiwianRpIjoiODRmMmMwY2ItOGRkOC00Y2YzLWI2NmItOWY2YjhhY2JlMTgzIiwibWlkIjoiZDEzMjYxZDAtYWIxZS00OTU2LTkxZWQtZmI4MGIwMjllNjk5Iiwibm9uY2UiOiJlZTg4MWFkMDdmYWI0MTRjYTU0ZDQxNGUyZGJhNDVlYyIsInJhdCI6MTYwNzcwMTI5MSwic2NvIjoib3BlbmlkIHRvcyBwcml2YWN5X3BvbGljeSIsInNpZCI6Ijg4MzIwYzJjLTE3NTMtNDQwMS1iYTg5LWM3ZWRkYjQyNTgwOCIsInN1YiI6IjI1ZTljM2ZjLWEyNGUtNDY1NC1iYjUzLTkwM2MzMTFlYTBhNSJ9.fUE_0DIrSxZ0TcuR13LzPNVYcVY57WghDVG3IC1XHDbPd9BWXYyJFKawcHtK6kbEVfcCeQWlz_kg8qoKJz0w5f9q7QO0C2WObXw2TAIxhKUW8oOSPUJTl1O39g0fKIqJP7tWyZQVphMMcpdas9fjJu6IdNTf81P5ogz1lqA5LELeLxG1qcZjdlnXR05yiIINfk8GHNQE7nxWGePfT-MrN3b4T738oN5tQi75bSvOYoLHDyn0B-aqhU3KKPW36_MFQzQUlEp_59LXee5_KGspTO37oLebUWPMQNZrSk-jUN1sbWmszh-kE_c0gcnyuKzMgHm9galhz8jVk1Y4Mt_V-Oa0Cn1JD2jSA8xmGPZvlFbF2E_MJQe-JyIvFLWpU11A-V1CADuSr8eC4GWCbFol7Cm0Rhap3C6THW_K2htdLVyGsBKBuZQhUR7wvBJrFG9cf-taWRtjIUy7AWN1BZ4rptsr4-i9vPaIgo2zUWtzhiUmz0Y_JYHTNBSQS8SzvaUjoJ8SEK_hIhW2HVUUGnkOrM_lFyPaUrDX9T0HxXe1dU7zQM-VjJHN1KepK42U08ZJobHsC4TXQYBvlrl6CUtwaaCsCmO7WwbVbiykThOQajJWf2As4xK4_rwQa3EuQFFdw4xzNUYHY6_km12fe6B6BwwWOXnG1ct59k_HbYU45mM&scope=openid+tos+privacy_policy&state=bc8409977f4040d6a95c76cc1d8db015',
          to: '/boxes/e989f6fd-7b01-4e1b-b05b-5ad41bc71af3#0umtxSnplAKcpPrcyeCVJMzlOXlUG_PCzINSy8QA0L8',
        },
      },
      {
        timestamp: 1607701294.612,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://api.misakey.com.local/identities/d13261d0-ab1e-4956-91ed-fb80b029e699',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701295.359,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://api.misakey.com.local/accounts/1dd3aef5-f5bc-4f08-aa4e-e26f745576ad/backup',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701295.578,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://api.misakey.com.local/backup-key-shares/CvGyksOqoj9v5ejTH7eaEGVa4D2jWx06syQDqdAqZyxryYBMuxDumwrm8mFfazS2y6PV0RUx5VQ4r9Abt0hREw',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701295.801,
        category: 'xhr',
        data: {
          method: 'GET',
          url: '/locales/fr/boxes.json',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701296.143,
        category: 'xhr',
        data: {
          method: 'GET',
          url: '/locales/fr/document.json',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701296.929,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://api.misakey.com.local/identities/d13261d0-ab1e-4956-91ed-fb80b029e699/notifications?offset=0&limit=1',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701297.008,
        category: 'fetch',
        data: {
          method: 'HEAD',
          url: 'https://api.misakey.com.local/identities/d13261d0-ab1e-4956-91ed-fb80b029e699/notifications',
          status_code: 204,
        },
        type: 'http',
      },
      {
        timestamp: 1607701297.054,
        category: 'fetch',
        data: {
          method: 'HEAD',
          url: 'https://api.misakey.com.local/boxes/joined',
          status_code: 204,
        },
        type: 'http',
      },
      {
        timestamp: 1607701297.357,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://api.misakey.com.local/boxes/e989f6fd-7b01-4e1b-b05b-5ad41bc71af3',
          status_code: 403,
        },
        type: 'http',
      },
      {
        timestamp: 1607701297.705,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://api.misakey.com.local/boxes/joined?with_blob_count=true&order_by=updated_at%20DESC&offset=0&limit=14',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701298.937,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://api.misakey.com.local/boxes/e989f6fd-7b01-4e1b-b05b-5ad41bc71af3/public?invitation_share_hash=WTptejJU9QfYhaTNcFM1c0XO7SEVxr_3-b6oSA2eacETgJpAENQKDipQHMKg65MaveeBU31wMZiBQapfKmWC4w',
          status_code: 404,
        },
        type: 'http',
      },
      {
        timestamp: 1607701337.271,
        category: 'navigation',
        data: {
          from: '/boxes/e989f6fd-7b01-4e1b-b05b-5ad41bc71af3#0umtxSnplAKcpPrcyeCVJMzlOXlUG_PCzINSy8QA0L8',
          to: '/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88',
        },
      },
      {
        timestamp: 1607701337.959,
        category: 'navigation',
        data: {
          from: '/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88',
          to: '/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#cCo4nJMF6ZfckQlh8bV0mKUnd5Q31MV7QsF3ZU1l1T8',
        },
      },
      {
        timestamp: 1607701337.96,
        category: 'navigation',
        data: {
          from: '/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#cCo4nJMF6ZfckQlh8bV0mKUnd5Q31MV7QsF3ZU1l1T8',
          to: '/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#cCo4nJMF6ZfckQlh8bV0mKUnd5Q31MV7QsF3ZU1l1T8',
        },
      },
      {
        timestamp: 1607701337.963,
        category: 'console',
        data: {
          arguments: [
            'The above error occurred in the <div> component:\n\ndiv\nStyledComponent@https://app.misakey.com.local/static/js/29.chunk.js:17566:22\ndiv\nStyledComponent@https://app.misakey.com.local/static/js/29.chunk.js:17566:22\nToolbar@https://app.misakey.com.local/static/js/29.chunk.js:10562:17\nWithStyles@https://app.misakey.com.local/static/js/29.chunk.js:17793:25\nheader\nPaper@https://app.misakey.com.local/static/js/29.chunk.js:9154:17\nWithStyles@https://app.misakey.com.local/static/js/29.chunk.js:17793:25\nAppBar@https://app.misakey.com.local/static/js/29.chunk.js:1927:17\nWithStyles@https://app.misakey.com.local/static/js/29.chunk.js:17793:25\nAppBar@https://app.misakey.com.local/static/js/5.chunk.js:2599:22\nAppBarDrawer@https://app.misakey.com.local/static/js/11.chunk.js:9724:18\nElevationScroll@https://app.misakey.com.local/static/js/11.chunk.js:918:18\nBoxEditEventContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:2809:18\nBoxEvents@https://app.misakey.com.local/static/js/12.chunk.js:2824:13\nI18nextWithTranslation@https://app.misakey.com.local/static/js/29.chunk.js:148863:26\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\ndiv\nInputBoxesUpload@https://app.misakey.com.local/static/js/12.chunk.js:7255:13\nI18nextWithTranslation@https://app.misakey.com.local/static/js/29.chunk.js:148863:26\nInputBoxesUploadContext@https://app.misakey.com.local/static/js/12.chunk.js:7117:18\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nFilePreviewContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:6734:18\nBoxReadContextProvider@https://app.misakey.com.local/static/js/12.chunk.js:6874:18\nBoxRead@https://app.misakey.com.local/static/js/12.chunk.js:6144:15\nBoxEventSubmitContextProvider@https://app.misakey.com.local/static/js/12.chunk.js:6795:18\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nRouteAuthenticatedBoxRead@https://app.misakey.com.local/static/js/12.chunk.js:8486:24\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nBoxes@https://app.misakey.com.local/static/js/12.chunk.js:6459:15\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nBoxesContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:4216:22\ndiv\nStyledComponent@https://app.misakey.com.local/static/js/29.chunk.js:17566:22\nScreenDrawerContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:9909:24\nHome@https://app.misakey.com.local/static/js/11.chunk.js:1996:125\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nSuspense\nBoxesApp\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nSuspense\nApp\nOidcProvider@https://app.misakey.com.local/static/js/main.chunk.js:3739:18\nErrorBoundary@https://app.misakey.com.local/static/js/main.chunk.js:9326:147\nI18nextWithTranslation@https://app.misakey.com.local/static/js/29.chunk.js:148863:26\nOfflineContextProvider@https://app.misakey.com.local/static/js/main.chunk.js:459:23\nSnackbarProvider@https://app.misakey.com.local/static/js/29.chunk.js:100332:24\nSnackbarProvider@https://app.misakey.com.local/static/js/main.chunk.js:627:18\nRouter@https://app.misakey.com.local/static/js/29.chunk.js:151424:30\nThemeProvider@https://app.misakey.com.local/static/js/29.chunk.js:16497:18\nThemeProvider@https://app.misakey.com.local/static/js/main.chunk.js:700:18\nPersistGate@https://app.misakey.com.local/static/js/29.chunk.js:158080:20\nProvider@https://app.misakey.com.local/static/js/29.chunk.js:149292:15\nSuspense\n\nReact will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.',
          ],
          logger: 'console',
        },
        level: 'error',
        message: 'The above error occurred in the <div> component:\n\ndiv\nStyledComponent@https://app.misakey.com.local/static/js/29.chunk.js:17566:22\ndiv\nStyledComponent@https://app.misakey.com.local/static/js/29.chunk.js:17566:22\nToolbar@https://app.misakey.com.local/static/js/29.chunk.js:10562:17\nWithStyles@https://app.misakey.com.local/static/js/29.chunk.js:17793:25\nheader\nPaper@https://app.misakey.com.local/static/js/29.chunk.js:9154:17\nWithStyles@https://app.misakey.com.local/static/js/29.chunk.js:17793:25\nAppBar@https://app.misakey.com.local/static/js/29.chunk.js:1927:17\nWithStyles@https://app.misakey.com.local/static/js/29.chunk.js:17793:25\nAppBar@https://app.misakey.com.local/static/js/5.chunk.js:2599:22\nAppBarDrawer@https://app.misakey.com.local/static/js/11.chunk.js:9724:18\nElevationScroll@https://app.misakey.com.local/static/js/11.chunk.js:918:18\nBoxEditEventContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:2809:18\nBoxEvents@https://app.misakey.com.local/static/js/12.chunk.js:2824:13\nI18nextWithTranslation@https://app.misakey.com.local/static/js/29.chunk.js:148863:26\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\ndiv\nInputBoxesUpload@https://app.misakey.com.local/static/js/12.chunk.js:7255:13\nI18nextWithTranslation@https://app.misakey.com.local/static/js/29.chunk.js:148863:26\nInputBoxesUploadContext@https://app.misakey.com.local/static/js/12.chunk.js:7117:18\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nFilePreviewContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:6734:18\nBoxReadContextProvider@https://app.misakey.com.local/static/js/12.chunk.js:6874:18\nBoxRead@https://app.misakey.com.local/static/js/12.chunk.js:6144:15\nBoxEventSubmitContextProvider@https://app.misakey.com.local/static/js/12.chunk.js:6795:18\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nRouteAuthenticatedBoxRead@https://app.misakey.com.local/static/js/12.chunk.js:8486:24\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nBoxes@https://app.misakey.com.local/static/js/12.chunk.js:6459:15\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nBoxesContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:4216:22\ndiv\nStyledComponent@https://app.misakey.com.local/static/js/29.chunk.js:17566:22\nScreenDrawerContextProvider@https://app.misakey.com.local/static/js/11.chunk.js:9909:24\nHome@https://app.misakey.com.local/static/js/11.chunk.js:1996:125\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nSuspense\nBoxesApp\nRoute@https://app.misakey.com.local/static/js/29.chunk.js:151789:29\nSwitch@https://app.misakey.com.local/static/js/29.chunk.js:151991:29\nSuspense\nApp\nOidcProvider@https://app.misakey.com.local/static/js/main.chunk.js:3739:18\nErrorBoundary@https://app.misakey.com.local/static/js/main.chunk.js:9326:147\nI18nextWithTranslation@https://app.misakey.com.local/static/js/29.chunk.js:148863:26\nOfflineContextProvider@https://app.misakey.com.local/static/js/main.chunk.js:459:23\nSnackbarProvider@https://app.misakey.com.local/static/js/29.chunk.js:100332:24\nSnackbarProvider@https://app.misakey.com.local/static/js/main.chunk.js:627:18\nRouter@https://app.misakey.com.local/static/js/29.chunk.js:151424:30\nThemeProvider@https://app.misakey.com.local/static/js/29.chunk.js:16497:18\nThemeProvider@https://app.misakey.com.local/static/js/main.chunk.js:700:18\nPersistGate@https://app.misakey.com.local/static/js/29.chunk.js:158080:20\nProvider@https://app.misakey.com.local/static/js/29.chunk.js:149292:15\nSuspense\n\nReact will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.',
      },
      {
        timestamp: 1607701338.282,
        category: 'ui.click',
        message: 'span',
      },
      {
        timestamp: 1607701338.329,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://app.misakey.com.local/static/js/main.chunk.js',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701338.334,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://app.misakey.com.local/static/js/bundle.js',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701338.335,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://app.misakey.com.local/static/js/29.chunk.js',
          status_code: 200,
        },
        type: 'http',
      },
      {
        timestamp: 1607701338.335,
        category: 'fetch',
        data: {
          method: 'GET',
          url: 'https://app.misakey.com.local/static/js/12.chunk.js',
          status_code: 200,
        },
        type: 'http',
      },
    ],
    request: {
      url: 'https://app.misakey.com.local/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88#cCo4nJMF6ZfckQlh8bV0mKUnd5Q31MV7QsF3ZU1l1T8',
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0',
      },
    },
  };

  it('should hide private information from browser url metadata', () => {
    const safeEvent = beforeSend(EVENT);

    expect(safeEvent.request.url).toEqual('https://app.misakey.com.local/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88<hash_hidden>');

    expect(safeEvent.breadcrumbs[1].data.from).toEqual('/callback<hash_hidden>');
    expect(safeEvent.breadcrumbs[1].data.to).toEqual('/boxes/e989f6fd-7b01-4e1b-b05b-5ad41bc71af3<hash_hidden>');

    expect(safeEvent.breadcrumbs[13].data.from).toEqual('/boxes/e989f6fd-7b01-4e1b-b05b-5ad41bc71af3<hash_hidden>');
    expect(safeEvent.breadcrumbs[13].data.to).toEqual(EVENT.breadcrumbs[13].data.to);

    expect(safeEvent.breadcrumbs[14].data.from).toEqual(EVENT.breadcrumbs[14].data.from);
    expect(safeEvent.breadcrumbs[14].data.to).toEqual('/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88<hash_hidden>');

    expect(safeEvent.breadcrumbs[15].data.from).toEqual('/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88<hash_hidden>');
    expect(safeEvent.breadcrumbs[15].data.to).toEqual('/boxes/c4f390ad-4959-4cd1-949c-2e33d9db6b88<hash_hidden>');
  });
});
