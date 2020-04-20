import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Trans, withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';
import Screen from 'components/dumb/Screen';
import Card from 'components/dumb/Card';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles(() => ({
  typographyRoot: {
    whiteSpace: 'pre-wrap',
  },
}));


const AccessRequestError = ({ error, t }) => {
  const errorStatus = useMemo(() => error.status || 'default', [error.status]);
  const classes = useStyles();
  const appBarProps = useMemo(
    () => ({
      withUser: false,
      items: [],
    }),
    [],
  );

  return (
    <Screen appBarProps={appBarProps}>
      <Container maxWidth="md">
        <Card
          mt={2}
          title={t(`dpo:requests.access.error.${errorStatus}.title`, 'Une erreur s\'est produite')}
        >
          <Typography classes={{ root: classes.typographyRoot }}>
            <Trans i18nKey={`dpo:requests.access.error.${errorStatus}.desc`}>
              {'Une erreur s\'est produite lors de la récupération de la requête. Veuillez vérifier que vous avez bien recopié le lien qui vous a été envoyé par email. Si cela ne fonctionne toujours pas, vous pouvez nous contacter à '}
              <Link href="mailto:question.pro@misakey.com">question.pro@misakey.com</Link>
              {'. Pensez à nous joindre le lien qui ne fonctionne pas et le mail de l\'utilisateur ayant fait la demande. Veuillez-nous excuser de la gène occasionnée.'}
            </Trans>
          </Typography>
        </Card>
      </Container>
    </Screen>
  );
};

AccessRequestError.propTypes = {
  error: PropTypes.instanceOf(Error),
  t: PropTypes.func.isRequired,
};

AccessRequestError.defaultProps = {
  error: null,
};


export default withTranslation(['dpo'])(AccessRequestError);
