// Copied from https://docs.sentry.io/platforms/javascript/react/
// See also https://reactjs.org/docs/hooks-faq.html#do-hooks-cover-all-use-cases-for-classes
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import * as Sentry from '@sentry/browser';

import omit from '@misakey/helpers/omit';
import BoxSection from '@misakey/ui/Box/Section';
import BoxMessage from '@misakey/ui/Box/Message';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import './ErrorBoundary.scss';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: false, error: '', errorInfo: {} };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
      this.setState({ error: error.toString(), errorInfo });
    });
  }

  handleCollapse() {
    const { collapsed } = this.state;
    this.setState({ collapsed: !collapsed });
  }

  render() {
    const { children, className, component, t, ...rest } = this.props;
    const { collapsed, error, errorInfo, hasError } = this.state;

    if (hasError) {
      // render fallback UI
      return (
        <Box
          className={clsx('ErrorBoundary', className)}
          component={component}
          {...omit(rest, ['tReady', 'i18n'])}
        >
          <BoxMessage
            text={t([`error.title.${error}`, 'error.title.default'])}
            type="error"
            mb={1}
          />
          {window.env.ENV === 'development' && (
            <>
              <Box display="flex" justifyContent="flex-end">
                <Button size="small" onClick={() => this.handleCollapse()}>
                  <ExpandMoreIcon className={clsx('icon', { collapsed })} />
                  {t('error.button.collapse')}
                </Button>
              </Box>
              <Collapse in={collapsed}>
                <BoxSection mt={1}>
                  <Typography variant="h5" component="h5">{error}</Typography>
                  <Typography color="textSecondary">{errorInfo.componentStack}</Typography>
                </BoxSection>
              </Collapse>
            </>
          )}
        </Box>

      );
    }

    // when there's not an error, render children untouched
    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  component: PropTypes.any,
  t: PropTypes.func.isRequired,
};

ErrorBoundary.defaultProps = {
  className: '',
  component: undefined,
};

export default withTranslation()(ErrorBoundary);
