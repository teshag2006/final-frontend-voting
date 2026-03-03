import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ContestantEntity } from '@/entities/contestant.entity';
import { UserRole } from '@/entities/user.entity';

@WebSocketGateway({
  namespace: '/leaderboard',
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
@Injectable()
export class LeaderboardGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(ContestantEntity)
    private contestantsRepository: Repository<ContestantEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    console.log('[ws] Leaderboard gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`[ws] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[ws] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-leaderboard')
  async handleSubscribeLeaderboard(
    client: Socket,
    data: { eventId: number; categoryId: number },
  ) {
    const roomName = `leaderboard-event-${data.eventId}-category-${data.categoryId}`;
    client.join(roomName);

    const leaderboard = await this.getLeaderboard(data.eventId, data.categoryId);
    client.emit('leaderboard-snapshot', {
      eventId: data.eventId,
      categoryId: data.categoryId,
      contestants: leaderboard,
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: 'Subscribed to leaderboard' };
  }

  @SubscribeMessage('subscribe-contestant')
  async handleSubscribeContestant(client: Socket, data: { contestantId: number }) {
    const roomName = `contestant-${data.contestantId}`;
    client.join(roomName);

    const contestant = await this.contestantsRepository.findOne({
      where: { id: data.contestantId },
    });

    if (contestant) {
      client.emit('contestant-snapshot', {
        id: contestant.id,
        voteCount: contestant.vote_count,
        paidVoteCount: contestant.paid_vote_count,
        freeVoteCount: contestant.free_vote_count,
        totalRevenue: contestant.total_revenue,
        timestamp: new Date().toISOString(),
      });
    }

    return { success: true, message: 'Subscribed to contestant' };
  }

  @SubscribeMessage('subscribe-admin-alerts')
  handleSubscribeAdminAlerts(client: Socket, data: { adminToken: string }) {
    const token = String(data?.adminToken || '').trim();
    if (!token) {
      throw new WsException('Admin token is required');
    }

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new WsException('JWT secret is not configured');
    }

    let payload: { role?: string };
    try {
      payload = this.jwtService.verify<{ role?: string }>(token, { secret });
    } catch {
      throw new WsException('Invalid admin token');
    }

    if (payload.role !== UserRole.ADMIN) {
      throw new WsException('Admin role required');
    }

    client.join('admin-alerts');
    return { success: true, message: 'Subscribed to admin alerts' };
  }

  broadcastVoteUpdate(eventId: number, categoryId: number, contestantUpdate: any) {
    const roomName = `leaderboard-event-${eventId}-category-${categoryId}`;
    this.server.to(roomName).emit('vote-update', {
      ...contestantUpdate,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastLeaderboardUpdate(eventId: number, categoryId: number, rankings: any[]) {
    const roomName = `leaderboard-event-${eventId}-category-${categoryId}`;
    this.server.to(roomName).emit('leaderboard-update', {
      eventId,
      categoryId,
      rankings,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastContestantUpdate(contestantId: number, update: any) {
    const roomName = `contestant-${contestantId}`;
    this.server.to(roomName).emit('contestant-update', {
      contestantId,
      ...update,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastAdminAlert(alert: any) {
    this.server.to('admin-alerts').emit('fraud-alert', {
      ...alert,
      timestamp: new Date().toISOString(),
    });
  }

  private async getLeaderboard(eventId: number, categoryId: number) {
    const contestants = await this.contestantsRepository.find({
      where: { event_id: eventId, category_id: categoryId },
      order: { vote_count: 'DESC' },
      take: 100,
    });

    return contestants.map((contestant, index) => ({
      rank: index + 1,
      id: contestant.id,
      firstName: contestant.first_name,
      lastName: contestant.last_name,
      voteCount: contestant.vote_count,
      paidVoteCount: contestant.paid_vote_count,
      freeVoteCount: contestant.free_vote_count,
      totalRevenue: contestant.total_revenue,
    }));
  }
}
