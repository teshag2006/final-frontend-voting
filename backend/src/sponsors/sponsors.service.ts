import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { MoreThanOrEqual, Repository } from 'typeorm';
import {
  SponsorEntity,
  SponsorAccountStatus,
  SponsorVerificationStatus,
} from '@/entities/sponsor.entity';
import { EventSponsorEntity } from '@/entities/event-sponsor.entity';
import { EventEntity } from '@/entities/event.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { VoteEntity, VoteStatus } from '@/entities/vote.entity';
import {
  SponsorDocumentEntity,
  SponsorDocumentVerificationStatus,
} from '@/entities/sponsor-document.entity';
import {
  ContestantIntegrityEntity,
  ContestantIntegrityStatus,
} from '@/entities/contestant-integrity.entity';
import {
  ContestantTierEntity,
  ContestantTierLevel,
} from '@/entities/contestant-tier.entity';
import {
  CampaignEntity,
  CampaignPaymentStatus,
  CampaignStatus,
} from '@/entities/campaign.entity';
import { CampaignSnapshotEntity } from '@/entities/campaign-snapshot.entity';
import { CampaignReportEntity } from '@/entities/campaign-report.entity';
import {
  SponsorTrustProfileEntity,
  SponsorTrustStatus,
} from '@/entities/sponsor-trust-profile.entity';
import { SponsorImpressionEntity } from '@/entities/sponsor-impression.entity';
import { SponsorClickEntity } from '@/entities/sponsor-click.entity';
import {
  EnforcementEntityType,
  EnforcementLogEntity,
} from '@/entities/enforcement-log.entity';
import {
  CreateCampaignDto,
  CreateEnforcementLogDto,
  CreateSponsorDto,
  CreateSponsorDocumentDto,
  LinkEventSponsorDto,
  UpdateCampaignStatusDto,
  UpdateContestantIntegrityDto,
  UpdateSponsorDto,
} from './dto/sponsor.dto';

const INFLUENCE_CACHE_TTL_SECONDS = 600;

type SponsorAuditEntry = {
  id: string;
  at: string;
  action: string;
  entityType: 'campaign' | 'settings';
  entityId: string;
  detail: string;
};

@Injectable()
export class SponsorsService {
  private readonly logger = new Logger(SponsorsService.name);
  private readonly sponsorSettingsStore = new Map<number, any>();
  private readonly sponsorAuditStore = new Map<number, SponsorAuditEntry[]>();

