import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../worker/trpc';

export const trpc = createTRPCReact<AppRouter>();
