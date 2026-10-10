import type { ConditionsPlace } from './common';

declare module '@web/app/providers/modalProvider/types' {
  interface ModalPayloadMap {
    CONDITIONS: { place: ConditionsPlace };
  }
}
