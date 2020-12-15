import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { useParams } from 'react-router-dom';

import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';

import ScreenAction from 'components/dumb/Screen/Action';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Title from '@misakey/ui/Typography/Title';
import path from '@misakey/helpers/path';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

// COMPONENTS
const AccountDelete = ({ t, identity, isFetching }) => {
  const { id } = useParams();
  const email = path(['identifier', 'value'], identity);

  const isLoading = useMemo(
    () => isFetching || isNil(identity),
    [identity, isFetching],
  );

  const accountHome = useGeneratePathKeepingSearchAndHash(routes.identities._, { id });

  const navigationProps = useMemo(
    () => ({
      homePath: accountHome,
    }),
    [accountHome],
  );

  return (
    <ScreenAction
      title={t('account:delete.label')}
      navigationProps={navigationProps}
      isLoading={isLoading}
    >
      <Container maxWidth="md">
        <Typography color="textSecondary">
          <Trans i18nKey="account:delete.content.intro">
            La protection de vos données personnelles est notre mission.
            Vous pouvez donc à tout instant demander à tout moment la suppression de votre
            compte et des données qui y sont rattachées.
            <br />
            Cette suppression est définitive :
            nous ne gardons pas de sauvegarde de vos données une fois ces dernières supprimées.
          </Trans>
        </Typography>
        <Box my={3}>
          <Title>{t('account:delete.content.whatDeleteTitle')}</Title>
          <Typography color="textSecondary" component="div">
            <Trans i18nKey="account:delete.content.whatDeleteContent">
              Si vous faites votre demande de suppression, voici ce qui sera supprimé:
              <ul>
                <li>Votre compte, son mot de passe et les clés de votre coffre-fort</li>
                <li>Les fichiers que vous avez sauvegardés dans “Mes documents”</li>
                <li>
                  Tous les espaces sécurisés que vous avez crée, ainsi
                  que tous les échanges de vous et vos interlocuteurs dans ces espaces
                </li>
                <li>Tout votre historique de connexion et les données relatives</li>
              </ul>
            </Trans>
          </Typography>
        </Box>
        <Box my={3}>
          <Title>{t('account:delete.content.whatNotDeleteTitle')}</Title>
          <Typography color="textSecondary" component="div">
            <Trans i18nKey="account:delete.content.whatNotDeleteContent">
              Si vous faites votre demande de suppression, certaines données ne seront pas
              supprimées automatiquement
              (vous pouvez cependant les supprimer manuellement en amont):
              <ul>
                <li>
                  Les messages et fichiers chiffrés que vous avez envoyé dans des
                  espaces sécurisés que vous avez rejoins.
                </li>
                <li>
                  Les messages et fichiers que vous ne supprimez pas manuellement seront toujours
                  accessible mais seront interprétés comme étant envoyés par un utilisateur anonyme
                  (car votre identité n’existera plus dans le système)
                </li>
                <li>
                  Les fichiers que vous avez envoyés que d’autres utilisateurs ont enregistrés
                </li>
              </ul>
            </Trans>
          </Typography>
        </Box>
        <Box my={3}>
          <Title>{t('account:delete.content.howToTitle')}</Title>
          <Typography color="textSecondary">
            <Trans i18nKey="account:delete.content.howToContent">
              Si vous voulez supprimer votre compte il vous suffit d’envoyer un email à notre DPO (
              <Link href={`mailto:dpo@misakey.com?subject=${encodeURIComponent(t('account:delete.content.howToMailSubject', { email }))}`}>dpo@misakey.com</Link>
              ), en lui demandant la suppression.
              <br />
              <br />
              Nous répondrons à votre requête au plus vite, au plus tard sous 30 jours.
            </Trans>
          </Typography>
        </Box>
      </Container>
    </ScreenAction>
  );
};

AccountDelete.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,

  // withTranslation
  t: PropTypes.func.isRequired,
};

AccountDelete.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation(['common', 'account'])(AccountDelete);
