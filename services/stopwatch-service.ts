import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StopwatchService {
  private _timeInfo = signal<
    Record<
      string,
      {
        ms: number;
        sec: number;
        intervalId: number | null;
      }
    >
  >({});

  alreadyStarted(reqId: string) {
    return this._timeInfo()[reqId]?.intervalId;
  }

  start(reqId: string) {
    this._timeInfo.update((state) => {
      if (state[reqId]?.intervalId) {
        return {
          ...state,
          [reqId]: {
            ms: 0,
            sec: 0,
            intervalId: null,
          },
        };
      }

      return state;
    });

    this._timeInfo.update((state) => {
      if (!state[reqId]) {
        state[reqId] = { ms: 0, sec: 0, intervalId: null };
      }

      return state;
    });

    const intervalId = setInterval(() => {
      this.tick(reqId);
    }, 100);

    this._timeInfo.update((state) => ({
      ...state,
      [reqId]: {
        ...state[reqId],
        intervalId,
      },
    }));
  }

  stop(reqId: string) {
    const current = this._timeInfo()[reqId];

    if (current?.intervalId) {
      clearInterval(current.intervalId);
    }
  }

  getSpentTime(reqId: string) {
    const spentTimeInfo = this._timeInfo()[reqId];

    return spentTimeInfo.sec != 0
      ? `${spentTimeInfo.sec}.${this.getMsView(spentTimeInfo.ms)}сек`
      : `${this.getMsView(spentTimeInfo.ms)}милисек`;
  }

  getFormattedTime(reqId: string) {
    return computed(() => {
      const t = this._timeInfo()[reqId];
      if (!t) return '';

      const { ms, sec } = t;

      const s = sec;
      const msView = this.getMsView(ms);

      return `${s}.${msView}`;
    });
  }

  private tick(reqId: string) {
    this._timeInfo.update((state) => {
      const t = state[reqId];
      if (!t) return state;

      let { ms, sec } = t;

      ms += 100;

      if (ms === 1000) {
        sec++;
        ms = 0;
      }

      return {
        ...state,
        [reqId]: { ...t, ms, sec },
      };
    });
  }

  private clearTime(reqId: string) {
    this._timeInfo.update((infos) => ({
      ...infos,
      [reqId]: {
        ms: 0,
        sec: 0,
        min: 0,
        hour: 0,
        intervalId: null,
      },
    }));
  }

  private getMsView(ms: number): string {
    return `${ms / 100}`;
  }
}
