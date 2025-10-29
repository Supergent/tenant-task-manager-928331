import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { getUserId } from "../db/auth";

// LIST - Get all tasks for current user
export const list = query({
  args: {},
  handler: async (ctx, args) => {
    await getUserId(ctx);  // Defense-in-depth: Validate auth before delegation
    return await ctx.runQuery(internal.db.tasks.list, {});
  },
});

// GET - Get single task by ID
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await getUserId(ctx);  // Defense-in-depth: Validate auth before delegation
    return await ctx.runQuery(internal.db.tasks.get, { id: args.id });
  },
});

// CREATE - Create new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    dueDate: v.optional(v.number()),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    await getUserId(ctx);  // Defense-in-depth: Validate auth before delegation
    return await ctx.runMutation(internal.db.tasks.create, args);
  },
});

// UPDATE - Update existing task
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getUserId(ctx);  // Defense-in-depth: Validate auth before delegation
    return await ctx.runMutation(internal.db.tasks.update, args);
  },
});

// DELETE - Remove task
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await getUserId(ctx);  // Defense-in-depth: Validate auth before delegation
    return await ctx.runMutation(internal.db.tasks.remove, { id: args.id });
  },
});
