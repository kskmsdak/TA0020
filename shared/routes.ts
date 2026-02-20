import { z } from 'zod';
import { insertReportSchema, reports } from './schema';
import { users } from './models/auth';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// Zod schema for full report response (including user details)
const userSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable()
});

export const api = {
  users: {
    me: {
      method: 'GET' as const,
      path: '/api/users/me' as const,
      responses: {
        200: z.object({
          user: userSchema,
          profile: z.object({
            id: z.number(),
            userId: z.string(),
            role: z.string()
          }).nullable()
        }),
        401: errorSchemas.unauthorized
      }
    },
    updateRole: {
      method: 'POST' as const,
      path: '/api/users/role' as const,
      input: z.object({ role: z.enum(['citizen', 'contractor', 'admin']) }),
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized
      }
    }
  },
  reports: {
    list: {
      method: 'GET' as const,
      path: '/api/reports' as const,
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect>()),
      },
    },
    listMyReports: {
      method: 'GET' as const,
      path: '/api/reports/me' as const,
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect>()),
      }
    },
    listAvailableContracts: {
      method: 'GET' as const,
      path: '/api/reports/contracts' as const,
      responses: {
        200: z.array(z.custom<typeof reports.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/reports/:id' as const,
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/reports' as const,
      input: insertReportSchema,
      responses: {
        201: z.custom<typeof reports.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    generateAi: {
      method: 'POST' as const,
      path: '/api/reports/generate' as const,
      input: z.object({ prompt: z.string() }),
      responses: {
        200: z.object({
          area: z.string(),
          complaintType: z.string(),
          description: z.string(),
          estimatedImpact: z.string(),
          fundMisuseEstimate: z.string().optional()
        }),
        500: errorSchemas.internal
      }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/reports/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    assignContractor: {
      method: 'POST' as const,
      path: '/api/reports/:id/assign' as const,
      input: z.object({
        contractorId: z.string().optional(),
        budget: z.number().optional(),
        duration: z.string().optional(),
        requiredSkills: z.string().optional()
      }),
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    submitFeedback: {
      method: 'POST' as const,
      path: '/api/reports/:id/feedback' as const,
      input: z.object({
        rating: z.number().min(1).max(5),
        feedback: z.string()
      }),
      responses: {
        200: z.custom<typeof reports.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    verifyBlockchain: {
      method: 'GET' as const,
      path: '/api/blockchain/verify' as const,
      responses: {
        200: z.object({
          isValid: z.boolean(),
          invalidBlocks: z.array(z.number())
        })
      }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ReportResponse = z.infer<typeof api.reports.get.responses[200]>;
export type GeneratedAiReportResponse = z.infer<typeof api.reports.generateAi.responses[200]>;
export type BlockchainVerificationResponse = z.infer<typeof api.reports.verifyBlockchain.responses[200]>;
