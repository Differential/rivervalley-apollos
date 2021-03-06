import { gql } from 'apollo-server';

import {
  createApolloServerConfig,
  Interfaces,
} from '@apollosproject/server-core';

import * as Analytics from '@apollosproject/data-connector-analytics';
import * as Scripture from '@apollosproject/data-connector-bible';
import * as LiveStream from '@apollosproject/data-connector-church-online';
import * as Cloudinary from '@apollosproject/data-connector-cloudinary';
import * as Search from '@apollosproject/data-connector-algolia-search';
import * as Pass from '@apollosproject/data-connector-passes';
import * as Cache from '@apollosproject/data-connector-redis-cache';
import * as Sms from '@apollosproject/data-connector-twilio';
import {
  Followings,
  Interactions as RockInteractions,
  RockConstants,
  Sharable,
  Auth,
  PersonalDevice,
  Template,
  AuthSms,
  Group,
  BinaryFiles,
  FeatureFeed,
  Event,
  PrayerRequest,
  Person as RockPerson,
  ContentItem as RockContentItem,
  Campus as RockCampus,
  ContentChannel,
  Feature as RockFeature,
  ActionAlgorithm as RockActionAlgorithm,
} from '@apollosproject/data-connector-rock';

import {
  Comment,
  UserFlag,
  UserLike,
  Follow,
  // Interactions,
  Likes,
  Notification,
  NotificationPreference,
  Tag,
  Campus,
  Person as PostgresPerson,
  Media as PostgresMedia,
  Feature as PostgresFeature,
  // ContentItem as PostgresContentItem,
  ContentItemsConnection,
  ContentItemCategory,
  // ActionAlgorithm as PostgresActionAlgorithm,
  // PrayerRequest as PostgresPrayerRequest,
} from '@apollosproject/data-connector-postgres';

import * as Theme from './theme';
import * as RVActionAlgorithm from './ActionAlgorithms';
import * as RVContentItem from './ContentItem';

// This modules ties together certain updates so they occurs in both Rock and Postgres.
// Will be eliminated in the future through an enhancement to the Shovel
import {
  Person,
  OneSignal,
  PostgresDefaultCampusOverride,
  RockDefaultCampusOverride,
  Interactions,
} from './rockWithPostgres';

const postgresContentModules = {
  Interactions,
  Likes,
  // ActionAlgorithm: PostgresActionAlgorithm,
  ActionAlgorithm: RVActionAlgorithm,
  Feature: PostgresFeature,
  PostgresMedia,
  Tag,
  ContentItem: RVContentItem,
  ContentItemsConnection,
  ContentChannel: ContentItemCategory,
  // PrayerRequest: PostgresPrayerRequest,
  RockCampus: { dataSource: RockCampus.dataSource },
  Campus,
  PostgresDefaultCampusOverride,
};

const rockContentModules = {
  Interactions: RockInteractions,
  Followings,
  ActionAlgorithm: RockActionAlgorithm,
  Feature: RockFeature,
  ContentItem: RockContentItem,
  ContentChannel,
  PrayerRequest,
  PostgresCampus: { dataSource: Campus.dataSource },
  Campus: RockCampus,
  RockDefaultCampusOverride,
};

const data = {
  Interfaces,
  FeatureFeed,
  PrayerRequest,
  RockPerson, // This entry needs to come before (postgres) Person
  BinaryFiles, // This entry needs to come before (postgres) Person
  PostgresPerson, // Postgres person for now, as we extend this dataSource in the 'rockWithPostgres' file
  ...(process.env.DATABASE_CONTENT
    ? postgresContentModules
    : rockContentModules),
  Cloudinary,
  Auth,
  AuthSms,
  Sms,
  LiveStream,
  Theme,
  Scripture,
  RockConstants,
  Sharable,
  Analytics,
  PersonalDevice,
  Pass,
  Search,
  Template,
  Group,
  Event,
  Cache,
  Comment,
  UserLike,
  UserFlag,
  Follow,
  Notification,
  NotificationPreference,
  OneSignal,
  Person, // An extension of Postgres person. Will be eliminated in the near future so you can use just postgres/Person.
};

const {
  dataSources,
  resolvers,
  schema,
  context,
  applyServerMiddleware,
  setupJobs,
  migrations,
} = createApolloServerConfig(data);

export {
  dataSources,
  resolvers,
  schema,
  context,
  applyServerMiddleware,
  setupJobs,
  migrations,
};

// the upload Scalar is added
export const testSchema = [
  gql`
    scalar Upload
  `,
  ...schema,
];
