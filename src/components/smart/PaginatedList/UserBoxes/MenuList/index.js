import PropTypes from 'prop-types';

import PaginatedListUserBoxes from 'components/smart/PaginatedList/UserBoxes';
import ComponentProxy from '@misakey/ui/Component/Proxy';
import PaperMenuList from '@misakey/ui/Paper/MenuList';

// COMPONENTS
const PaginatedListUserBoxesPaperMenuList = ComponentProxy(PaginatedListUserBoxes);

PaginatedListUserBoxesPaperMenuList.propTypes = {
  component: PropTypes.elementType,
};

PaginatedListUserBoxesPaperMenuList.defaultProps = {
  component: PaperMenuList,
};

export default PaginatedListUserBoxesPaperMenuList;
