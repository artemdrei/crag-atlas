import type { Tick, TickHeader } from './common/entities';

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    LOG_TICK: TickHeader & { idRoute: string };
    TICK_MENU: { tick: Tick };
    TICK_EDIT: { tick: Tick };
    TICK_DELETE: { idTick: string };
  }
}
