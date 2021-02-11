import PropTypes from 'prop-types';

export const PROP_TYPES = {
  salt_base_64: PropTypes.string.isRequired,
  memory: PropTypes.number.isRequired,
  iterations: PropTypes.number.isRequired,
  parallelism: PropTypes.number.isRequired,
};
