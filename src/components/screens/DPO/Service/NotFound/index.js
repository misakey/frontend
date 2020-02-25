import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

import getNextSearch from '@misakey/helpers/getNextSearch';

import routes from 'routes';

import Screen from 'components/dumb/Screen';
import { BUTTON_STANDINGS } from 'components/dumb/Button';
import CardSimpleText from 'components/dumb/Card/Simple/Text';
import LinkWithDialogConnect from 'components/smart/Dialog/Connect/with/Link';

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
    height: 'inherit',
    textAlign: 'center',
    paddingBottom: theme.spacing(2),
  },
}));

function ServiceNotFound({ mainDomain, t }) {
  const classes = useStyles();

  const goToCreateApp = useMemo(() => ({
    pathname: routes.dpo.services.create,
    search: getNextSearch('', new Map([['prefill', mainDomain]])),
  }), [mainDomain]);
  return (
    <Screen>
      <Container maxWidth="md" className={classes.container}>
        <Box mb={1}>
          <Typography variant="h2" color="secondary">{404}</Typography>
        </Box>
        <Typography variant="h5" component="h3" color="textSecondary">
          {t('screens:service.notFound.title', { mainDomain })}
        </Typography>
        <Box my={4}>
          <CardSimpleText
            my={1}
            text={t('screens:service.notFound.create.text', { mainDomain })}
            button={{
              text: t('screens:service.notFound.create.button'),
              standing: BUTTON_STANDINGS.MAIN,
              component: LinkWithDialogConnect,
              to: goToCreateApp,
            }}
          />
        </Box>
      </Container>
    </Screen>
  );
}

ServiceNotFound.propTypes = {
  mainDomain: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default (withTranslation(['common', 'screens'])(ServiceNotFound));
