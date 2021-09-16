import { ActionAlgorithm } from '@apollosproject/data-connector-postgres';

class dataSource extends ActionAlgorithm.dataSource {
  ACTION_ALGORITHMS = {
    ...this.ACTION_ALGORITHMS,
    DISCIPLEU_NEXT_UP: this.discipleuNextUp.bind(this),
  };

  async dailyPrayerAlgorithm({
    limit = 10,
    numberDaysSincePrayer,
    personId,
  } = {}) {
    const { PrayerRequest, Feature } = this.context.dataSources;
    Feature.setCacheHint({ scope: 'PRIVATE' });
    const cursor = await PrayerRequest.byDailyPrayerFeed({
      numberDaysSincePrayer,
      personId,
    });
    return cursor.top(limit).get();
  }

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
}

export { dataSource };
