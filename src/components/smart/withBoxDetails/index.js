import React, { useMemo, useCallback, useState /* useEffect */ } from 'react';
import PropTypes from 'prop-types';
import { denormalize, normalize } from 'normalizr';
import { connect } from 'react-redux';
import { useRouteMatch, useHistory, useLocation } from 'react-router-dom';
import routes from 'routes';

import errorTypes from '@misakey/ui/constants/errorTypes';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';
import useHandleBoxKeyShare from '@misakey/crypto/hooks/useHandleBoxKeyShare';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { useBoxesContext } from 'components/smart/Context/Boxes';

import { getCode, getDetails } from '@misakey/helpers/apiError';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import identity from '@misakey/helpers/identity';
import { getBoxBuilder, getBoxMembersBuilder, createBoxEventBuilder, getBoxPublicBuilder } from '@misakey/helpers/builder/boxes';
import { computeInvitationHash } from '@misakey/crypto/box/keySplitting';



import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import BoxesSchema from 'store/schemas/Boxes';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import SenderSchema from 'store/schemas/Boxes/Sender';

import { OPEN } from 'constants/app/boxes/statuses';
import { MEMBER_JOIN } from 'constants/app/boxes/events';

// CONSTANTS
const { forbidden } = errorTypes;
const NOT_MEMBER = 'not_member';
const NO_ACCESS = 'no_access';

// COMPONENTS
const withBoxDetails = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    // Used to prevent refetch on delete box
    const [preventFetching, setPreventFetching] = useState(false);
    const handleHttpErrors = useHandleHttpErrors();

    const { addItem } = useBoxesContext();

    const {
      isAuthenticated,
      box,
      dispatchReceiveBox,
      dispatchReceiveBoxMembers,
      ...rest
    } = props;

    const { members, lifecycle, publicKey, isMember, hasAccess } = useSafeDestr(box);
    const isOpen = useMemo(() => lifecycle === OPEN, [lifecycle]);
    const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);

    const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
    const secretKey = useMemo(
      () => publicKeysWeCanDecryptFrom.get(publicKey),
      [publicKey, publicKeysWeCanDecryptFrom],
    );

    const { params } = useRouteMatch();
    const { id } = params;
    const history = useHistory();
    const { hash } = useLocation();


    const boxForChildren = useMemo(
      () => ({ members: [], ...box || { id } }), [box, id],
    );

    const isAllowedToFetch = useMemo(
      () => isAuthenticated && !isNil(id) && !preventFetching,
      [isAuthenticated, id, preventFetching],
    );

    const shouldFetchBox = useMemo(
      () => isAllowedToFetch && (isNil(box) || (isNil(isMember))),
      [isAllowedToFetch, box, isMember],
    );

    // @FIXME to factorize
    const isAllowedToFetchContent = useMemo(
      () => !shouldFetchBox && isAllowedToFetch
        && (isOpen || belongsToCurrentUser)
        && isMember
        && hasAccess !== false,
      [shouldFetchBox, isAllowedToFetch, isOpen, belongsToCurrentUser, isMember, hasAccess],
    );

    const getBox = useCallback(
      () => getBoxBuilder(id),
      [id],
    );

    const getBoxMembers = useCallback(
      () => getBoxMembersBuilder(id),
      [id],
    );

    const onError = useCallback(
      (error) => {
        const code = getCode(error);
        const { reason } = getDetails(error);
        if (code === forbidden && reason === NOT_MEMBER) {
          dispatchReceiveBox({ id, isMember: false });
          createBoxEventBuilder(id, { type: MEMBER_JOIN })
            .then(() => getBox())
            .then((result) => dispatchReceiveBox(result)
              .then(() => addItem(result)))
            .catch((e) => {
              handleHttpErrors(e);
              // View is broken without box membership
              history.replace(routes._);
            });
        } else if (code === forbidden && reason === NO_ACCESS) {
          const urlKeyShareHash = (isEmpty(hash) ? null : hash.substr(1));
          getBoxPublicBuilder({ id, otherShareHash: computeInvitationHash(urlKeyShareHash) })
            .then((response) => {
              dispatchReceiveBox({ ...response, id, hasAccess: false });
            });
        } else {
          handleHttpErrors(error);
          // View is broken without box
          history.replace(routes._);
        }
      },
      [dispatchReceiveBox, getBox, handleHttpErrors, hash, history, id, addItem],
    );

    const { isFetching } = useFetchEffect(
      getBox,
      { shouldFetch: shouldFetchBox },
      { onSuccess: dispatchReceiveBox, onError },
    );

    const {
      isFetching: isFetchingBoxKeyShare,
    } = useHandleBoxKeyShare(boxForChildren, secretKey, isFetching);

    const shouldFetchMembers = useMemo(
      () => isAllowedToFetchContent && isEmpty(members) && !isFetchingBoxKeyShare,
      [isAllowedToFetchContent, members, isFetchingBoxKeyShare],
    );

    const onReceiveBoxMembers = useCallback(
      (data) => dispatchReceiveBoxMembers(id, data),
      [dispatchReceiveBoxMembers, id],
    );

    const { isFetching: isFetchingMembers } = useFetchEffect(
      getBoxMembers,
      { shouldFetch: shouldFetchMembers },
      { onSuccess: onReceiveBoxMembers },
    );

    const onDelete = useCallback(() => { setPreventFetching(true); }, []);

    const mappedProps = useMemo(
      () => (mapper({
        box: boxForChildren,
        belongsToCurrentUser,
        isFetching: {
          box: isFetching || isEmpty(box),
          keyShare: isFetchingBoxKeyShare,
          members: isFetchingMembers,
        },
        onDelete,
        isAuthenticated,
        ...rest,
      })),
      [
        belongsToCurrentUser, box, boxForChildren,
        isAuthenticated, isFetching, isFetchingBoxKeyShare, isFetchingMembers,
        onDelete, rest,
      ],
    );

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    // CONNECT
    box: PropTypes.shape(BoxesSchema.propTypes),
    isAuthenticated: PropTypes.bool,
    dispatchReceiveBox: PropTypes.func.isRequired,
    dispatchReceiveBoxMembers: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    box: null,
    isAuthenticated: null,
  };

  // CONNECT
  const mapStateToProps = (state, ownProps) => ({
    box: denormalize(
      ownProps.match.params.id,
      BoxesSchema.entity,
      state.entities,
    ),
    isAuthenticated: state.auth.isAuthenticated,
  });

  const mapDispatchToProps = (dispatch) => ({
    dispatchReceiveBox: (data) => {
      const hasAccess = (isNil(data.hasAccess) ? true : data.hasAccess);
      const isMember = isNil(data.isMember) ? true : data.isMember;
      const normalized = normalize(
        { ...data, hasAccess, isMember },
        BoxesSchema.entity,
      );
      const { entities } = normalized;
      return Promise.resolve(dispatch(receiveEntities(entities, mergeReceiveNoEmpty)));
    },
    dispatchReceiveBoxMembers: (id, members) => {
      const normalized = normalize(
        members,
        SenderSchema.collection,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updateEntities([{ id, changes: { members: result } }], BoxesSchema)),
      ]);
    },
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withBoxDetails;
