import { PrismaClient } from '@prisma/client';
import { SendEventArgs, SetupProviderArgs } from '../types';
import { Pigeon } from './inapp/pegion';
import { SendGridMail } from './mail/sendgrid-mail';
import { Telegram } from './other/telegram';

export class Provider {
  prisma : PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async setupProvider(args: SetupProviderArgs) {
    // add cases here
    switch (args.channel) {
      case 'MAIL':
        return this.setupMailProvider(args);
      case 'IN_APP':
        return this.setupInAppProvider(args);
      case 'OTHER':
        return this.setupOtherProvider(args);
    }
  }

  async removeProvider(args: SetupProviderArgs) {
    // add cases here
    switch (args.channel) {
      case 'MAIL':
        return this.removeMailProvider(args);
      case 'IN_APP':
        return this.removeInAppProvider(args);
      case 'OTHER':
        return this.removeOtherProvider(args);
    }
  }

  async send(args: SendEventArgs) {
    // add cases here
    switch (args.provider.channel) {
      case 'MAIL':
        return this.sendMailEvent(args);
      case 'IN_APP':
        return this.sendInAppEvent(args);
      case 'OTHER':
        return this.sendOtherEvent(args);
    }
  }

  private async setupOtherProvider({ appId, config, provider, providerName }: SetupProviderArgs) {
    if (provider === 'TELEGRAM') {
      const telegramProvider = new Telegram();
      await telegramProvider.setupProvider(appId, providerName, config.telegramBotToken);
    }
  }

  private async removeOtherProvider({ appId, config, provider, providerName }: SetupProviderArgs) {
    if (provider === 'TELEGRAM') {
      const telegramProvider = new Telegram();
      await telegramProvider.removeProvider(config.telegramBotToken);
      await this.prisma.telegramProvider.deleteMany({
        where: {
          appId: appId,
          providerName: providerName,
        },
      });
    }
  }

  private async sendOtherEvent(args: SendEventArgs) {
    if (args.provider.providerKey === 'TELEGRAM') {
      const telegramProvider = new Telegram();
      await telegramProvider.sendMessage(args);
    }
  }

  private async setupMailProvider(args: SetupProviderArgs) {
    if (args.provider === 'SENDGRID_MAIL') {
      const sendgridProvider = new SendGridMail();
      await sendgridProvider.setupProvider(args);
    }
  }

  private removeMailProvider(_args: SetupProviderArgs) {
    // do noting
  }

  private setupInAppProvider(_args: SetupProviderArgs) {
    // do nothing
  }

  private removeInAppProvider(_args: SetupProviderArgs) {
    // do nothing
  }

  private async sendMailEvent(args: SendEventArgs) {
    if (args.provider.providerKey === 'SENDGRID_MAIL') {
      const sendgridProvider = new SendGridMail();
      await sendgridProvider.sendMessage(args);
    }
  }

  private async sendInAppEvent(args: SendEventArgs) {
    if (args.provider.providerKey === 'PIGEON') {
      const pigeonProvider = new Pigeon();
      await pigeonProvider.sendMessage(args);
    }
  }
}
