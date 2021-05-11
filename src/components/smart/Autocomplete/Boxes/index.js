import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { TOOLBAR_MIN_HEIGHT } from '@misakey/ui/constants/sizes';
import { HIDE_DRAWER_MAP, TEMP_DRAWER_DESKTOP_WIDTH } from '@misakey/ui/constants/drawers';
import routes from 'routes';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import propEq from '@misakey/core/helpers/propEq';
import prop from '@misakey/core/helpers/prop';
import propOrEmptyObject from '@misakey/core/helpers/propOr/emptyObject';
import sort from '@misakey/core/helpers/sort';
import complement from '@misakey/core/helpers/complement';
import alwaysNull from '@misakey/core/helpers/always/null';
import partition from '@misakey/core/helpers/partition';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useTranslation } from 'react-i18next';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Box from '@material-ui/core/Box';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@misakey/ui/Button';
import PopoverFullScreen from '@misakey/ui/Popover/FullScreen';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import Typography from '@material-ui/core/Typography';
import ChipFacet from 'components/smart/Autocomplete/Boxes/ChipFacet';
import PaginatedListUserBoxesMenuList from 'components/smart/PaginatedList/UserBoxes/MenuList';
import ListSubheader from '@material-ui/core/ListSubheader';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

// CONSTANTS
export const FACET_ORGANIZATION = 'organization';
export const FACET_DATATAG = 'datatag';
export const FACETS = [FACET_ORGANIZATION, FACET_DATATAG];

const MAX_DATATAG_OPTIONS = 3;

const TO_ROUTE = routes.boxes.read._;

// HELPERS
const facetProp = prop('facet');
const hasDatatagFacet = propEq('facet', FACET_DATATAG);
const hasOrganizationFacet = propEq('facet', FACET_ORGANIZATION);
const sortDatatagsFirst = sort(({ facet: facetA }, { facet: facetB }) => {
  const aDatatag = facetA === FACET_DATATAG;
  const bDatatag = facetB === FACET_DATATAG;
  if ((aDatatag && bDatatag) || (!aDatatag && !bDatatag)) {
    return 0;
  }
  if (aDatatag) {
    return -1;
  }
  return 1;
});

const waitAnimationTimeout = (fn) => setTimeout(fn, 300);

// HOOKS
const useStyles = makeStyles((theme) => ({
  paper: {
    boxShadow: 'none',
    margin: 0,
  },
  option: {
    minHeight: 'auto',
    alignItems: 'flex-start',
    padding: 8,
  },
  popper: {
    height: '100%',
  },
  popperDisablePortal: {
    position: 'relative',
  },
  listbox: {
    paddingBottom: theme.spacing(0),
    maxHeight: 'none',
  },
  input: {
    display: 'flex',
    justifyContent: 'flex-start',
    borderRadius: 0,
    padding: theme.spacing(0, 0, 0, 1),
  },
  boxInput: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: TOOLBAR_MIN_HEIGHT,
    display: 'flex',
  },
  buttonSearch: {
    borderRadius: theme.shape.borderRadius,
    justifyContent: 'flex-start',
  },
  groupLabel: {
    textTransform: 'uppercase',
    backgroundColor: theme.palette.background.paper,
    top: -8,
  },
  /* Styles applied to the group's ul elements. */
  groupUl: {
    padding: 0,
    '& $option': {
      paddingLeft: 24,
    },
  },
  chipList: {
    display: 'flex',
    flexDirection: 'row',
    listStyle: 'none',
    flexWrap: 'wrap',
    padding: theme.spacing(1, 2),
  },
  popoverPaper: ({ fullScreen }) => (fullScreen ? {} : {
    [theme.breakpoints.up('md')]: {
      width: TEMP_DRAWER_DESKTOP_WIDTH,
    },
    height: '100%',
  }),
}));

