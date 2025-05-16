import { Inject, Injectable } from '@nestjs/common';
import { SimpleCrypto } from 'simple-crypto-js';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

import { BaseService } from '../base/base.service';

type HASH_ALGORITHMS =
  | 'md4'
  | 'md5'
  | 'sha1'
  | 'sha256'
  | 'sha512'
  | 'sha384'
  | 'sha512_224'
  | 'sha512_256'
  | 'ripemd160';

@Injectable()
export class EncryptionService extends BaseService {
  @Inject() private readonly config: ConfigService;
  constructor() {
    super();
  }

  hash(
    value: string,
    algorithm: HASH_ALGORITHMS,
    format: crypto.BinaryToTextEncoding = 'hex',
  ) {
    return crypto.createHash(algorithm).update(value, 'utf-8').digest(format);
  }

  md5(value: string, format: crypto.BinaryToTextEncoding = 'hex') {
    return this.hash(value, 'md5', format);
  }

  sha1(value: string, format: crypto.BinaryToTextEncoding = 'hex') {
    return this.hash(value, 'sha1', format);
  }

  sha256(value: string, format: crypto.BinaryToTextEncoding = 'hex') {
    return this.hash(value, 'sha256', format);
  }

  encryptValue(plainText: string) {
    const secretKey = this.config.getOrThrow('DATA_ENCRYPT_SECRET');
    if (!secretKey) {
      throw new Error('Must set secret key to be able to encrypt');
    }

    const simpleCrypto = new SimpleCrypto(secretKey);
    const encrypted = simpleCrypto.encrypt(plainText);
    return encrypted;
  }

  decryptValue(encrypted: string) {
    const secretKey = this.config.getOrThrow('DATA_ENCRYPT_SECRET');
    if (!secretKey) {
      throw new Error('Must set secret key to be able to encrypt');
    }

    const simpleCrypto = new SimpleCrypto(secretKey);
    const decrpyted = simpleCrypto.decrypt(encrypted, secretKey);
    return decrpyted.toString();
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 8);
  }

  async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
