import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return null;
    const { password: _, ...rest } = user;
    return rest;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return { access_token: this.jwt.sign({ sub: user.id, email: user.email }) };
  }

  async validateVendorUser(vendorId: string, email: string, password: string) {
    const vu = await this.prisma.vendorUser.findFirst({
      where: { vendorId, email },
      include: { vendor: true },
    });
    if (!vu || vu.vendor.status !== 'active' || !(await bcrypt.compare(password, vu.password)))
      return null;
    const { password: _, ...rest } = vu;
    return rest;
  }

  async vendorLogin(vendorCode: string, email: string, password: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { code: vendorCode } });
    if (!vendor) throw new UnauthorizedException('Vendor not found');
    const vu = await this.validateVendorUser(vendor.id, email, password);
    if (!vu) throw new UnauthorizedException('Invalid credentials');
    return {
      access_token: this.jwt.sign({
        sub: vu.id,
        vendorId: vu.vendorId,
        email: vu.email,
        type: 'vendor',
      }),
      vendor: { id: vendor.id, code: vendor.code, name: vendor.name },
    };
  }
}
