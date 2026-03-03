import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Swagger/OpenAPI Documentation Setup
 * Run: npm run start:dev
 * Visit: http://localhost:3000/api/docs
 */
async function setupSwagger(app: any) {
  const config = new DocumentBuilder()
    .setTitle('VoteChain API')
    .setDescription('Secure blockchain-based voting system REST API')
    .setVersion('1.0.0')
    .setContact(
      'VoteChain Team',
      'https://votechain.example.com',
      'support@votechain.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.votechain.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT',
    )
    .addTag('Authentication', 'User registration and login endpoints')
    .addTag('Users', 'User management and profile endpoints')
    .addTag('Events', 'Event and category management')
    .addTag('Contestants', 'Contestant profiles and statistics')
    .addTag('Votes', 'Voting operations with fraud detection')
    .addTag('Payments', 'Payment processing (6 providers)')
    .addTag('Leaderboard', 'Real-time rankings and statistics')
    .addTag('Fraud', 'Fraud detection and monitoring')
    .addTag('Blockchain', 'Blockchain integration and verification')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 1,
    },
    customCss: `
      .topbar { display: none; }
      .swagger-ui .topbar { display: none !important; }
    `,
    customSiteTitle: 'VoteChain API Documentation',
  });
}

export default setupSwagger;
