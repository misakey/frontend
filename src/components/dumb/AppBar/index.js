import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import { makeStyles } from '@material-ui/core/styles';
import MUIAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MUILink from '@material-ui/core/Link';
import { Link } from 'react-router-dom';
import ButtonConnect from 'components/dumb/Button/Connect';

import 'components/dumb/AppBar/index.scss';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

function AppBar({ className, t, color }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)}>
      <MUIAppBar position="static" color={color} elevation={0}>
        <Toolbar className="toolbar">
          <MUILink
            component={Link}
            to={routes._}
            color="secondary"
            variant="h6"
            underline="none"
            className="misakey-brand"
          >
            {t('projectName', 'Misakey')}
          </MUILink>
          <ButtonConnect
            className="headerButton"
          />
        </Toolbar>
      </MUIAppBar>
    </div>
  );
}

AppBar.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func.isRequired,
  color: PropTypes.oneOf(['inherit', 'primary', 'secondary', 'default']),
};

AppBar.defaultProps = {
  className: '',
  color: 'default',
};

export default withTranslation()(AppBar);
