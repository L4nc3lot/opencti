import {
  addObservedData,
  findAll,
  findById,
  observedDataContainsStixObjectOrStixRelationship,
  observedDatasDistributionByEntity,
  observedDatasNumber,
  observedDatasNumberByEntity,
  observedDatasTimeSeries,
  observedDatasTimeSeriesByAuthor,
  observedDatasTimeSeriesByEntity,
} from '../domain/observedData';
import {
  stixDomainObjectAddRelation,
  stixDomainObjectCleanContext,
  stixDomainObjectDelete,
  stixDomainObjectDeleteRelation,
  stixDomainObjectEditContext,
  stixDomainObjectEditField,
} from '../domain/stixDomainObject';
import { RELATION_CREATED_BY, RELATION_OBJECT_LABEL, RELATION_OBJECT_MARKING } from '../schema/stixMetaRelationship';
import { REL_INDEX_PREFIX } from '../schema/general';
import { UPDATE_OPERATION_REPLACE } from '../database/utils';

const observedDataResolvers = {
  Query: {
    observedData: (_, { id }, { user }) => findById(user, id),
    observedDatas: (_, args, { user }) => findAll(user, args),
    observedDatasTimeSeries: (_, args, { user }) => {
      if (args.objectId && args.objectId.length > 0) {
        return observedDatasTimeSeriesByEntity(user, args);
      }
      if (args.authorId && args.authorId.length > 0) {
        return observedDatasTimeSeriesByAuthor(user, args);
      }
      return observedDatasTimeSeries(user, args);
    },
    observedDatasNumber: (_, args, { user }) => {
      if (args.objectId && args.objectId.length > 0) {
        return observedDatasNumberByEntity(user, args);
      }
      return observedDatasNumber(user, args);
    },
    observedDatasDistribution: (_, args, { user }) => {
      if (args.objectId && args.objectId.length > 0) {
        return observedDatasDistributionByEntity(user, args);
      }
      return [];
    },
    observedDataContainsStixObjectOrStixRelationship: (_, args, { user }) => {
      return observedDataContainsStixObjectOrStixRelationship(user, args.id, args.stixObjectOrStixRelationshipId);
    },
  },
  ObservedDatasFilter: {
    createdBy: `${REL_INDEX_PREFIX}${RELATION_CREATED_BY}.internal_id`,
    markedBy: `${REL_INDEX_PREFIX}${RELATION_OBJECT_MARKING}.internal_id`,
    labelledBy: `${REL_INDEX_PREFIX}${RELATION_OBJECT_LABEL}.internal_id`,
  },
  Mutation: {
    observedDataEdit: (_, { id }, { user }) => ({
      delete: () => stixDomainObjectDelete(user, id),
      fieldPatch: ({ input, operation = UPDATE_OPERATION_REPLACE }) =>
        stixDomainObjectEditField(user, id, input, { operation }),
      contextPatch: ({ input }) => stixDomainObjectEditContext(user, id, input),
      contextClean: () => stixDomainObjectCleanContext(user, id),
      relationAdd: ({ input }) => stixDomainObjectAddRelation(user, id, input),
      relationDelete: ({ toId, relationship_type: relationshipType }) =>
        stixDomainObjectDeleteRelation(user, id, toId, relationshipType),
    }),
    observedDataAdd: (_, { input }, { user }) => addObservedData(user, input),
  },
};

export default observedDataResolvers;
