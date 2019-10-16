import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import getSignInHref from '@misakey/api/helpers/getSignInHref';
import ApplicationSchema from 'store/schemas/Application';

import useWidth from '@misakey/hooks/useWidth';
import displayIn from '@misakey/helpers/displayIn';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import ContactButton from 'components/smart/ContactButton';
import ApplicationImg from 'components/dumb/Application/Img';

const useStyles = makeStyles((theme) => ({
  avatar: {
    borderRadius: 0,
    [theme.breakpoints.down('sm')]: {
      width: 75,
      height: 75,
    },
    [theme.breakpoints.up('md')]: {
      width: 100,
      height: 100,
    },
  },
  letterAvatar: {
    color: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[200],
  },
}));

function ApplicationCard({
  auth,
  children,
  dpoEmail,
  homepage,
  id,
  isAuthenticated,
  location,
  logoUri,
  longDesc,
  name,
  mainDomain,
  shortDesc,
  t,
  wasContacted,
}) {
  const signInHref = getSignInHref(location);

  const classes = useStyles();
  const width = useWidth();

  return (
    <Card>
      <CardHeader
        avatar={(
          <ApplicationImg
            classes={{
              root: clsx(
                classes.avatar,
                { [classes.letterAvatar]: isEmpty(logoUri) },
              ),
            }}
            alt={name}
            src={!isEmpty(logoUri) ? logoUri : undefined}
            component="a"
            href={homepage}
            target="_blank"
          >
            {name.slice(0, 3)}
          </ApplicationImg>
        )}
        action={(isAuthenticated && displayIn(width, ['md', 'lg', 'xl'])) && (
          <ContactButton
            idToken={auth.id}
            dpoEmail={dpoEmail}
            applicationID={id}
            mainDomain={mainDomain}
            contactedView={wasContacted}
          />
        )}
        title={name}
        subheader={shortDesc}
        titleTypographyProps={{ variant: 'h6', component: 'h3' }}
      />
      <CardContent>
        {children || (
          <>
            <Typography variant="body2" color="textSecondary" component="p">
              {longDesc}
            </Typography>
            <Typography component="p">
              {isAuthenticated && <Link href={`mailto:${dpoEmail}`}>{dpoEmail}</Link>}
              {!isAuthenticated && !window.env.PLUGIN && <Link href={signInHref}>{t('screens:application.info.emailSignIn')}</Link>}
            </Typography>
          </>
        )}
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          aria-label="Go to application website (external)"
          href={homepage}
          target="_blank"
        >
          <OpenInNewIcon />
        </IconButton>
        {(isAuthenticated && displayIn(width, undefined, ['md', 'lg', 'xl'])) && (
          <ContactButton
            idToken={auth.id}
            dpoEmail={dpoEmail}
            applicationID={id}
            applicationName={name}
            contactedView={wasContacted}
          />
        )}
      </CardActions>
    </Card>
  );
}

ApplicationCard.propTypes = {
  ...ApplicationSchema.propTypes,
  auth: PropTypes.shape({ id: PropTypes.string }).isRequired,
  children: PropTypes.node,
  isAuthenticated: PropTypes.bool,
  location: PropTypes.shape({ pathname: PropTypes.string, search: PropTypes.string }).isRequired,
  t: PropTypes.func.isRequired,
  wasContacted: PropTypes.bool,
};

ApplicationCard.defaultProps = {
  children: undefined,
  isAuthenticated: false,
  wasContacted: false,
};

export default connect(
  (state) => ({
    auth: state.auth,
    isAuthenticated: !!state.auth.token,
  }),
)(withRouter(withTranslation(['common', 'screens'])(ApplicationCard)));
