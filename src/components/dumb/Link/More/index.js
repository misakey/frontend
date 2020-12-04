import { Trans } from 'react-i18next';

import routes from 'routes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link';

// HOOKS
const useStyles = makeStyles((theme) => ({
  moreTypography: {
    marginTop: theme.spacing(2),
  },
}));

// COMPONENTS
const LinkMore = (props) => {
  const classes = useStyles();
  return (
    <Typography className={classes.moreTypography} {...props}>
      <Trans i18nKey="auth:login.card.more">
        {'En savoir plus sur '}
        <MUILink
          color="secondary"
          to={routes.legals.privacy}
          component={Link}
          target="_blank"
          rel="noopener noreferrer"
        >
          la sécurisation de mes connexions par Misakey
        </MUILink>
      </Trans>
    </Typography>
  );
};

export default LinkMore;
