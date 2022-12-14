import { PrismaClient } from '@prisma/client';
import generateApiKey from 'generate-api-key';
import { createAccountArgs, updateAccountArgs } from '../../types/db/account';

export class AccountDB {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAll() {
    return this.prisma.account.findMany({
      include: {
        App: true,
      },
    });
  }

  async get(ownerAddress: string) {
    const app = await this.prisma.account.findUnique({
      where: {
        ownerAddress: ownerAddress,
      },
      include: {
        App: true,
      },
    });

    return app;
  }

  async getByApiKey(apiKey: string) {
    const app = await this.prisma.account.findUnique({
      where: {
        apiKey: apiKey,
      },
    });

    return app;
  }

  async getByContractAddress(contractAddress: string) {
    const app = await this.prisma.account.findUnique({
      where: {
        contractAddress: contractAddress,
      },
    });

    return app;
  }

  async create({ ownerAddress, name, contractAddress }: createAccountArgs) {
    const account = await this.prisma.account.create({
      data: {
        ownerAddress: ownerAddress,
        apiKey: generateApiKey({ method: 'string', length: 30 }) as string,
        name: name,
        contractAddress: contractAddress
      },
      include: {
        App: true,
      },
    });

    return account;
  }

  async update(ownerAddress: string, { name, contractAddress }: updateAccountArgs) {
    const app = await this.prisma.account.upsert({
      where: {
        ownerAddress: ownerAddress,
      },
      update: {
        name: name,
        contractAddress: contractAddress,
      },
      create: {
        contractAddress: ownerAddress,
        name: name,
        apiKey: generateApiKey({ method: 'string', length: 30 }) as string,
        ownerAddress: ownerAddress,
      },
      include: {
        App: true,
      },
    });

    return app;
  }

  async delete(ownerAddress: string): Promise<void> {
    await this.prisma.account.deleteMany({
      where: {
        ownerAddress: ownerAddress,
      },
    });
  }
}
