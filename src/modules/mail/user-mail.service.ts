import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { I18nService } from '../core/i18n/i18n.service';
import { User, USER_PROFILE_LANGUAGE } from '@/entities/user.entity';
import { MailService } from '@/modules/mail/mail.service';

@Injectable()
export class UserMailService extends MailService {
  constructor(
    private readonly mailer: MailerService,
    protected readonly i18n: I18nService,
    protected readonly config: ConfigService,
  ) {
    super(config);
  }
  async sendEnrollEmail(user: User, token: string) {
    const language = user.profile?.language ?? USER_PROFILE_LANGUAGE.PT_BR;
    const dictionary = await this.i18n.getDictionary(language);
    this.context = {
      ...this.context,
      subject: dictionary.mails.user.enroll.subject,
      name: user.name.split(' ')[0],
      setPasswordUrl: this.generateFrontendLink(
        `control/auth/enroll?token=${token}`,
      ),
    };

    await this.mailer.sendMail({
      to: `${this.context.name}<${user.email}>`,
      subject: this.context.subject,
      template: `${language}/user-enroll`,
      context: this.context,
    });
  }
  async sendResetPasswordEmail(user: User, token: string) {
    const language = user.profile?.language ?? USER_PROFILE_LANGUAGE.PT_BR;
    const dictionary = await this.i18n.getDictionary(language);
    this.context = {
      ...this.context,
      subject: dictionary.mails.auth.resetPassword.subject,
      name: user.name.split(' ')[0],
      resetPasswordUrl: this.generateFrontendLink(
        `control/auth/reset-password?token=${token}`,
      ),
    };

    await this.mailer.sendMail({
      to: `${this.context.name}<${user.email}>`,
      subject: this.context.subject,
      template: `${language}/auth-reset-password`,
      context: this.context,
    });
  }
}
