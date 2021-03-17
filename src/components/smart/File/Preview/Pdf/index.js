import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import FILE_PROP_TYPES from '@misakey/ui/constants/file/proptypes';

import { getPage, getDocument } from '@misakey/helpers/pdf';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import range from '@misakey/helpers/range';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useIntersectionObservers from '@misakey/hooks/useIntersectionObservers';
import useScrollAnimation from '@misakey/hooks/useScrollAnimation';

import Box from '@material-ui/core/Box';
import MobileStepper from '@material-ui/core/MobileStepper';
import Grow from '@material-ui/core/Grow';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

// CONSTANTS
const START_PAGE = 1;

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.palette.background.message,
    color: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
  },
  stepperRoot: {
    backgroundColor: theme.palette.background.darker,
    color: theme.palette.getContrastText(theme.palette.background.darker),
    padding: theme.spacing(0, 1),
    position: 'absolute',
    top: 0,
  },
  loader: {
    position: 'absolute',
  },
  boxOverflow: {
    overflowY: 'auto',
  },
  canvasFit: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
}));

// COMPONENTS
const PdfPreview = ({ file, fallbackView, maxHeight }) => {
  const classes = useStyles({ maxHeight });
  const { t } = useTranslation(['components', 'common']);
  const { enqueueSnackbar } = useSnackbar();

  const [pdfDoc, setPdfDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(START_PAGE);

  const { numPages } = useSafeDestr(pdfDoc);

  const pagesRange = useMemo(
    () => range(numPages),
    [numPages],
  );

  const canvasesRef = useMemo(
    () => [],
    [],
  );
  const makeCanvasRef = useCallback(
    (index) => (node) => {
      canvasesRef[index] = node;
    },
    [canvasesRef],
  );
  const shouldBind = useMemo(
    () => canvasesRef.length === numPages,
    [canvasesRef.length, numPages],
  );

  const rootRef = useRef();
  const taskRef = useRef(null);

  const {
    blobUrl,
    isLoading,
    error,
  } = useMemo(() => file, [file]);

  const hasError = useMemo(() => !isNil(error), [error]);

  const displayPreview = useMemo(
    () => !hasError && !isLoading,
    [hasError, isLoading],
  );

  const loadPage = useCallback(
    async (pageNum, doc, canvas) => {
      setLoading(true);
      try {
        const { current: currentTask } = taskRef;
        if (currentTask) {
          currentTask.cancel();
        }
        const task = await getPage(pageNum, doc, canvas);
        taskRef.current = task;
        await taskRef.current;
        taskRef.current = null;
      } catch (e) {
        taskRef.current = null;
        enqueueSnackbar(t('components:filePreview.errors.pdf'), { variant: 'warning' });
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, t, setLoading, taskRef],
  );

  const loadDocument = useCallback(
    async () => {
      try {
        const { current: currentTask } = taskRef;
        if (currentTask) {
          currentTask.cancel();
        }
        const doc = await getDocument(blobUrl);
        setPdfDoc(doc);
      } catch (e) {
        setPdfDoc(null);
        enqueueSnackbar(t('components:filePreview.errors.pdf'), { variant: 'warning' });
      }
    },
    [blobUrl, enqueueSnackbar, t],
  );

  useEffect(
    () => {
      if (displayPreview) {
        loadDocument();
      }
    },
    [displayPreview, loadDocument],
  );

  useEffect(
    () => {
      if (!isNil(pdfDoc) && !isEmpty(pagesRange)) {
        pagesRange.forEach(
          (index) => {
            loadPage(index + START_PAGE, pdfDoc, canvasesRef[index]);
          },
        );
      }
    },
    [pdfDoc, numPages, loadPage, pagesRange, canvasesRef],
  );

  const onIntersects = useCallback(
    (entry, index) => {
      if (entry.isIntersecting === true) {
        setCurrentPage(index);
      }
    },
    [setCurrentPage],
  );

  const [isScrolling, onScroll] = useScrollAnimation();

  // watch canvas visibility, if visible, set currentPage
  useIntersectionObservers(
    canvasesRef,
    onIntersects,
    { shouldBind, shouldObserve: shouldBind },
    { rootRef, threshold: 0.6 },
  );

  return (
    <Box display="flex" flexDirection="column">
      {displayPreview ? (
        <Box
          position="relative"
          width="100%"
          height="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          {loading && (
            <HourglassEmptyIcon color="primary" fontSize="large" className={classes.loader} />
          )}
          {!isNil(numPages) && (
            <Grow in={isScrolling}>
              <MobileStepper
                elevation={0}
                classes={{
                  root: classes.stepperRoot,
                }}
                variant="text"
                steps={numPages}
                position="static"
                activeStep={currentPage}
              />
            </Grow>
          )}
          <Box
            ref={rootRef}
            display="flex"
            flexDirection="column"
            maxWidth="100%"
            maxHeight={maxHeight}
            className={classes.boxOverflow}
            onScroll={onScroll}
          >
            {pagesRange.map((key) => (
              <canvas
                key={key}
                ref={makeCanvasRef(key)}
                className={classes.canvasFit}
              />
            ))}
          </Box>
        </Box>
      ) : fallbackView}
    </Box>
  );
};

PdfPreview.propTypes = {
  file: PropTypes.shape(FILE_PROP_TYPES).isRequired,
  fallbackView: PropTypes.node,
  maxHeight: PropTypes.string,
};

PdfPreview.defaultProps = {
  maxHeight: '100%',
  fallbackView: null,
};

export default PdfPreview;
