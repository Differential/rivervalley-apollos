import { Sequelize } from 'sequelize';
import { ContentItem } from '@apollosproject/data-connector-postgres';

const { schema, models, migrations } = ContentItem;

class dataSource extends ContentItem.dataSource {
  baseItemByChannelCursor = this.byContentChannelId;

  getFeatures = async (item) => {
    const features = await super.getFeatures(item);

    // This moves the Webview feature above the journal entries
    if (features[features.length - 1]?.dataValues?.type === 'Webview') {
      const tempFeature = features[features.length - 1];

      features[features.length - 1] = features[features.length - 3];
      features[features.length - 3] = tempFeature;
    }

    return features;
  };

  getChildren = async (model) => {
      let children = [];

      // if SOAP Devos or just Devos
      // flip child ordering.

      const category = await model.getContentItemCategory()
      if (category.originId === '48' || category.originId === '53') {
        children = await model.getChildren({
          order: [// Sequelize doesn't support sorting on the join table any other way.
          [Sequelize.literal('"contentItemsConnection".order'), 'ASC'], ['publishAt', 'DESC']],
        });
      } else {
        children = await super.getChildren(model)
      }

    const filteredChildren = children.filter(
      (child) =>
        child.active &&
        (child.publishAt === null || child.publishAt < new Date()) &&
        (child.expireAt === null || child.expireAt > new Date())
    );

    if (filteredChildren.length === 0) return [];

    return filteredChildren;
  };
}

const resolver = {
  ...ContentItem.resolver,
  WebviewFeature: {
    ...ContentItem.resolver.WebviewFeature,
    url: (data) => data.dataValues.data.url,
    height: () => 400,
  },
};

export { schema, resolver, dataSource, models, migrations };
