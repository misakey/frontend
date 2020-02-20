import { useMemo, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// @UNUSED
function Portal({ children, elementId, tagName, className }) {
  const root = useCallback(
    () => document.getElementById(elementId),
    [elementId],
  );

  const el = useMemo(
    () => document.createElement(tagName),
    [tagName],
  );

  const clean = useCallback((node) => {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }, []);

  const insertInDOM = useCallback(() => {
    const node = root();
    node.appendChild(el);

    return () => clean(node);
  }, [clean, el, root]);

  useEffect(
    () => {
      if (el) {
        el.className = className;
      }
    },
    [el, className],
  );

  useEffect(insertInDOM, [root]);

  return ReactDOM.createPortal(children, el);
}

Portal.propTypes = {
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.node]).isRequired,
  className: PropTypes.string,
  elementId: PropTypes.string.isRequired,
  tagName: PropTypes.string,
};

Portal.defaultProps = {
  className: '',
  tagName: 'span',
};

export default Portal;
