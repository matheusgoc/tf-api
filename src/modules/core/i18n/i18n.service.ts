import { Injectable } from '@nestjs/common';

import { BaseService } from '../base/base.service';
import { type USER_PROFILE_LANGUAGE } from '../../../entities/user.entity';
import type DictionaryJSON from '../../../dictionaries/en-US.json';

type JsonKeys<T> = {
  [K in keyof T]: T[K] extends object ? JsonKeys<T[K]> : string;
};

export type Dictionary = JsonKeys<typeof DictionaryJSON>;

const dictionaries = {
  'pt-BR': () =>
    import('../../../dictionaries/pt-BR.json').then((module) => module.default),
  'en-US': () =>
    import('../../../dictionaries/en-US.json').then((module) => module.default),
};

@Injectable()
export class I18nService extends BaseService {
  getDictionary(locale: USER_PROFILE_LANGUAGE): Promise<Dictionary> {
    return dictionaries[locale]?.();
  }
}
