import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { DataStoreService } from '../core/data-store.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly db: DataStoreService) {}

  @Post('signin')
  signin(@Body() body: { email?: string }) {
    const email = String(body.email || '').toLowerCase();
    const user = this.db.users.find((u) => u.email === email) || this.db.users[1];
    return {
      token: `mock-token-${user.id}`,
      user,
    };
  }

  @Post('signup')
  signup(@Body() body: { email?: string; name?: string; role?: string }) {
    const id = `user-${Date.now()}`;
    const user = {
      id,
      email: String(body.email || `${id}@example.com`),
      name: String(body.name || 'New User'),
      role: (body.role as any) || 'voter',
    };
    this.db.users.push(user as any);
    return { user, token: `mock-token-${id}` };
  }

  @Post('logout')
  logout() {
    return { success: true };
  }

  @Get('session')
  session(@Headers() headers: Record<string, string | string[] | undefined>) {
    const raw = headers['x-user-id'];
    const userId = String(Array.isArray(raw) ? raw[0] : raw || 'voter-001');
    const user = this.db.getUser(userId) || this.db.users[1];
    return { authenticated: true, user };
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email?: string }) {
    return { success: true, email: body.email || null };
  }

  @Post('reset-password')
  resetPassword() {
    return { success: true };
  }

  @Post('confirm-email')
  confirmEmail() {
    return { success: true };
  }

  @Get('confirm-email')
  confirmEmailGet() {
    return { success: true };
  }
}
