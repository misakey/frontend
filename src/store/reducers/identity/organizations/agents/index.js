import { denormalize, normalize } from 'normalizr';
import { createSelector } from 'reselect';

import AgentsByOrganizationSchema from '@misakey/react-auth/store/schemas/Agents/ByOrganization';
import AgentsSchema from '@misakey/react-auth/store/schemas/Agents';

import { receiveEntities, updateEntities } from '@misakey/store/actions/entities';
import { makeMergeReceiveOneToMany } from '@misakey/store/reducers/helpers/processStrategies';

import pathOr from '@misakey/core/helpers/pathOr';
import isNil from '@misakey/core/helpers/isNil';

// HELPERS
const organizationAgentsPathOrEmpty = (entities, id) => pathOr([], ['organizationAgents', id, 'agents'])(entities);

// SELECTORS
const makeGetAgentsSelector = () => createSelector(
  (state) => state.entities,
  (_, { id }) => id,
  (entities, id) => organizationAgentsPathOrEmpty(entities, id),
);


export const selectors = {
  makeGetAgents: makeGetAgentsSelector,
  makeDenormalizeAgents: () => createSelector(
    (state) => state.entities,
    (_, id) => id,
    (entities, id) => {
      const { agents } = denormalize(
        id, AgentsByOrganizationSchema.entity, entities,
      ) || {};
      return agents;
    },
  ),
  makeDenormalizeAgent: () => createSelector(
    (state) => state.entities,
    (_, id) => id,
    (entities, id) => (isNil(id) ? null : denormalize(
      id, AgentsSchema.entity, entities,
    )),
  ),
};

// THUNKS
export const receiveAgents = (data, { organizationId }) => (dispatch) => {
  const normalized = normalize(
    { id: organizationId, agents: data },
    AgentsByOrganizationSchema.entity,
  );
  const mergeReceiveOneToMany = makeMergeReceiveOneToMany('agents');
  const { entities } = normalized;
  dispatch(receiveEntities(entities, mergeReceiveOneToMany));
  const result = organizationAgentsPathOrEmpty(entities, organizationId);
  return Promise.resolve(result);
};

export const addAgents = (agents, { organizationId }) => (dispatch, getState) => {
  const { entities, result } = normalize(
    agents.map((agent) => ({ ...agent, isNew: true })),
    AgentsSchema.collection,
  );
  const getAgentsSelector = makeGetAgentsSelector();
  const prevAgents = getAgentsSelector(getState(), { id: organizationId });
  const nextAgents = [...result, ...prevAgents];
  return Promise.all([
    dispatch(receiveEntities(entities)),
    dispatch(updateEntities([
      { id: organizationId, changes: { agents: nextAgents } },
    ],
    AgentsByOrganizationSchema)),
  ]);
};
