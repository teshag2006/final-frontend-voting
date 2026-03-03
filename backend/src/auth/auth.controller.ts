import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LogoutDto } from './dto/logout.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminImpersonateDto } from './dto/admin-impersonate.dto';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity, UserRole } from '@/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  async register(@Body() registerDto: RegisterDto) {
    return {
      statusCode: 201,
      message: 'User registered successfully',
      data: await this.authService.register(registerDto),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  async login(@Body() loginDto: LoginDto) {
    return {
      statusCode: 200,
      message: 'Login successful',
      data: await this.authService.login(loginDto),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refresh_token);
    return {
      statusCode: 200,
      message: result.message,
      data: {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('request-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ otp: { limit: 1, ttl: 120000 } }) // Strict: 1 OTP per 2 minutes
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return {
      statusCode: 200,
      message: 'OTP requested successfully',
      data: await this.authService.requestOtp(requestOtpDto),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('verify-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return {
      statusCode: 200,
      message: 'OTP verification successful',
      data: await this.authService.verifyOtp(verifyOtpDto),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(
    @CurrentUser() user: UserEntity,
    @Body() logoutDto: LogoutDto,
  ) {
    const result = await this.authService.logout(user.id, logoutDto);
    return {
      statusCode: 200,
      message: result.message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('change-password')
  @UseGuards(JwtGuard)
  async changePassword(
    @CurrentUser() user: UserEntity,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(
      user.id,
      dto.current_password,
      dto.new_password,
    );
    return {
      statusCode: 200,
      message: 'Password changed successfully',
      data: { success: true },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  async getProfile(@CurrentUser() user: UserEntity) {
    const profile = await this.authService.getProfile(user.id);
    return {
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: profile,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('admin/impersonate')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminImpersonate(
    @CurrentUser() user: UserEntity,
    @Body() dto: AdminImpersonateDto,
  ) {
    const result = await this.authService.adminImpersonate(user, dto);
    return {
      statusCode: 200,
      message: 'Impersonation token issued successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email?: string }) {
    await this.authService.forgotPassword(String(body?.email || '').trim().toLowerCase());
    return {
      statusCode: 200,
      message: 'If the account exists, reset instructions have been issued',
      data: { success: true },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { email?: string; token?: string; newPassword?: string },
  ) {
    await this.authService.resetPassword(
      String(body?.email || '').trim().toLowerCase(),
      String(body?.token || '').trim(),
      String(body?.newPassword || '').trim(),
    );
    return {
      statusCode: 200,
      message: 'Password reset successful',
      data: { success: true },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    const email = await this.authService.confirmEmail(String(token || '').trim());
    return {
      statusCode: 200,
      message: 'Email confirmed successfully',
      data: { success: true, email },
      timestamp: new Date().toISOString(),
    };
  }
}
