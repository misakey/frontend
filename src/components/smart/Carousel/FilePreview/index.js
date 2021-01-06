import PropTypes from 'prop-types';

import { APPBAR_HEIGHT, ICONBUTTON_WIDTH } from '@misakey/ui/constants/sizes';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import invertObj from '@misakey/helpers/invertObj';
import max from '@misakey/helpers/max';
import min from '@misakey/helpers/min';
import propOr from '@misakey/helpers/propOr';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { useMemo, useCallback } from 'react';

import MobileStepper from '@material-ui/core/MobileStepper';
import IconButton from '@misakey/ui/IconButton';
import DialogFilePreview from 'components/smart/Dialog/FilePreview';

// import PrintIcon from '@material-ui/icons/Print';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

// CONSTANTS
const APP_BAR_PROPS = {
  elevation: 0,
};

const PREVIEW_MAX_HEIGHT = `calc(100vh - ${APPBAR_HEIGHT}px - ${ICONBUTTON_WIDTH}px - 16px)`;

// HOOKS
const useStyles = makeStyles((theme) => ({
  stepperRoot: {
    backgroundColor: theme.palette.background.darker,
    color: theme.palette.getContrastText(theme.palette.background.darker),
  },
  stepperPositionTop: {
    ...theme.mixins.followToolbarMinHeight(theme, 'top'),
  },
  stepperDot: {
    backgroundColor: theme.palette.darker.action.disabled,
  },
  stepperDotActive: {
    backgroundColor: theme.palette.primary.main,
  },
  paper: {
    marginTop: APPBAR_HEIGHT + ICONBUTTON_WIDTH,
  },
}));

// COMPONENTS
function FilePreviewCarousel({ open,
  onChange,
  file,
  byPagination, itemCount, loadMoreItems,
  id,
  ...props
}) {
  const classes = useStyles();
  const theme = useTheme();

  const byPaginationIndexes = useMemo(
    () => (isNil(byPagination)
      ? {}
      : invertObj(byPagination)),
    [byPagination],
  );

  const [minIndex, maxIndex] = useMemo(
    () => {
      const byPaginationNumbers = isNil(byPagination)
        ? []
        : Object.keys(byPagination).map(Number);
      return [min(byPaginationNumbers), max(byPaginationNumbers)];
    },
    [byPagination],
  );

  const activeStep = useMemo(
    () => Number(propOr(0, id, byPaginationIndexes)),
    [id, byPaginationIndexes],
  );

  const stepperVariant = useMemo(
    () => (itemCount < 5
      ? 'dots'
      : 'text'),
    [itemCount],
  );

  const shouldLoadPrevNext = useMemo(
    () => isFunction(loadMoreItems)
    && !isNil(byPagination)
    && !isNil(itemCount)
    && open
    && !isNil(minIndex)
    && !isNil(maxIndex)
    && ((activeStep === minIndex && minIndex > 0)
      || (activeStep === maxIndex && maxIndex < itemCount)),
    [
      loadMoreItems, byPagination, itemCount,
      open, activeStep, minIndex, maxIndex,
    ],
  );

  const loadPrevNext = useCallback(
    () => {
      const hasPrev = activeStep !== 0;
      const hasNext = activeStep !== itemCount - 1;
      if (!hasPrev && !hasNext) {
        return Promise.resolve();
      }
      const offset = hasPrev ? activeStep - 1 : activeStep + 1;
      if (hasNext && hasPrev) {
        return loadMoreItems({ offset, limit: 3 });
      }
      return loadMoreItems({ offset, limit: 1 });
    },
    [activeStep, itemCount, loadMoreItems],
  );

  useFetchEffect(loadPrevNext, { shouldFetch: shouldLoadPrevNext });

  const handleNext = useCallback(
    () => onChange(activeStep + 1),
    [onChange, activeStep],
  );

  const handleBack = useCallback(
    () => onChange(activeStep - 1),
    [onChange, activeStep],
  );

  return (
    <DialogFilePreview
      open={open}
      appBarProps={APP_BAR_PROPS}
      file={file}
      classes={{ paper: classes.paper }}
      maxHeight={PREVIEW_MAX_HEIGHT}
      {...props}
    >
      <MobileStepper
        elevation={4}
        classes={{
          root: classes.stepperRoot,
          positionTop: classes.stepperPositionTop,
          dot: classes.stepperDot,
          dotActive: classes.stepperDotActive,
        }}
        variant={stepperVariant}
        steps={itemCount}
        position="top"
        activeStep={activeStep}
        nextButton={(
          <IconButton
            color="darker"
            size="small"
            onClick={handleNext}
            disabled={activeStep === itemCount - 1}
          >
            {theme.direction === 'rtl' ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        )}
        backButton={(
          <IconButton
            color="darker"
            size="small"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            {theme.direction === 'rtl' ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
          </IconButton>
        )}
      />

    </DialogFilePreview>
  );
}


FilePreviewCarousel.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.shape(DecryptedFileSchema.propTypes),
  index: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  byPagination: PropTypes.object,
  itemCount: PropTypes.number,
  loadMoreItems: PropTypes.func,
  id: PropTypes.string,
};

FilePreviewCarousel.defaultProps = {
  file: null,
  index: null,
  byPagination: null,
  itemCount: null,
  loadMoreItems: null,
  id: null,
};

export default FilePreviewCarousel;
