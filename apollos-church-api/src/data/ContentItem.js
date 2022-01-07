import { ContentItem } from '@apollosproject/data-connector-postgres';

const { dataSource, schema, models, migrations } = ContentItem;

const resolver = {
  ...ContentItem.resolver,
  WebviewFeature: {
    ...ContentItem.resolver.WebviewFeature,
    url: (data) => data.dataValues.data.url,
    height: () => 400,
  },
};

export { schema, resolver, dataSource, models, migrations };
