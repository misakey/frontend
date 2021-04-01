import { isValidElement, cloneElement, Children } from 'react';
import PropTypes from 'prop-types';

import { hasAllKeys, hasAllKeysAndValues } from 'helpers/searchRouting';
import isArray from '@misakey/core/helpers/isArray';
import getSearchParams from '@misakey/core/helpers/getSearchParams';

import { useLocation } from 'react-router-dom';

// COMPONENTS
// Forked from https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/Switch.js
/* MIT License

Copyright (c) React Training 2016-2018

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */
const SwitchSearch = ({ children, location: customLocation }) => {
  const contextLocation = useLocation();

  const location = customLocation || contextLocation;

  const locationSearchParams = getSearchParams(location.search);

  let element;
  let match = false;

  Children.forEach(children, (child) => {
    if (match === false && isValidElement(child)) {
      element = child;

      // @TODO integrate RedirectSearch logic once component is needed
      // From https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/Switch.js#L31
      // const path = child.props.path || child.props.from;
      const { searchParams } = child.props;

      match = isArray(searchParams)
        ? hasAllKeys(searchParams, locationSearchParams)
        : hasAllKeysAndValues(searchParams, locationSearchParams);
    }
  });

  return match
    ? cloneElement(element, { location })
    : null;
};

SwitchSearch.propTypes = {
  children: PropTypes.node,
  location: PropTypes.shape({ search: PropTypes.string }),
};

SwitchSearch.defaultProps = {
  children: null,
  location: null,
};

export default SwitchSearch;
