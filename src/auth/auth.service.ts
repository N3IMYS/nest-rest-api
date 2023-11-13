import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signin(dto: AuthDto) {
    //find the user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user not exists => throw exception
    if (!user)
      throw new ForbiddenException(
        'Creadentials are incorrect',
      );

    // compare the password
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    );

    // if password incorrect => throw exception
    if (!pwMatches)
      throw new ForbiddenException(
        'The password is incorrect',
      );

    // send back the user
    delete user.hash;
    return this.signToken(user.id, user.email);
  }
  async signup(dto: AuthDto) {
    // generate the passwrod hash
    const hash = await argon.hash(dto.password);

    try {
      // save the user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          hash,
        },
        // tell to prisma what fields you want to return in response
        // select: {
        //   id: true,
        //   email: true,
        //   created_at: true,
        // },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        // prisma error code when unique model fields are already exist and not allow duplicates
        error.code === 'P2002'
      ) {
        throw new ForbiddenException(
          'The Credentials are taken',
        );
      }

      throw error;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });
    return { access_token: token };
  }
}
