import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('RPG Battle API')
    .setDescription(
      'Proof of concept REST API for managing RPG characters and battles. This API serves as a take-home assignment for creating a backend system that handles character management in a role-playing game environment, with all data stored in memory.',
    )
    .setContact('felipfr', 'https://linkedin.com/in/felipfr', 'me@felipefr.dev')
    .setVersion('1.0.0')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  const path = process.env.SWAGGER_PREFIX ?? '/docs'
  SwaggerModule.setup(path, app, documentFactory)
}
