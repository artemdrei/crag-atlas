import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

import { MAX_PHOTO_BYTES } from '../utils/photoStorage';

export const PhotoUpload = (...dimensions: string[]) =>
  applyDecorators(
    UseInterceptors(
      FileInterceptor('file', { limits: { fileSize: MAX_PHOTO_BYTES } })
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file', ...dimensions],
        properties: {
          file: { type: 'string', format: 'binary' },
          ...Object.fromEntries(
            dimensions.map((name) => [name, { type: 'integer' }])
          )
        }
      }
    })
  );
