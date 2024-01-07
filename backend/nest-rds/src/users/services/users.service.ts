import { Injectable, Inject } from '@nestjs/common';

import { v4 } from 'uuid';

import { User } from '../models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  // private readonly users: Record<string, User>;

  constructor(private readonly prisma: PrismaService) {
    // this.users = {}
  }

  async findOne(userId: string): Promise<User> {
    // return this.users[ userId ];
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async createOne({ name, password, email }: User): Promise<User> {
    const id = v4();
    const newUser = { id: name || id, name, password, email };

    // this.users[ id ] = newUser;
    return await this.prisma.user.create({ data: newUser });

    // return newUser;
  }
}
