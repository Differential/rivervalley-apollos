/* eslint-disable import/prefer-default-export, max-classes-per-file */
import { parseGlobalId } from '@apollosproject/server-core';
import {
  Person as postgresPerson,
  Interactions as postgresInteraction,
} from '@apollosproject/data-connector-postgres';
import * as OneSignalOriginal from '@apollosproject/data-connector-onesignal';
import ApollosConfig from '@apollosproject/config';

class personDataSource extends postgresPerson.dataSource {
  async create(attributes) {
    const rockPersonId = await this.context.dataSources.RockPerson.create(
      attributes
    );
    super.create({
      ...attributes,
      originType: 'rock',
      originId: String(rockPersonId),
    });
    return rockPersonId;
  }
}

// These resolvers make sure that calls to updating profile fields update both the
const personResolver = {
  Mutation: {
    updateProfileField: async (
      root,
      { input: { field, value } },
      { dataSources }
    ) => {
      await dataSources.RockPerson.updateProfile([{ field, value }]); // Update in Rock
      return dataSources.Person.updateProfile([{ field, value }]); // updates in Postgres
    },
    updateProfileFields: async (root, { input }, { dataSources }) => {
      await dataSources.RockPerson.updateProfile(input); // Update in Rock
      return dataSources.Person.updateProfile(input); // updates in Postgres
    },
    uploadProfileImage: async (root, { file, size }, { dataSources }) => {
      const person = await dataSources.RockPerson.uploadProfileImage(
        file,
        size
      ); // Update in Rock
      return dataSources.Person.updateProfile([
        { field: 'profileImageUrl', value: person.photo.url },
      ]); // updates in Postgres. Reuses already uploaded imageUrl
      // return dataSources.Person.uploadProfileImage(file, size); // updates in Postgres. Performs the upload again.
    },
    updateUserPushSettings: async (root, { input }, { dataSources }) => {
      // register the changes w/ postgres
      await dataSources.NotificationPreference.updateUserNotificationPreference(
        {
          notificationProviderId: input.pushProviderUserId,
          notificationProviderType: 'one_signal', // hard coded for now
          enabled: input.enabled,
        }
      );
      // register the changes w/ one signal
      const returnValue = await dataSources.OneSignal.updatePushSettings(input);

      // if the pushProviderUserId is changing, we need ot register the device with rock.
      if (input.pushProviderUserId != null) {
        await dataSources.PersonalDevice.addPersonalDevice({
          pushId: input.pushProviderUserId,
        });
      }

      try {
        await dataSources.Person.updateProfile([
          {
            field: 'apollosUser',
            value: true,
          },
        ]);
      } catch (e) {
        console.warn(e);
      }

      // return the original return value (which is currentPerson)
      return returnValue;
    },
  },
};

export const Person = {
  dataSource: personDataSource,
  resolver: personResolver,
};

class oneSignalDataSource extends OneSignalOriginal.dataSource {
  async createNotification({
    toUserIds = [],
    to,
    content = '',
    heading,
    subtitle,
    ...args
  }) {
    if (to && to.originId && to.originType === 'rock') {
      const person = await this.context.dataSources.RockPerson.getFromId(
        to.originId
      );
      return super.createNotification({
        toUserIds: [person.primaryAliasId],
        content,
        heading,
        subtitle,
        ...args,
      });
    }
    return super.createNotification({
      toUserIds,
      content,
      heading,
      subtitle,
      ...args,
    });
  }
}

export const OneSignal = {
  ...OneSignalOriginal,
  dataSource: oneSignalDataSource,
};

// Used when IDs coming from the API are Rock APIS.
export const RockDefaultCampusOverride = {
  resolver: {
    Mutation: {
      updateUserCampus: async (root, { campusId }, { dataSources }) => {
        await dataSources.Campus.updateCurrentUserCampus({ campusId }); // updates in Rock

        const { id: rockCampusId } = parseGlobalId(campusId);
        const campus = await dataSources.PostgresCampus.getFromId(
          rockCampusId,
          null,
          {
            originType: 'rock',
          }
        ); // finds the postgres campus id
        return dataSources.Person.updateProfile([
          { field: 'campusId', value: campus.id },
        ]); // updates in Postgres
      },
    },
  },
};

// Used when IDs coming from the API are Postgres APIS.
export const PostgresDefaultCampusOverride = {
  resolver: {
    Mutation: {
      updateUserCampus: async (root, { campusId }, { dataSources }) => {
        const campus = await dataSources.Campus.getFromId(
          parseGlobalId(campusId).id
        ); // finds the postgres campus id
        await dataSources.RockCampus.updateCurrentUserCampus({
          rockId: campus.originId,
        }); // updates in Rock
        return dataSources.Campus.updateCurrentUserCampus({ campusId }); // updates in Postgres
      },
    },
  },
};

const UUID_V4_REGEXP = new RegExp(
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);
const isUuid = (uuid) => UUID_V4_REGEXP.test(uuid); // Define model is used to define the base attributes of a model

class InteractionDataSource extends postgresInteraction.dataSource {
  async createNodeInteraction({
    nodeId,
    action,
    additional = true,
    awaitAdditional = false,
  }) {
    const { id, __type } = parseGlobalId(nodeId);

    const currentPersonId = await this.context.dataSources.Person.getCurrentPersonId();

    let entityType = __type;
    if (ApollosConfig?.CONTENT?.TYPES?.includes(__type)) {
      entityType = 'ContentItem';
    }

    if (isUuid(id)) {
      await this.model.create({
        personId: currentPersonId,
        nodeType: entityType,
        nodeId: id,
        action,
      });
    } else {
      await this.model.create({
        personId: currentPersonId,
        nodeType: entityType,
        arguments: { id },
        action,
      });
    }

    if (additional) {
      const additionalFuncs = this.createAdditionalInteractions({
        id,
        __type,
        action,
      });

      // Primarily used in testing.
      // Most of the time, we don't want to wait for this code to return.
      if (awaitAdditional) {
        await additionalFuncs;
      }
    }

    return {
      success: true,
      nodeId,
    };
  }
}

export const Interactions = {
  ...postgresInteraction,
  resolver: {
    ...postgresInteraction.resolver,
    PrayerRequest: {
      isPrayed: async ({ id }, args, { dataSources }, { parentType }) => {
        let currentPersonId;
        try {
          currentPersonId = await dataSources.Person.getCurrentPersonId();
        } catch (e) {
          return false;
        }
        const interactions = await dataSources.Interactions.model.findAll({
          where: {
            action: 'PRAY',
            'arguments.id': id,
            personId: currentPersonId,
          },
        });
        return interactions.length;
      },
    },
  },
  dataSource: InteractionDataSource,
};
