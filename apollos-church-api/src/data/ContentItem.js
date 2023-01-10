import { Sequelize, Op } from 'sequelize';
import { ContentItem } from '@apollosproject/data-connector-postgres';

const { schema, models, migrations } = ContentItem;

const activeFilter = {
  [Op.and]: [
    {
      active: true,
    },
    {
      publishAt: {
        [Op.or]: [
          {
            [Op.lte]: Sequelize.literal('NOW()'),
          },
          null,
        ],
      },
    },
    {
      expireAt: {
        [Op.or]: [
          {
            [Op.gte]: Sequelize.literal('NOW()'),
          },
          null,
        ],
      },
    },
  ],
};

class dataSource extends ContentItem.dataSource {
  baseItemByChannelCursor = this.byContentChannelId;

  getFeatures = async (item) => {
    const initialFeatures = await super.getFeatures(item);

    const commentFeatures = initialFeatures.filter((feature) =>
      feature.dataValues?.type.includes('Comment')
    );
    const otherFeatures = initialFeatures.filter(
      (feature) => !feature.dataValues?.type.includes('Comment')
    );

    return [...otherFeatures, ...commentFeatures];
  };

  getChildren = async (model, queryArgs = {}) => {
    let children = [];

    // if SOAP Devos or just Devos
    // flip child ordering.
    const category = await model.getContentItemCategory();
    if (category.originId === '48' || category.originId === '53') {
      children = await model.getChildren({
        ...queryArgs,
        order: [
          // Sequelize doesn't support sorting on the join table any other way.
          [Sequelize.literal('"contentItemsConnection".order'), 'ASC'],
          ['publishAt', 'DESC'],
        ],
        where: {
          ...queryArgs.where,
          ...activeFilter,
        },
      });
    } else {
      children = await super.getChildren(model, {
        ...queryArgs,
        where: {
          ...queryArgs.where,
          ...activeFilter,
        },
      });
    }

    return children;
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
