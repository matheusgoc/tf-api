import * as NodeUtil from 'util';
import { Injectable } from '@nestjs/common';

import { BaseService } from '../../base/base.service';

@Injectable()
export class ConsoleLogService extends BaseService {
  log(message?: any, ...messages: any[]) {
    NodeUtil.inspect.defaultOptions.depth = null; // enable deep log
    console.log(message); // eslint-disable-line no-console
    if (messages.length) {
      for (const m of messages) {
        console.log(m); // eslint-disable-line no-console
      }
    }
  }
  warn(message: any) {
    this.log(
      `\n\n${String.fromCodePoint(0x1f680)} \x1b[33m${message}\x1b[0m\n\n`,
    );
  }
  error(message: any) {
    this.log(
      `\n\n${String.fromCodePoint(0x1f525)} \x1b[41m${message}\x1b[0m\n\n`,
    );
  }
  success(message: any) {
    this.log(
      `\n\n${String.fromCodePoint(0x1f44d)} \x1b[32m${message}\x1b[0m\n\n`,
    );
  }
}
