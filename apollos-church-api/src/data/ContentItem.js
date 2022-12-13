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
    const children = await super.getChildren(model);

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
