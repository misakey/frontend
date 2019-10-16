import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import isArray from '@misakey/helpers/isArray';

const HOME_PAGE_LINK_TYPE = 'home_page';

function getHomePage(item) {
  if (!isArray(item.links)) { return undefined; }

  const found = item.links.find(({ type }) => type === HOME_PAGE_LINK_TYPE);

  return found ? found.value : undefined;
}

const entity = new schema.Entity('applications', {}, {
  idAttribute: 'mainDomain',
  processStrategy: (item) => ({
    ...item,
    homepage: getHomePage(item),
  }),
});
const collection = [entity];

const ApplicationSchema = {
  entity,
  collection,
  propTypes: {
    mainDomain: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    logoUri: PropTypes.string,
    name: PropTypes.string,
    shortDesc: PropTypes.string,
    dpoEmail: PropTypes.string,

  },
};

export default ApplicationSchema;