// COMPONENTS
const AutocompleteBoxes = ({
  value, options,
  onChange, buttonProps,
  anchorPosition, fullScreen,
  ...props }) => {
  const classes = useStyles({ fullScreen });
  const [showMore, setShowMore] = useState(false);

  const sortedOptions = useMemo(
    () => sortDatatagsFirst(options),
    [options],
  );

  const search = useMemo(
    () => {
      const { id: ownerOrgId } = propOrEmptyObject('0', value.filter(hasOrganizationFacet));
      const { id: datatagId } = propOrEmptyObject('0', value.filter(hasDatatagFacet));
      const orgSearch = !isNil(ownerOrgId);
      const datatagSearch = !isNil(datatagId);
      if (orgSearch) {
        if (datatagSearch) {
          return {
            ownerOrgId,
            datatagId,
          };
        }
        return {
          ownerOrgId,
        };
      }
      if (datatagSearch) {
        return {
          datatagId,
        };
      }
      return null;
    },
    [value],
  );

  const { t } = useTranslation(['common', 'boxes', 'datatags']);
  const isXs = useXsMediaQuery();

  const [open, setOpen] = useState(false);
  const { text, startIcon, endIcon } = useSafeDestr(buttonProps);

  const datatagFacetSelected = useMemo(
    () => value.some(hasDatatagFacet),
    [value],
  );

  const organizationFacetSelected = useMemo(
    () => value.some(hasOrganizationFacet),
    [value],
  );

  const onClick = useCallback(
    () => {
      setOpen(true);
    },
    [setOpen],
  );

  const onClose = useCallback(
    () => {
      setOpen(false);
      waitAnimationTimeout(() => {
        setShowMore(false);
      });
    },
    [setOpen, setShowMore],
  );

  const onAutocompleteClose = useCallback(
    (event, reason) => {
      if (reason === 'escape' || reason === 'select-option') {
        onClose();
      }
    },
    [onClose],
  );

  const onShowMore = useCallback(
    () => {
      setShowMore(true);
    },
    [setShowMore],
  );

  const renderOption = useCallback(
    ({ moreCount, name, facet }) => {
      if (!isNil(moreCount)) {
        return (
          <Typography color="primary">{t('common:moreCount', { count: moreCount })}</Typography>
        );
      }
      if (facet === FACET_DATATAG) {
        return <Typography>{t(`datatags:${name}`)}</Typography>;
      }
      return <Typography>{name}</Typography>;
    },
    [t],
  );

  const renderGroup = useCallback(
    ({ key, group, children }) => (
      <li key={key}>
        <ListSubheader className={classes.groupLabel} component="div">
          {t(`boxes:list.search.facets.${group}`)}
        </ListSubheader>
        <ul className={classes.groupUl}>{children}</ul>
      </li>
    ),
    [classes.groupLabel, classes.groupUl, t],
  );

  const handleChange = useCallback(
    (event, newValue) => {
      const [moreOptions, otherOptions] = partition(newValue, ({ moreCount }) => !isNil(moreCount));
      if (!isEmpty(moreOptions)) {
        onShowMore();
      }
      onChange(event, otherOptions);
    },
    [onChange, onShowMore],
  );

  const onDelete = useCallback(
    (event, id) => {
      const newValue = value.filter(({ id: optionId }) => optionId !== id);
      onChange(event, newValue);
    },
    [onChange, value],
  );

  const handleOrganizationFacetFilter = useCallback(
    (list) => (organizationFacetSelected
      ? list.filter(complement(hasOrganizationFacet))
      : list),
    [organizationFacetSelected],
  );

  const handleDatatagFacetFilter = useCallback(
    (list) => {
      const [datatagOptions, otherOptions] = partition(list, hasDatatagFacet);
      if (datatagFacetSelected) {
        return otherOptions;
      }
      const { length } = datatagOptions;
      if (!showMore && length > MAX_DATATAG_OPTIONS) {
        const limitedDatatagOptions = datatagOptions
          .slice(0, MAX_DATATAG_OPTIONS)
          .concat([{ facet: FACET_DATATAG, moreCount: length - MAX_DATATAG_OPTIONS }]);
        return [...limitedDatatagOptions, ...otherOptions];
      }
      return list;
    },
    [datatagFacetSelected, showMore],
  );

  const handleFilterOptions = useCallback(
    (list) => {
      const datatagFiltered = handleDatatagFacetFilter(list);
      return handleOrganizationFacetFilter(datatagFiltered);
    },
    [handleDatatagFacetFilter, handleOrganizationFacetFilter],
  );

  const getOptionSelected = useCallback(
    ({ id }, { id: selectedId }) => id === selectedId,
    [],
  );

  return (
    <>
      <Button
        onClick={onClick}
        fullWidth={isXs}
        className={classes.buttonSearch}
        {...buttonProps}
      />
      <PopoverFullScreen
        classes={{ paper: classes.popoverPaper }}
        fullScreen={fullScreen}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        open={open}
        onClose={onClose}
        PaperProps={{
          component: PaginatedListUserBoxesMenuList,
          search,
          toRoute: TO_ROUTE,
          nextSearchMap: HIDE_DRAWER_MAP,
          onClick: onClose,
        }}
      >
        <Autocomplete
          classes={{
            paper: classes.paper,
            option: classes.option,
            popperDisablePortal: classes.popperDisablePortal,
            listbox: classes.listbox,
            input: classes.input,
            groupLabel: classes.groupLabel,
          }}
          value={value}
          onClose={onAutocompleteClose}
          onChange={handleChange}
          options={sortedOptions}
          filterOptions={handleFilterOptions}
          getOptionSelected={getOptionSelected}
          renderOption={renderOption}
          groupBy={facetProp}
          renderInput={(params) => (
            <>
              <Box
                className={classes.boxInput}
                ref={params.InputProps.ref}
                pl={2}
              >
                <IconButtonAppBar
                  aria-label={t('common:goBack')}
                  edge="start"
                  onClick={onClose}
                >
                  <ArrowBackIcon />
                </IconButtonAppBar>
                <Button
                  fullWidth
                  {...params.inputProps}
                  text={text}
                  startIcon={startIcon}
                  endIcon={endIcon}
                />
              </Box>
              <Box
                component="ul"
                className={classes.chipList}
              >
                {value.map(({ name, id }) => (
                  <li key={name}>
                    <ChipFacet id={id} label={name} onDelete={onDelete} />
                  </li>
                ))}
              </Box>
            </>
          )}
          fullWidth
          disablePortal
          multiple
          open
          disableCloseOnSelect
          renderTags={alwaysNull}
          renderGroup={renderGroup}
          noOptionsText={null}
          {...props}
        />
        <ListSubheader
          className={classes.groupLabel}
          component="div"
        >
          {t('boxes:list.search.boxes')}
        </ListSubheader>
      </PopoverFullScreen>
    </>
  );
};

AutocompleteBoxes.propTypes = {
  anchorPosition: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
  }).isRequired,
  fullScreen: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    facet: PropTypes.oneOf([FACET_DATATAG, FACET_ORGANIZATION]),
  })),
  value: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
  buttonProps: PropTypes.object,
};

AutocompleteBoxes.defaultProps = {
  fullScreen: false,
  width: null,
  buttonProps: {},
  options: [],
};

export default AutocompleteBoxes;