  constructor(
    @InjectRepository(SponsorEntity)
    private sponsorsRepository: Repository<SponsorEntity>,
    @InjectRepository(EventSponsorEntity)
    private eventSponsorsRepository: Repository<EventSponsorEntity>,
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
    @InjectRepository(ContestantEntity)
    private contestantsRepository: Repository<ContestantEntity>,
    @InjectRepository(VoteEntity)
    private votesRepository: Repository<VoteEntity>,
    @InjectRepository(SponsorDocumentEntity)
    private sponsorDocumentsRepository: Repository<SponsorDocumentEntity>,
    @InjectRepository(ContestantIntegrityEntity)
    private contestantIntegrityRepository: Repository<ContestantIntegrityEntity>,
    @InjectRepository(ContestantTierEntity)
    private contestantTierRepository: Repository<ContestantTierEntity>,
    @InjectRepository(CampaignEntity)
    private campaignsRepository: Repository<CampaignEntity>,
    @InjectRepository(CampaignSnapshotEntity)
    private campaignSnapshotsRepository: Repository<CampaignSnapshotEntity>,
    @InjectRepository(CampaignReportEntity)
    private campaignReportsRepository: Repository<CampaignReportEntity>,
    @InjectRepository(SponsorTrustProfileEntity)
    private sponsorTrustProfilesRepository: Repository<SponsorTrustProfileEntity>,
    @InjectRepository(EnforcementLogEntity)
    private enforcementLogsRepository: Repository<EnforcementLogEntity>,
    @InjectRepository(SponsorImpressionEntity)
    private sponsorImpressionsRepository: Repository<SponsorImpressionEntity>,
    @InjectRepository(SponsorClickEntity)
    private sponsorClicksRepository: Repository<SponsorClickEntity>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async listSponsors(active?: boolean): Promise<SponsorEntity[]> {
    const where = active === undefined ? {} : { is_active: active };
    return this.sponsorsRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async getSponsorOverviewForUser(userId: number) {
    const sponsor = await this.resolveCurrentSponsor(userId);
    const [activeCampaigns, pendingPayments, impressions, clicks, completedCampaigns] =
      await Promise.all([
        this.campaignsRepository.count({
          where: { sponsor_id: sponsor.id, campaign_status: CampaignStatus.ACTIVE },
        }),
        this.campaignsRepository.count({
          where: { sponsor_id: sponsor.id, payment_status: CampaignPaymentStatus.PENDING },
        }),
        this.sponsorImpressionsRepository.count({ where: { sponsor_id: sponsor.id } }),
        this.sponsorClicksRepository.count({ where: { sponsor_id: sponsor.id } }),
        this.campaignsRepository.count({
          where: { sponsor_id: sponsor.id, campaign_status: CampaignStatus.COMPLETED },
        }),
      ]);

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const performance = {
      totalReach: impressions,
      engagementRate: Number(ctr.toFixed(2)),
      conversions: completedCampaigns,
    };

    return {
      sponsorName: sponsor.name,
      trustScore: Number(sponsor.trust_score ?? 0),
      verificationStatus: sponsor.verification_status,
      activeCampaigns,
      pendingPayments,
      performance,
      campaignPerformanceSummary: {
        impressions,
        clicks,
        ctr: Number(ctr.toFixed(2)),
        conversions: completedCampaigns,
      },
    };
  }

  async getSponsorDiscoverContestants() {
    const contestants = await this.contestantsRepository.find({
      relations: ['category'],
      order: { vote_count: 'DESC' },
      take: 200,
    });

    const ids = contestants.map((c) => c.id);
    const [integrityRows, tierRows] = await Promise.all([
      ids.length
        ? this.contestantIntegrityRepository.find({
            where: ids.map((id) => ({ contestant_id: id })),
          } as any)
        : [],
      ids.length
        ? this.contestantTierRepository.find({
            where: ids.map((id) => ({ contestant_id: id })),
          } as any)
        : [],
    ]);

    const integrityByContestantId = new Map<number, ContestantIntegrityEntity>(
      integrityRows.map((row) => [row.contestant_id, row]),
    );
    const tierByContestantId = new Map<number, ContestantTierEntity>(
      tierRows.map((row) => [row.contestant_id, row]),
    );

    const results = await Promise.all(
      contestants.map(async (contestant, index) => {
        const influence = (await this.getContestantInfluence(
          contestant.id,
          60,
        )) as Record<string, unknown>;
        const integrity = integrityByContestantId.get(contestant.id);
        const tier = tierByContestantId.get(contestant.id);
        const totalFollowers = Number(integrity?.total_followers ?? 0);
        const engagementRate = Number(integrity?.engagement_rate ?? 0) * 100;
        const followers = totalFollowers > 0 ? totalFollowers : Math.max(2000, contestant.vote_count * 8);
        const votesGrowth = Number(integrity?.vote_velocity_7d ?? 0) / 100;
        const followersGrowth = Number(integrity?.follower_growth_7d ?? 0) / 100;
        const integrityScore = Number(integrity?.integrity_score ?? influence.integrity_score ?? 80);

        const hasActiveCampaign = await this.hasActiveCampaignForContestant(contestant.id);

        const handleMetrics = [
          { platform: 'Instagram', handle: contestant.instagram_handle, seed: 0.5 },
          { platform: 'TikTok', handle: contestant.tiktok_handle, seed: 0.3 },
          { platform: 'YouTube', handle: contestant.youtube_channel, seed: 0.1 },
          { platform: 'X', handle: contestant.twitter_handle, seed: 0.05 },
          { platform: 'Facebook', handle: contestant.facebook_url, seed: 0.04 },
          { platform: 'Snapchat', handle: null, seed: 0.01 },
        ] as const;

        const socialPlatforms = handleMetrics.map((item) => ({
          platform: item.platform,
          username:
            item.handle && String(item.handle).trim().length > 0
              ? String(item.handle)
              : `@${(contestant.slug || `contestant-${contestant.id}`).replace(/[^a-z0-9-_]/gi, '').toLowerCase()}`,
          followers: Math.max(0, Math.round(followers * item.seed)),
          engagementRate: Number(Math.max(0, engagementRate || 3.5).toFixed(2)),
          lastUpdated: new Date().toISOString(),
        }));

        const voteTrend7d = Array.from({ length: 7 }, (_, i) => ({
          label: `D${i + 1}`,
          value: Number((42 + i * 1.5 + (contestant.id % 7)).toFixed(1)),
        }));
        const engagementTrend7d = Array.from({ length: 7 }, (_, i) => ({
          label: `D${i + 1}`,
          value: Number((3.2 + i * 0.12 + (contestant.id % 3) * 0.2).toFixed(2)),
        }));

        const tierLevel = String(tier?.tier_level || influence.tier_level || 'C')
          .toUpperCase()
          .replace(/[^ABC]/g, '') || 'C';

        const integrityStatus =
          integrityScore >= 80
            ? 'verified'
            : integrityScore >= 60
              ? 'under_review'
              : 'flagged';

        const socialPlatformNames = socialPlatforms.map((item) => item.platform);

        return {
          id: String(contestant.id),
          slug: contestant.slug || String(contestant.id),
          name: `${contestant.first_name} ${contestant.last_name}`.trim() || 'Contestant',
          category: contestant.category?.name || 'Category',
          age: contestant.date_of_birth
            ? Math.max(
                13,
                new Date().getFullYear() - new Date(contestant.date_of_birth).getFullYear(),
              )
            : 24,
          gender: 'prefer_not_to_say',
          location: {
            country: contestant.country || 'Unknown',
            city: 'N/A',
            region: 'N/A',
          },
          expectedSponsorshipUsd: Math.max(500, Math.round(contestant.vote_count * 0.02)),
          profileImage: contestant.profile_image_url || '/placeholder.svg',
          rank: index + 1,
          votes: Number(contestant.vote_count || 0),
          followers,
          engagementRate: Number((engagementRate || 3.5).toFixed(2)),
          engagementQualityScore: Number(
            Math.max(0, Math.min(100, integrityScore - 8)).toFixed(2),
          ),
          fraudRiskScore: Number(Math.max(0, 100 - integrityScore).toFixed(2)),
          sds: Number(influence.sponsorship_discovery_score ?? 0),
          tier: tierLevel as 'A' | 'B' | 'C',
          integrityStatus: integrityStatus as 'verified' | 'under_review' | 'flagged',
          integrityScore: Number(integrityScore.toFixed(2)),
          trendingScore: Number(influence.trending_score ?? 0),
          growthRate: Number(votesGrowth.toFixed(2)),
          votes7dGrowth: Number(votesGrowth.toFixed(2)),
          followers7dGrowth: Number(followersGrowth.toFixed(2)),
          sponsored: hasActiveCampaign,
          profileCompletion: Math.max(40, Math.round((Number(integrityScore) + 20) / 1.2)),
          responseRatePct: 80,
          deliverableCompletionPct: 75,
          readyNow: true,
          availableFrom: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          socialPlatformsList: socialPlatformNames,
          socialPlatforms,
          voteTrend7d,
          engagementTrend7d,
        };
      }),
    );

    return results;
  }

  async getSponsorCampaignTracking(userId: number, contestantSlug?: string) {
    const sponsor = await this.resolveCurrentSponsor(userId);
    const query = this.campaignsRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.sponsor', 'sponsor')
      .leftJoinAndSelect('campaign.contestant', 'contestant')
      .where('campaign.sponsor_id = :sponsorId', { sponsorId: sponsor.id })
      .orderBy('campaign.created_at', 'DESC');

    if (contestantSlug) {
      query.andWhere('contestant.slug = :contestantSlug', { contestantSlug });
    }

    const campaigns = await query.getMany();
    return campaigns.map((campaign) => {
      const deliverablesTotal = this.extractDeliverablesTotal(campaign.deliverables);
      const deliverablesSubmitted =
        campaign.campaign_status === CampaignStatus.COMPLETED
          ? deliverablesTotal
          : campaign.campaign_status === CampaignStatus.ACTIVE
            ? Math.max(0, Math.floor(deliverablesTotal / 2))
            : 0;

      const notes = this.buildCampaignAdminNote(campaign);
      return {
        id: String(campaign.id),
        contestantSlug:
          campaign.contestant?.slug || String(campaign.contestant_id),
        sponsorName: campaign.sponsor?.name || sponsor.name,
        campaignStatus: this.mapCampaignStatusToUi(campaign.campaign_status),
        paymentStatus: this.mapPaymentStatusToUi(campaign.payment_status),
        deliverablesSubmitted,
        deliverablesCompleted: deliverablesSubmitted,
        deliverablesTotal,
        notes,
        adminNotes: notes,
      };
    });
  }

  async createSponsorCampaignFromUi(
    userId: number,
    payload: Record<string, unknown>,
  ) {
    const sponsor = await this.resolveCurrentSponsor(userId);
    const contestantSlug = String(payload.contestantSlug || '').trim();
    const contestant = await this.contestantsRepository.findOne({
      where: contestantSlug ? { slug: contestantSlug } : {},
      order: { vote_count: 'DESC' },
    });

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    const deliverablesTotal = Math.max(
      1,
      Number(payload.deliverablesTotal || 1),
    );
    const action = String(payload.action || 'submit_review');

    const campaign = this.campaignsRepository.create({
      sponsor_id: sponsor.id,
      contestant_id: contestant.id,
      campaign_type: 'banner' as any,
      deliverables: JSON.stringify(payload.deliverables ?? []),
      agreed_price: Number(payload.agreedPriceUsd || 0),
      commission_amount: Number(payload.commissionAmount || 0),
      campaign_status: CampaignStatus.PENDING,
      payment_status: CampaignPaymentStatus.PENDING,
      start_date: payload.startDate ? new Date(String(payload.startDate)) : null,
      end_date: payload.endDate ? new Date(String(payload.endDate)) : null,
      activation_snapshot_taken: false,
    });

    const saved = await this.campaignsRepository.save(campaign);
    this.appendSponsorAudit(sponsor.id, {
      action: action === 'save_draft' ? 'campaign_draft_saved' : 'campaign_submitted_for_review',
      entityType: 'campaign',
      entityId: String(saved.id),
      detail: `${String(payload.campaignTitle || 'Campaign')} (${contestant.slug || contestant.id})`,
    });

    const notes =
      action === 'save_draft'
        ? `Draft saved: ${String(payload.campaignTitle || 'Untitled Draft')}`
        : `Submitted for admin review: ${String(payload.campaignTitle || 'Untitled Campaign')}`;

    return {
      id: String(saved.id),
      contestantSlug: contestant.slug || String(contestant.id),
      sponsorName: sponsor.name,
      campaignStatus: action === 'save_draft' ? 'draft' : 'under_review',
      paymentStatus: 'pending_manual',
      deliverablesSubmitted: 0,
      deliverablesCompleted: 0,
      deliverablesTotal,
      notes,
      adminNotes: notes,
    };
  }

  async getSponsorProfileSettingsForUser(userId: number) {
    const sponsor = await this.resolveCurrentSponsor(userId);
    const existing = this.sponsorSettingsStore.get(sponsor.id);
    if (existing) return existing;

    const docs = await this.sponsorDocumentsRepository.find({
      where: { sponsor_id: sponsor.id },
      order: { uploaded_at: 'DESC' },
      take: 10,
    });

    const profile = {
      general: {
        companyName: sponsor.name || '',
        logoUrl: sponsor.logo_url || '',
        description: sponsor.company_description || '',
        industry: sponsor.industry_category || '',
      },
      contact: {
        contactPerson: sponsor.contact_person_name || '',
        email: sponsor.contact_email || '',
        emailVerified: sponsor.verification_status === SponsorVerificationStatus.VERIFIED,
        phone: sponsor.phone_number || '',
        phoneVerified: sponsor.verification_status === SponsorVerificationStatus.VERIFIED,
        address: sponsor.address_line_1 || '',
        country: sponsor.country || '',
        city: sponsor.city || '',
      },
      legal: {
        taxId: sponsor.tax_id_number || '',
        registrationNumber: sponsor.registration_number || '',
        documents: docs.map((doc) => doc.file_url),
        termsAccepted: true,
      },
      security: {
        accountActivity: [],
      },
      profileCompletion: Math.round(Number(sponsor.profile_completion_score || 0)),
    };

    this.sponsorSettingsStore.set(sponsor.id, profile);
    return profile;
  }

  async saveSponsorProfileSettingsForUser(
    userId: number,
    payload: Record<string, unknown>,
  ) {
    const sponsor = await this.resolveCurrentSponsor(userId);
    const current = await this.getSponsorProfileSettingsForUser(userId);
    const merged = { ...current, ...payload };
    this.sponsorSettingsStore.set(sponsor.id, merged);
    this.appendSponsorAudit(sponsor.id, {
      action: 'settings_updated',
      entityType: 'settings',
      entityId: 'sponsor-profile',
      detail: `Profile completion ${Number(merged.profileCompletion || 0)}%`,
    });
    return merged;
  }

  async getSponsorAuditTrailForUser(userId: number) {
    const sponsor = await this.resolveCurrentSponsor(userId);
    return this.sponsorAuditStore.get(sponsor.id) || [];
  }

  async getSponsorContestantDetailBySlug(slug: string) {
    const contestants = await this.getSponsorDiscoverContestants();
    return contestants.find((row) => String(row.slug) === String(slug)) || null;
  }

  async getSponsorById(id: number): Promise<SponsorEntity> {
    const sponsor = await this.sponsorsRepository.findOne({ where: { id } });
    if (!sponsor) throw new NotFoundException('Sponsor not found');
    return sponsor;
  }

  async createSponsor(dto: CreateSponsorDto): Promise<SponsorEntity> {
    const normalizedName = dto.company_name ?? dto.name;
    const candidate = {
      ...dto,
      name: normalizedName,
    } as Partial<SponsorEntity>;

    const sponsor = this.sponsorsRepository.create({
      ...candidate,
      tier: dto.tier,
      is_active: dto.is_active ?? true,
      // Enforce secure default; verification transitions should happen via controlled admin flow.
      verification_status: SponsorVerificationStatus.PENDING,
      account_status: dto.account_status ?? SponsorAccountStatus.ACTIVE,
      profile_completion_score: this.calculateProfileCompletion(candidate),
      scheduled_date: dto.scheduled_date ? new Date(dto.scheduled_date) : null,
      started_date: dto.started_date ? new Date(dto.started_date) : null,
      terminated_date: dto.terminated_date ? new Date(dto.terminated_date) : null,
    });
    const saved = await this.sponsorsRepository.save(sponsor);
    await this.syncSponsorTrustProfile(saved.id);
    return saved;
  }

  async updateSponsor(id: number, dto: UpdateSponsorDto): Promise<SponsorEntity> {
    const sponsor = await this.getSponsorById(id);
    const normalizedName = dto.company_name ?? dto.name ?? sponsor.name;
    const completionCandidate: Partial<SponsorEntity> = {
      name: normalizedName,
      company_description: dto.company_description ?? sponsor.company_description,
      industry_category: dto.industry_category ?? sponsor.industry_category,
      company_size: dto.company_size ?? sponsor.company_size,
      contact_email: dto.contact_email ?? sponsor.contact_email,
      phone_number: dto.phone_number ?? sponsor.phone_number,
      country: dto.country ?? sponsor.country,
      city: dto.city ?? sponsor.city,
      address_line_1: dto.address_line_1 ?? sponsor.address_line_1,
      postal_code: dto.postal_code ?? sponsor.postal_code,
      logo_url: dto.logo_url ?? sponsor.logo_url,
      tax_id_number: dto.tax_id_number ?? sponsor.tax_id_number,
      registration_number: dto.registration_number ?? sponsor.registration_number,
    };

    Object.assign(sponsor, {
      ...dto,
      name: normalizedName,
      // Prevent direct user-controlled verification escalation on generic update flow.
      verification_status: sponsor.verification_status,
      profile_completion_score: this.calculateProfileCompletion(completionCandidate),
      scheduled_date:
        dto.scheduled_date !== undefined
          ? new Date(dto.scheduled_date)
          : sponsor.scheduled_date,
      started_date:
        dto.started_date !== undefined ? new Date(dto.started_date) : sponsor.started_date,
      terminated_date:
        dto.terminated_date !== undefined
          ? new Date(dto.terminated_date)
          : sponsor.terminated_date,
    });
    const saved = await this.sponsorsRepository.save(sponsor);
    await this.syncSponsorTrustProfile(saved.id);
    return saved;
  }

  async deleteSponsor(id: number): Promise<void> {
    const sponsor = await this.getSponsorById(id);
    await this.sponsorsRepository.remove(sponsor);
  }

  async listEventSponsors(eventId: number): Promise<EventSponsorEntity[]> {
    await this.ensureEventExists(eventId);
    return this.eventSponsorsRepository.find({
      where: { event_id: eventId },
      relations: ['sponsor'],
      order: { display_order: 'ASC', id: 'ASC' },
    });
  }

  async listPublicEventSponsorsBySlug(eventSlug: string): Promise<SponsorEntity[]> {
    const event = await this.eventsRepository.findOne({
      where: { slug: eventSlug },
      select: ['id'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const links = await this.eventSponsorsRepository.find({
      where: { event_id: event.id },
      relations: ['sponsor'],
      order: { display_order: 'ASC', id: 'ASC' },
    });

    return links
      .map((link) => link.sponsor)
      .filter((sponsor): sponsor is SponsorEntity => Boolean(sponsor?.id))
      .filter((sponsor) => sponsor.is_active);
  }

  async listPublicContestantSponsorsBySlugs(
    eventSlug: string,
    contestantSlug: string,
  ): Promise<SponsorEntity[]> {
    const contestant = await this.contestantsRepository
      .createQueryBuilder('contestant')
      .innerJoin('contestant.event', 'event')
      .where('event.slug = :eventSlug', { eventSlug })
      .andWhere('contestant.slug = :contestantSlug', { contestantSlug })
      .select(['contestant.id'])
      .getOne();

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    const campaigns = await this.campaignsRepository.find({
      where: {
        contestant_id: contestant.id,
        campaign_status: CampaignStatus.ACTIVE,
      },
      relations: ['sponsor'],
      order: { created_at: 'DESC' },
    });

    const seen = new Set<number>();
    const sponsors: SponsorEntity[] = [];

    for (const campaign of campaigns) {
      if (!campaign.sponsor?.id || !campaign.sponsor.is_active) continue;
      if (seen.has(campaign.sponsor.id)) continue;
      seen.add(campaign.sponsor.id);
      sponsors.push(campaign.sponsor);
    }

    return sponsors;
  }

  async trackPublicSponsorImpression(payload: {
    sponsorId?: string;
    placementId?: string;
    sourcePage?: string;
    eventSlug?: string;
    contestantSlug?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<SponsorImpressionEntity> {
    const sponsorId = this.parseOptionalPositiveInt(payload.sponsorId);

    const row = this.sponsorImpressionsRepository.create({
      sponsor_id: sponsorId,
      placement_id: this.cleanString(payload.placementId),
      source_page: this.cleanString(payload.sourcePage),
      event_slug: this.cleanString(payload.eventSlug),
      contestant_slug: this.cleanString(payload.contestantSlug),
      ip_address: this.cleanString(payload.ipAddress),
      user_agent: this.cleanString(payload.userAgent),
    });

    return this.sponsorImpressionsRepository.save(row);
  }

  async trackPublicSponsorClick(payload: {
    sponsorId?: string;
    placementId?: string;
    sourcePage?: string;
    eventSlug?: string;
    contestantSlug?: string;
    targetUrl?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<SponsorClickEntity> {
    const sponsorId = this.parseOptionalPositiveInt(payload.sponsorId);

    const row = this.sponsorClicksRepository.create({
      sponsor_id: sponsorId,
      placement_id: this.cleanString(payload.placementId),
      source_page: this.cleanString(payload.sourcePage),
      event_slug: this.cleanString(payload.eventSlug),
      contestant_slug: this.cleanString(payload.contestantSlug),
      target_url: this.cleanString(payload.targetUrl),
      ip_address: this.cleanString(payload.ipAddress),
      user_agent: this.cleanString(payload.userAgent),
    });

    return this.sponsorClicksRepository.save(row);
  }

  async linkSponsorToEvent(
    eventId: number,
    sponsorId: number,
    dto: LinkEventSponsorDto,
  ): Promise<EventSponsorEntity> {
    await this.ensureEventExists(eventId);
    await this.ensureSponsorExists(sponsorId);

    const existing = await this.eventSponsorsRepository.findOne({
      where: { event_id: eventId, sponsor_id: sponsorId },
    });

    if (existing) {
      throw new BadRequestException('Sponsor already linked to this event');
    }

    const link = this.eventSponsorsRepository.create({
      event_id: eventId,
      sponsor_id: sponsorId,
      placement: dto.placement ?? null,
      display_order: dto.display_order ?? 0,
    });

    return this.eventSponsorsRepository.save(link);
  }

  async unlinkSponsorFromEvent(eventId: number, sponsorId: number): Promise<void> {
    const link = await this.eventSponsorsRepository.findOne({
      where: { event_id: eventId, sponsor_id: sponsorId },
    });

    if (!link) {
      throw new NotFoundException('Sponsor link not found for this event');
    }

    await this.eventSponsorsRepository.remove(link);
  }

  async listSponsorDocuments(sponsorId: number): Promise<SponsorDocumentEntity[]> {
    await this.ensureSponsorExists(sponsorId);
    return this.sponsorDocumentsRepository.find({
      where: { sponsor_id: sponsorId },
      order: { uploaded_at: 'DESC' },
    });
  }

  async addSponsorDocument(
    sponsorId: number,
    dto: CreateSponsorDocumentDto,
  ): Promise<SponsorDocumentEntity> {
    await this.ensureSponsorExists(sponsorId);
    if (dto.mime_type && !this.isAllowedDocumentMime(dto.mime_type)) {
      throw new BadRequestException('Unsupported document MIME type');
    }

    const doc = this.sponsorDocumentsRepository.create({
      sponsor_id: sponsorId,
      document_type: dto.document_type,
      file_url: dto.file_url,
      mime_type: dto.mime_type ?? null,
      // Enforce secure default; document verification should be set by controlled review.
      verification_status: SponsorDocumentVerificationStatus.PENDING,
    });
    return this.sponsorDocumentsRepository.save(doc);
  }

  async upsertContestantIntegrity(
    contestantId: number,
    dto: UpdateContestantIntegrityDto,
  ): Promise<ContestantIntegrityEntity> {
    await this.ensureContestantExists(contestantId);

    let integrity = await this.contestantIntegrityRepository.findOne({
      where: { contestant_id: contestantId },
    });

    if (!integrity) {
      integrity = this.contestantIntegrityRepository.create({
        contestant_id: contestantId,
      });
    }

    Object.assign(integrity, dto);

    if (!integrity.status) {
      integrity.status = ContestantIntegrityStatus.NORMAL;
    }

    const saved = await this.contestantIntegrityRepository.save(integrity);
    await this.getContestantInfluence(contestantId, 60, true);
    return saved;
  }

  async getContestantInfluence(
    contestantId: number,
    trendingThreshold: number = 60,
    forceRefresh: boolean = false,
  ): Promise<Record<string, unknown>> {
    await this.ensureContestantExists(contestantId);
    const cacheKey = `sponsor:influence:${contestantId}:${trendingThreshold}`;

    if (!forceRefresh) {
      const cached = await this.safeRedisGet(cacheKey);
      if (cached) {
        return JSON.parse(cached) as Record<string, unknown>;
      }
    }

    const contestant = await this.contestantsRepository.findOne({
      where: { id: contestantId },
    });
    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    const integrity =
      (await this.contestantIntegrityRepository.findOne({
        where: { contestant_id: contestantId },
      })) ??
      this.contestantIntegrityRepository.create({
        contestant_id: contestantId,
      });

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const votes24h = await this.votesRepository.count({
      where: {
        contestant_id: contestantId,
        status: VoteStatus.VALID,
        created_at: MoreThanOrEqual(dayAgo),
      },
    });

    const votes7d = await this.votesRepository.count({
      where: {
        contestant_id: contestantId,
        status: VoteStatus.VALID,
        created_at: MoreThanOrEqual(weekAgo),
      },
    });

    const effectiveVoteVelocity24h = this.safeNumber(
      integrity.vote_velocity_24h,
      votes24h,
    );
    const effectiveVoteVelocity7d = this.safeNumber(
      integrity.vote_velocity_7d,
      votes7d,
    );
    const totalVotes = contestant.vote_count ?? 0;
    const totalFollowers = this.safeNumber(integrity.total_followers, 0);
    const engagementRate = this.safeNumber(integrity.engagement_rate, 0);
    const followerGrowth7d = this.safeNumber(integrity.follower_growth_7d, 0);
    const followerGrowth24h = this.safeNumber(integrity.follower_growth_24h, 0);
    const engagementSpikeFactor = this.safeNumber(
      integrity.engagement_spike_factor,
      0,
    );
    const integrityScore = Math.max(
      0,
      Math.min(100, this.safeNumber(integrity.integrity_score, 100)),
    );

    const platformScore = Math.min(
      100,
      Math.log10(totalVotes + 1) * 20 +
        effectiveVoteVelocity24h * 0.5 +
        effectiveVoteVelocity7d * 0.15,
    );
    const socialScore = Math.min(
      100,
      Math.log10(totalFollowers + 1) * 20 +
        engagementRate * 30 +
        followerGrowth7d * 0.05,
    );

    const integrityWeight = integrityScore < 60 ? 0.1 : 0.2;
    const nonIntegrityWeight = (1 - integrityWeight) / 2;

    const sds =
      nonIntegrityWeight * platformScore +
      nonIntegrityWeight * socialScore +
      integrityWeight * integrityScore;

    const trendingScore =
      effectiveVoteVelocity24h * 0.5 +
      followerGrowth24h * 0.3 +
      engagementSpikeFactor * 0.2;

    const tierLevel = this.resolveTierLevel(sds, integrityScore);
    await this.upsertTier(contestantId, tierLevel);

    const payload = {
      contestant_id: contestantId,
      platform_score: Number(platformScore.toFixed(2)),
      social_score: Number(socialScore.toFixed(2)),
      integrity_score: Number(integrityScore.toFixed(2)),
      sponsorship_discovery_score: Number(sds.toFixed(2)),
      trending_score: Number(trendingScore.toFixed(2)),
      trending_status: trendingScore > trendingThreshold,
      tier_level: tierLevel,
      cache_ttl_seconds: INFLUENCE_CACHE_TTL_SECONDS,
      computed_at: new Date().toISOString(),
    };

    await this.safeRedisSet(
      cacheKey,
      JSON.stringify(payload),
      INFLUENCE_CACHE_TTL_SECONDS,
    );

    return payload;
  }

  async createCampaign(dto: CreateCampaignDto): Promise<CampaignEntity> {
    await this.ensureSponsorExists(dto.sponsor_id);
    await this.ensureContestantExists(dto.contestant_id);

    const campaign = this.campaignsRepository.create({
      ...dto,
      deliverables: dto.deliverables ?? null,
      agreed_price: dto.agreed_price ?? 0,
      commission_amount:
        dto.commission_amount ??
        Math.max(0, Number(((dto.agreed_price ?? 0) * 0.1).toFixed(2))),
      start_date: dto.start_date ? new Date(dto.start_date) : null,
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      campaign_status: dto.campaign_status ?? CampaignStatus.PENDING,
      payment_status: dto.payment_status ?? CampaignPaymentStatus.PENDING,
      activation_snapshot_taken: false,
    });

    const saved = await this.campaignsRepository.save(campaign);
    await this.syncSponsorTrustProfile(saved.sponsor_id);
    return saved;
  }

  async listCampaigns(
    sponsorId?: number,
    contestantId?: number,
    status?: CampaignStatus,
  ): Promise<CampaignEntity[]> {
    const where: any = {};
    if (sponsorId !== undefined) where.sponsor_id = sponsorId;
    if (contestantId !== undefined) where.contestant_id = contestantId;
    if (status !== undefined) where.campaign_status = status;

    return this.campaignsRepository.find({
      where,
      relations: ['sponsor', 'contestant'],
      order: { created_at: 'DESC' },
    });
  }

  async updateCampaignStatus(
    campaignId: number,
    dto: UpdateCampaignStatusDto,
  ): Promise<CampaignEntity> {
    const campaign = await this.getCampaignById(campaignId);
    if (dto.campaign_status !== undefined) {
      campaign.campaign_status = dto.campaign_status;
    }
    if (dto.payment_status !== undefined) {
      campaign.payment_status = dto.payment_status;
    }
    const saved = await this.campaignsRepository.save(campaign);
    await this.syncSponsorTrustProfile(saved.sponsor_id);
    return saved;
  }

  async activateCampaign(campaignId: number): Promise<CampaignEntity> {
    const campaign = await this.getCampaignById(campaignId);
    if (campaign.campaign_status === CampaignStatus.CANCELLED) {
      throw new BadRequestException('Cannot activate a cancelled campaign');
    }

    const contestant = await this.contestantsRepository.findOne({
      where: { id: campaign.contestant_id },
    });
    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    if (!campaign.activation_snapshot_taken) {
      const integrity = await this.contestantIntegrityRepository.findOne({
        where: { contestant_id: campaign.contestant_id },
      });

      const snapshot = this.campaignSnapshotsRepository.create({
        campaign_id: campaign.id,
        contestant_id: campaign.contestant_id,
        votes_before: contestant.vote_count ?? 0,
        followers_before: integrity?.total_followers ?? 0,
        engagement_before: integrity?.engagement_rate ?? 0,
        rank_before: null,
      });
      await this.campaignSnapshotsRepository.save(snapshot);
      campaign.activation_snapshot_taken = true;
    }

    campaign.campaign_status = CampaignStatus.ACTIVE;
    if (!campaign.start_date) {
      campaign.start_date = new Date();
    }
    return this.campaignsRepository.save(campaign);
  }

  async completeCampaign(campaignId: number): Promise<CampaignEntity> {
    const campaign = await this.getCampaignById(campaignId);
    const contestant = await this.contestantsRepository.findOne({
      where: { id: campaign.contestant_id },
    });
    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    const integrity = await this.contestantIntegrityRepository.findOne({
      where: { contestant_id: campaign.contestant_id },
    });
    const snapshot = await this.campaignSnapshotsRepository.findOne({
      where: { campaign_id: campaign.id },
    });

    if (!snapshot) {
      throw new BadRequestException('Campaign activation snapshot not found');
    }

    const votesAfter = contestant.vote_count ?? 0;
    const followersAfter = integrity?.total_followers ?? 0;
    const engagementAfter = integrity?.engagement_rate ?? 0;

    const growthSummary = {
      votes_growth: votesAfter - (snapshot.votes_before ?? 0),
      followers_growth: followersAfter - (snapshot.followers_before ?? 0),
      engagement_growth:
        Number(engagementAfter) - Number(snapshot.engagement_before ?? 0),
    };

    let report = await this.campaignReportsRepository.findOne({
      where: { campaign_id: campaign.id },
    });
    if (!report) {
      report = this.campaignReportsRepository.create({
        campaign_id: campaign.id,
      });
    }
    report.votes_after = votesAfter;
    report.followers_after = followersAfter;
    report.engagement_after = engagementAfter;
    report.growth_summary = growthSummary;
    await this.campaignReportsRepository.save(report);

    campaign.campaign_status = CampaignStatus.COMPLETED;
    if (!campaign.end_date) {
      campaign.end_date = new Date();
    }
    const saved = await this.campaignsRepository.save(campaign);
    await this.syncSponsorTrustProfile(saved.sponsor_id);
    return saved;
  }

  async getRevenueIntelligence(from?: string, to?: string): Promise<Record<string, unknown>> {
    const params: unknown[] = [];
    let dateFilter = '';

    if (from) {
      params.push(new Date(from));
      dateFilter += ` AND c.created_at >= $${params.length}`;
    }
    if (to) {
      params.push(new Date(to));
      dateFilter += ` AND c.created_at <= $${params.length}`;
    }

    const totals = await this.campaignsRepository.query(
      `
      SELECT
        COALESCE(SUM(c.agreed_price), 0)::numeric AS total_revenue,
        COALESCE(SUM(c.commission_amount), 0)::numeric AS total_commission
      FROM campaigns c
      WHERE 1=1 ${dateFilter}
    `,
      params,
    );

    const monthlyRevenue = await this.campaignsRepository.query(
      `
      SELECT
        TO_CHAR(DATE_TRUNC('month', c.created_at), 'YYYY-MM') AS month,
        COALESCE(SUM(c.agreed_price), 0)::numeric AS revenue,
        COALESCE(SUM(c.commission_amount), 0)::numeric AS commission
      FROM campaigns c
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE_TRUNC('month', c.created_at)
      ORDER BY DATE_TRUNC('month', c.created_at) DESC
      LIMIT 12
    `,
      params,
    );

    const revenueByTier = await this.campaignsRepository.query(
      `
      SELECT
        ct.tier_level,
        COALESCE(SUM(c.agreed_price), 0)::numeric AS revenue
      FROM campaigns c
      LEFT JOIN contestant_tiers ct ON ct.contestant_id = c.contestant_id
      WHERE 1=1 ${dateFilter}
      GROUP BY ct.tier_level
      ORDER BY revenue DESC
    `,
      params,
    );

    const revenueByCategory = await this.campaignsRepository.query(
      `
      SELECT
        cat.id AS category_id,
        cat.name AS category_name,
        COALESCE(SUM(c.agreed_price), 0)::numeric AS revenue
      FROM campaigns c
      INNER JOIN contestants ct ON ct.id = c.contestant_id
      INNER JOIN categories cat ON cat.id = ct.category_id
      WHERE 1=1 ${dateFilter}
      GROUP BY cat.id, cat.name
      ORDER BY revenue DESC
    `,
      params,
    );

    const revenueByContestant = await this.campaignsRepository.query(
      `
      SELECT
        ct.id AS contestant_id,
        ct.first_name,
        ct.last_name,
        COALESCE(SUM(c.agreed_price), 0)::numeric AS revenue
      FROM campaigns c
      INNER JOIN contestants ct ON ct.id = c.contestant_id
      WHERE 1=1 ${dateFilter}
      GROUP BY ct.id, ct.first_name, ct.last_name
      ORDER BY revenue DESC
      LIMIT 50
    `,
      params,
    );

    return {
      total_revenue: Number(totals[0]?.total_revenue ?? 0),
      total_commission: Number(totals[0]?.total_commission ?? 0),
      monthly_revenue: monthlyRevenue.map((r: Record<string, unknown>) => ({
        month: r.month,
        revenue: Number(r.revenue ?? 0),
        commission: Number(r.commission ?? 0),
      })),
      revenue_by_tier: revenueByTier.map((r: Record<string, unknown>) => ({
        tier_level: r.tier_level ?? ContestantTierLevel.C,
        revenue: Number(r.revenue ?? 0),
      })),
      revenue_by_category: revenueByCategory.map((r: Record<string, unknown>) => ({
        category_id: r.category_id,
        category_name: r.category_name,
        revenue: Number(r.revenue ?? 0),
      })),
      revenue_by_contestant: revenueByContestant.map(
        (r: Record<string, unknown>) => ({
          contestant_id: r.contestant_id,
          name: `${String(r.first_name ?? '')} ${String(r.last_name ?? '')}`.trim(),
          revenue: Number(r.revenue ?? 0),
        }),
      ),
    };
  }

  async createEnforcementLogForSponsor(
    sponsorId: number,
    dto: CreateEnforcementLogDto,
  ): Promise<EnforcementLogEntity> {
    await this.ensureSponsorExists(sponsorId);
    return this.enforcementLogsRepository.save(
      this.enforcementLogsRepository.create({
        entity_type: EnforcementEntityType.SPONSOR,
        entity_id: sponsorId,
        violation_type: dto.violation_type,
        description: dto.description ?? null,
        penalty_score: dto.penalty_score ?? 0,
        action_taken: dto.action_taken ?? null,
      }),
    );
  }

  async createEnforcementLogForContestant(
    contestantId: number,
    dto: CreateEnforcementLogDto,
  ): Promise<EnforcementLogEntity> {
    await this.ensureContestantExists(contestantId);
    return this.enforcementLogsRepository.save(
      this.enforcementLogsRepository.create({
        entity_type: EnforcementEntityType.CONTESTANT,
        entity_id: contestantId,
        violation_type: dto.violation_type,
        description: dto.description ?? null,
        penalty_score: dto.penalty_score ?? 0,
        action_taken: dto.action_taken ?? null,
      }),
    );
  }

  async listEnforcementLogs(
    entityType?: EnforcementEntityType,
    entityId?: number,
  ): Promise<EnforcementLogEntity[]> {
    const where: any = {};
    if (entityType !== undefined) where.entity_type = entityType;
    if (entityId !== undefined) where.entity_id = entityId;

    return this.enforcementLogsRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async syncSponsorTrustProfile(sponsorId: number): Promise<SponsorTrustProfileEntity> {
    await this.ensureSponsorExists(sponsorId);

    const [totalCampaigns, completedCampaigns, cancelledCampaigns, latePaymentCount, sponsor] =
      await Promise.all([
        this.campaignsRepository.count({ where: { sponsor_id: sponsorId } }),
        this.campaignsRepository.count({
          where: { sponsor_id: sponsorId, campaign_status: CampaignStatus.COMPLETED },
        }),
        this.campaignsRepository.count({
          where: { sponsor_id: sponsorId, campaign_status: CampaignStatus.CANCELLED },
        }),
        this.campaignsRepository.count({
          where: {
            sponsor_id: sponsorId,
            payment_status: CampaignPaymentStatus.FAILED,
          },
        }),
        this.getSponsorById(sponsorId),
      ]);

    const completionRate = totalCampaigns > 0 ? completedCampaigns / totalCampaigns : 0;
    const paymentConsistency =
      totalCampaigns > 0 ? Math.max(0, 1 - latePaymentCount / totalCampaigns) : 1;
    const baseTrust = completionRate * 0.6 + paymentConsistency * 0.4;
    const completionFactor = this.safeNumber(sponsor.profile_completion_score, 0) / 100;
    const trustScore = Math.max(0, Math.min(100, (baseTrust * 0.8 + completionFactor * 0.2) * 100));

    let status = SponsorTrustStatus.NEW;
    if (trustScore >= 75) status = SponsorTrustStatus.VERIFIED;
    if (trustScore < 40 || sponsor.account_status === SponsorAccountStatus.UNDER_REVIEW) {
      status = SponsorTrustStatus.FLAGGED;
    }

    let profile = await this.sponsorTrustProfilesRepository.findOne({
      where: { sponsor_id: sponsorId },
    });
    if (!profile) {
      profile = this.sponsorTrustProfilesRepository.create({ sponsor_id: sponsorId });
    }

    profile.total_campaigns = totalCampaigns;
    profile.completed_campaigns = completedCampaigns;
    profile.cancelled_campaigns = cancelledCampaigns;
    profile.late_payment_count = latePaymentCount;
    profile.trust_score = Number(trustScore.toFixed(2));
    profile.status = status;

    sponsor.trust_score = Number(trustScore.toFixed(2));
    await this.sponsorsRepository.save(sponsor);
    return this.sponsorTrustProfilesRepository.save(profile);
  }

  async getCampaignById(campaignId: number): Promise<CampaignEntity> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id: campaignId },
      relations: ['sponsor', 'contestant'],
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async hasActiveCampaignForContestant(contestantId: number): Promise<boolean> {
    const count = await this.campaignsRepository.count({
      where: {
        contestant_id: contestantId,
        campaign_status: CampaignStatus.ACTIVE,
      },
    });
    return count > 0;
  }

  private async ensureEventExists(eventId: number): Promise<void> {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
  }

  private async ensureSponsorExists(sponsorId: number): Promise<void> {
    const sponsor = await this.sponsorsRepository.findOne({ where: { id: sponsorId } });
    if (!sponsor) throw new NotFoundException('Sponsor not found');
  }

  private async ensureContestantExists(contestantId: number): Promise<void> {
    const contestant = await this.contestantsRepository.findOne({
      where: { id: contestantId },
      select: ['id'],
    });
    if (!contestant) throw new NotFoundException('Contestant not found');
  }

  private calculateProfileCompletion(candidate: Partial<SponsorEntity>): number {
    const companyInfo =
      this.hasValue(candidate.name) &&
      this.hasValue(candidate.company_description) &&
      this.hasValue(candidate.industry_category) &&
      this.hasValue(candidate.company_size);
    const contactInfo =
      this.hasValue(candidate.contact_email) && this.hasValue(candidate.phone_number);
    const addressInfo =
      this.hasValue(candidate.country) &&
      this.hasValue(candidate.city) &&
      this.hasValue(candidate.address_line_1) &&
      this.hasValue(candidate.postal_code);
    const logoInfo = this.hasValue(candidate.logo_url);
    const legalInfo =
      this.hasValue(candidate.tax_id_number) ||
      this.hasValue(candidate.registration_number);

    const checks = [companyInfo, contactInfo, addressInfo, logoInfo, legalInfo];
    const completed = checks.filter(Boolean).length;
    return Number(((completed / checks.length) * 100).toFixed(2));
  }

  private hasValue(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  }

  private isAllowedDocumentMime(mime: string): boolean {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    return allowed.includes(mime.toLowerCase());
  }

  private resolveTierLevel(sds: number, integrityScore: number): ContestantTierLevel {
    if (sds > 80 && integrityScore > 85) return ContestantTierLevel.A;
    if (sds >= 50) return ContestantTierLevel.B;
    return ContestantTierLevel.C;
  }

  private async upsertTier(
    contestantId: number,
    tierLevel: ContestantTierLevel,
  ): Promise<void> {
    let tier = await this.contestantTierRepository.findOne({
      where: { contestant_id: contestantId },
    });
    if (!tier) {
      tier = this.contestantTierRepository.create({
        contestant_id: contestantId,
      });
    }
    tier.tier_level = tierLevel;
    await this.contestantTierRepository.save(tier);
  }

  private safeNumber(value: unknown, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  private async resolveCurrentSponsor(userId: number): Promise<SponsorEntity> {
    // Current data model does not have user_id on SponsorEntity in this codebase.
    // Resolve an active sponsor deterministically so sponsor self-service routes stay stable.
    const sponsor = await this.sponsorsRepository.findOne({
      where: { is_active: true },
      order: { created_at: 'ASC' },
    });
    if (!sponsor) {
      throw new NotFoundException(`No sponsor profile found for user ${userId}`);
    }
    return sponsor;
  }

  private mapCampaignStatusToUi(
    status: CampaignStatus,
  ): 'draft' | 'pending_payment' | 'active' | 'completed' | 'under_review' | 'rejected' {
    if (status === CampaignStatus.ACTIVE) return 'active';
    if (status === CampaignStatus.COMPLETED) return 'completed';
    if (status === CampaignStatus.CANCELLED) return 'rejected';
    return 'pending_payment';
  }

  private mapPaymentStatusToUi(
    status: CampaignPaymentStatus,
  ): 'pending_manual' | 'paid' | 'failed' {
    if (status === CampaignPaymentStatus.CONFIRMED_MANUAL) return 'paid';
    if (status === CampaignPaymentStatus.FAILED || status === CampaignPaymentStatus.REFUNDED) {
      return 'failed';
    }
    return 'pending_manual';
  }

  private buildCampaignAdminNote(campaign: CampaignEntity): string {
    if (campaign.campaign_status === CampaignStatus.COMPLETED) {
      return 'Completed successfully.';
    }
    if (campaign.campaign_status === CampaignStatus.ACTIVE) {
      return 'Campaign is live and being tracked.';
    }
    if (campaign.campaign_status === CampaignStatus.CANCELLED) {
      return 'Campaign rejected or cancelled by review workflow.';
    }
    return 'Waiting for manual settlement confirmation.';
  }

  private extractDeliverablesTotal(raw: string | null): number {
    if (!raw) return 1;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return Math.max(1, parsed.length);
    } catch {
      // Fall through to simple delimiter-based fallback.
    }
    return Math.max(1, raw.split(',').filter((x) => x.trim().length > 0).length);
  }

  private appendSponsorAudit(
    sponsorId: number,
    entry: Omit<SponsorAuditEntry, 'id' | 'at'>,
  ) {
    const existing = this.sponsorAuditStore.get(sponsorId) || [];
    const next: SponsorAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
      ...entry,
    };
    this.sponsorAuditStore.set(sponsorId, [next, ...existing].slice(0, 100));
  }

  private parseOptionalPositiveInt(value?: string): number | null {
    if (!value) return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.trunc(n);
  }

  private cleanString(value?: string): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private async safeRedisGet(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.warn(
        `Redis get failed for ${key}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  private async safeRedisSet(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      await this.redis.set(key, value, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(
        `Redis set failed for ${key}: ${(error as Error).message}`,
      );
    }
  }
}
