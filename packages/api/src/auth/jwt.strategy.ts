import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  type?: 'vendor';
  vendorId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required but not set');
    }
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters for security');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === 'vendor') {
      const vu = await this.prisma.vendorUser.findUnique({
        where: { id: payload.sub },
        include: { vendor: true },
      });
      if (!vu || vu.vendor.status !== 'active')
        throw new UnauthorizedException();
      return { id: vu.id, email: vu.email, vendorId: vu.vendorId, vendor: vu.vendor, type: 'vendor' as const };
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, role: user.role, type: 'user' as const };
  }
}
