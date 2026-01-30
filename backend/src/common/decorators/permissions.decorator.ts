import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../security/security.types';

export const Permissions = (...permissions: Permission[]) => SetMetadata('permissions', permissions);
