import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { FindOptionsOrder } from 'typeorm';
import { stringify } from 'qs';

import { PageOptionsDto } from '../dto/page-options.dto';
@Injectable()
export class BaseService {
  mapSort<Entity>(
    orderOption: PageOptionsDto['order'],
    fields: Record<string, string>,
  ): FindOptionsOrder<Entity> {
    const fieldMap = new Map(Object.entries(fields));

    // protect sorting against DoS or HPP attack
    if (orderOption.length > fieldMap.size) {
      throw new UnprocessableEntityException(
        'Sorting order arguments out of bound',
      );
    }

    const order: FindOptionsOrder<Entity> = {};
    const orderMap = new Map(orderOption);
    for (const [key, value] of orderMap.entries()) {
      const upperValue = value.toUpperCase();
      if (!fieldMap.has(key) || !['ASC', 'DESC'].includes(upperValue)) {
        continue;
      }
      order[fieldMap.get(key)] = upperValue as 'ASC' | 'DESC';
    }

    return order;
  }

  generateLink(
    host: string,
    url: string,
    params?: Record<string, string | number>,
  ) {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const link = `${protocol}://${host}/${url}`;
    return params ? `${link}?${stringify(params)}` : link;
  }
}
