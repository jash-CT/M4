import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  email!: string;
  password!: string;
}

class VendorLoginDto {
  vendorCode!: string;
  email!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('vendor/login')
  async vendorLogin(@Body() dto: VendorLoginDto) {
    return this.auth.vendorLogin(dto.vendorCode, dto.email, dto.password);
  }
}
