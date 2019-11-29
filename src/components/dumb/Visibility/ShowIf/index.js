import { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import useWidth from '@misakey/hooks/useWidth';
import { isWidthUp, isWidthDown } from '@material-ui/core/withWidth';

const WIDTHS = ['xs', 'sm', 'md', 'lg', 'xl'];
const ENVS = ['development', 'preprod', 'production'];

export function isWidthBetween(width, start, end) {
  return isWidthUp(start, width) && isWidthDown(end, width);
}

export function isWidthOnly(width, match) {
  return width === match;
}

/**
 * @return {null}
 */
function ShowIf({ auth, children, custom, isAuthenticated, isEnv, isWidth, not }) {
  const width = useWidth();

  const isWidthMatching = useMemo(
    () => {
      const { up, down, only, between } = isWidth;
      const upMatching = up && isWidthUp(width, up);
      const downMatching = down && isWidthDown(width, down);
      const betweenMatching = between && isWidthBetween(width, ...between);
      const onlyMatching = only && isWidthOnly(width, only);

      return upMatching || downMatching || betweenMatching || onlyMatching;
    },
    [width, isWidth],
  );

  const isEnvMatching = useMemo(
    () => {
      const { node, plugin } = isEnv;

      const nodeMatching = node && window.env.ENV === node;
      const pluginMatching = plugin && window.env.PLUGIN;

      return nodeMatching || pluginMatching;
    },
    [isEnv],
  );

  const isAuthenticatedMatching = useMemo(
    () => isAuthenticated && auth.token,
    [auth.token, isAuthenticated],
  );

  const isCustomMatching = useMemo(
    () => custom && custom(auth, width),
    [custom, auth, width],
  );

  const atLeastOneIsMatching = useMemo(
    () => isWidthMatching || isAuthenticatedMatching || isCustomMatching || isEnvMatching,
    [isWidthMatching, isEnvMatching, isAuthenticatedMatching, isCustomMatching],
  );

  if (atLeastOneIsMatching) { return not ? null : children; }

  return null;
}

ShowIf.propTypes = {
  auth: PropTypes.shape({ token: PropTypes.string }),
  children: PropTypes.oneOf([PropTypes.node, PropTypes.string, PropTypes.number]).isRequired,
  custom: PropTypes.func,
  isAuthenticated: PropTypes.bool,
  isEnv: PropTypes.shape({
    node: PropTypes.oneOf(ENVS),
    plugin: PropTypes.bool,
  }),
  isWidth: PropTypes.shape({
    up: PropTypes.oneOf(WIDTHS),
    down: PropTypes.oneOf(WIDTHS),
    between: PropTypes.arrayOf(PropTypes.oneOf(WIDTHS)),
    only: PropTypes.oneOf(WIDTHS),
  }),
  not: PropTypes.bool,
};

ShowIf.defaultProps = {
  auth: {},
  custom: null,
  isWidth: {},
  isEnv: {},
  isAuthenticated: null,
  not: false,
};

export default connect((state) => ({ auth: state.auth }))(ShowIf);
