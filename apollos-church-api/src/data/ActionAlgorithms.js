import { ActionAlgorithm } from '@apollosproject/data-connector-postgres';

class dataSource extends ActionAlgorithm.dataSource {
  ACTION_ALGORITHMS = {
    ...this.ACTION_ALGORITHMS,
    GO_PRAY: this.goPray.bind(this),
    DISCIPLEU_NEXT_UP: this.discipleuNextUp.bind(this),
  };

  async discipleuNextUp({ channelIds = [], limit = 3 } = {}) {
    const nextUp = await this.seriesInProgressAlgorithm({
      channelIds,
    });
    if (nextUp.length < limit) {
      const otherSeries = await this.contentFeedAlgorithm({
        channelIds,
        limit,
      });

      otherSeries.forEach((series) => {
        if (
          !nextUp.find((item) => item.relatedNode.id === series.relatedNode.id)
        ) {
          nextUp.push(series);
        }
      });
    }

    let start = 0;
    if (nextUp[0].id === 'EmptyCard') start = 1;

    return nextUp.slice(start, limit);
  }

  async goPray() {
    return [
      {
        id: `pray-for-others`,
        title: 'Pray for others',
        subtitle: 'The church needs your prayer',
        relatedNode: {
          __type: 'Url',
          url: 'RiverValley://app-link/nav/Tabs?screen=Pray',
          id: 'RiverValley://app-link/nav/Tabs?screen=Pray',
        },
        image: {
          sources: [
            {
              uri: 'https://rock.rivervalley.org/GetImage.ashx?id=476391',
            },
          ],
        },
        action: 'OPEN_URL',
        // summary: ContentItem.createSummary(item),
      },
    ];
  }
}

export { dataSource };
