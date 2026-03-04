import { Injectable, ExecutionContext, applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const VENDOR_ONLY = 'vendorOnly';

export function VendorOnly() {
  return applyDecorators(SetMetadata(VENDOR_ONLY, true), UseGuards(JwtAuthGuard));
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const vendorOnly =
      this.reflector.get<boolean>(VENDOR_ONLY, context.getHandler()) ??
      this.reflector.get<boolean>(VENDOR_ONLY, context.getClass());
    const request = context.switchToHttp().getRequest();
    const run = super.canActivate(context);
    if (!run) return false;
    return typeof run === 'boolean' ? run : (run as Promise<boolean>).then((ok) => {
      if (ok && vendorOnly && request.user?.type !== 'vendor') return false;
      return ok;
    });
  }
}
