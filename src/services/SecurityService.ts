import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CipherGCMTypes,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';

interface EncryptionData {
  ciphertext: string;
  iv: string;
  tag: string;
}

@Injectable()
export default class SecurityService {
  private algorithm: CipherGCMTypes = 'aes-256-gcm';

  constructor(private configService: ConfigService) {}

  encrypt(plaintext: string): EncryptionData {
    const iv = randomBytes(16).toString('base64');
    const cipher = createCipheriv(
      this.algorithm,
      Buffer.from(
        this.configService.get<string>('PASSWORD_ENCRYPTION_KEY'),
        'base64',
      ),
      Buffer.from(iv, 'base64'),
    );

    const ciphertext =
      cipher.update(plaintext, 'utf-8', 'base64') + cipher.final('base64');

    return {
      ciphertext,
      iv,
      tag: cipher.getAuthTag().toString('base64'),
    };
  }

  decrypt(ciphertext: string, iv: string, tag: string): string {
    const decipher = createDecipheriv(
      this.algorithm,
      Buffer.from(
        this.configService.get<string>('PASSWORD_ENCRYPTION_KEY'),
        'base64',
      ),
      Buffer.from(iv, 'base64'),
    );

    decipher.setAuthTag(Buffer.from(tag, 'base64'));

    const plaintext =
      decipher.update(ciphertext, 'base64', 'utf-8') + decipher.final('utf-8');

    return plaintext;
  }
}
