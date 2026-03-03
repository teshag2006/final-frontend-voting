import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditService } from './audit/audit.service';

function getScalarHtml(specUrl: string, scriptSrc: string, styleHref?: string): string {
  const styleTag = styleHref
    ? `<link rel="stylesheet" href="${styleHref}" />`
    : '';

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>VoteChain API Docs</title>
    ${styleTag}
  </head>
  <body>
    <script
      id="api-reference"
      data-url="${specUrl}"
      src="${scriptSrc}">
    </script>
  </body>
</html>`;
}

async function bootstrap() {
  const fastifyInstance = fastify({ logger: true });
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance as any),
  );

  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT') || 3000;
  const prefix = configService.get('API_PREFIX') || '/api';

  // Global exception filter - must be first
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global logging interceptor + response serialization
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Global audit interceptor for admin mutations (requires DI)
  const auditService = app.get(AuditService);
  app.useGlobalInterceptors(new AuditInterceptor(auditService));

  // Enable CORS using NestJS built-in method (compatible with Fastify adapter)
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || configService.get('CORS_ORIGIN') || '*',
    credentials: true,
  });

  // Register helmet for security headers using type assertion to fix version mismatch
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix(prefix);

  // Setup Swagger/OpenAPI documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VoteChain API')
    .setDescription('Secure blockchain-based voting system REST API')
    .setVersion('1.0.0')
    .setContact(
      'VoteChain Team',
      'https://mbazars.com',
      'samsontesfamichael11@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer(`http://localhost:${port}`, 'Development')
    .addServer('https://api.votechain.com', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT',
    )
    .addTag('Authentication', 'User registration and login')
    .addTag('Users', 'User management')
    .addTag('Roles', 'Role and permission management')
    .addTag('Events', 'Event and category management')
    .addTag('Contestants', 'Contestant profiles')
    .addTag('Votes', 'Voting operations')
    .addTag('Payments', 'Payment processing')
    .addTag('Fraud', 'Fraud detection and prevention')
    .addTag('Blockchain', 'Blockchain anchoring')
    .addTag('Leaderboard', 'Rankings and statistics')
    .addTag('Notifications', 'User notifications')
    .addTag('System', 'System settings and health checks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const http = app.getHttpAdapter().getInstance();
  const docsHtmlCdn = getScalarHtml(
    '/openapi.json',
    'https://cdn.jsdelivr.net/npm/@scalar/api-reference',
  );
  const docsHtmlLocal = getScalarHtml(
    '/openapi.json',
    '/scalar/browser/standalone.js',
    '/scalar/style.css',
  );

  // Register static file serving for Scalar with type assertion to fix version mismatch
  await app.register(fastifyStatic as any, {
    root: join(process.cwd(), 'node_modules', '@scalar', 'api-reference', 'dist'),
    prefix: '/scalar/',
    decorateReply: false,
  });

  // Avoid noisy 404 logs from browser favicon requests.
  http.get('/favicon.ico', (_req: any, res: any) => {
    res.status(204).send();
  });

  http.get('/openapi.json', (_req: any, res: any) => {
    res.send(document);
  });

  http.get('/docs', (_req: any, res: any) => {
    res.type('text/html').send(docsHtmlCdn);
  });

  http.get('/docs-local', (_req: any, res: any) => {
    res.type('text/html').send(docsHtmlLocal);
  });

  http.get(`${prefix}/openapi.json`, (_req: any, res: any) => {
    res.send(document);
  });

  http.get(`${prefix}/docs`, (_req: any, res: any) => {
    res.type('text/html').send(docsHtmlCdn);
  });

  http.get(`${prefix}/docs-local`, (_req: any, res: any) => {
    res.type('text/html').send(docsHtmlLocal);
  });

  // Enable graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await app.close();
    process.exit(0);
  });

  await app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Voting System API running on: http://localhost:${port}${prefix}`);
    console.log(`📊 Environment: ${configService.get('NODE_ENV')}`);
    console.log(`🚀 Server: Fastify (2x-4x faster than Express)`);
    console.log(`📖 API Documentation: http://localhost:${port}/docs`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Application failed to start:', err);
  process.exit(1);
});
