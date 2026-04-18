import { SetMetadata } from '@nestjs/common';

export const ROLS_KEY = 'rols';
export const Rols = (...rols: string[]) => SetMetadata(ROLS_KEY, rols);