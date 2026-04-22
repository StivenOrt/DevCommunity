import { SetMetadata } from '@nestjs/common';

export const Rols = (...rols: string[]) => SetMetadata('rols', rols);