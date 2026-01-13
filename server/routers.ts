import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,

  declaration: router({
    // 获取所有行业
    getIndustries: publicProcedure.query(async () => {
      const { getAllIndustries } = await import('../shared/industry-standards');
      return getAllIndustries();
    }),

    // 获取特定行业的划分标准
    getIndustryStandard: publicProcedure
      .input(z.object({ industryType: z.string() }))
      .query(async ({ input }) => {
        const { getIndustryStandard } = await import('../shared/industry-standards');
        return getIndustryStandard(input.industryType as any);
      }),

    // 计算企业类型
    classifyEnterprise: publicProcedure
      .input(
        z.object({
          industryType: z.string(),
          employees: z.number().optional(),
          revenue: z.number().optional(),
          assets: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const { classifyEnterprise } = await import('../shared/industry-standards');
        return classifyEnterprise(
          input.industryType as any,
          input.employees,
          input.revenue,
          input.assets
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
