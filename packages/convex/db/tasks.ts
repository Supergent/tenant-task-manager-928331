import { internalQuery, internalMutation } from "../_generated/server";
import { getUserId } from "./auth";
import { v } from "convex/values";

// LIST - Get all tasks for current user
export const list = internalQuery({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq("userId", userId))
      .collect();
  },
});

// GET - Get single task (with ownership check)
export const get = internalQuery({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const record = await ctx.db.get(args.id);

    if (!record) {
      throw new Error("Not found");
    }

    if (record.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return record;
  },
});

// CREATE - Insert new task
export const create = internalMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    dueDate: v.optional(v.number()),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    return await ctx.db.insert("tasks", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

// UPDATE - Modify existing task (with ownership check)
export const update = internalMutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Not found");
    }

    if (existing.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(id, updates);
  },
});

// DELETE - Remove task (with ownership check)
export const remove = internalMutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Not found");
    }

    if (existing.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
