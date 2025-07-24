import { pgTable, text, integer, timestamp, serial, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  phone_number: text('phone_number').notNull().unique(),
  character_name: text('character_name').notNull(),
  level: integer('level').default(1),
  health: integer('health').default(100),
  energy: integer('energy').default(100),
  max_health: integer('max_health').default(100),
  max_energy: integer('max_energy').default(100),
  power_level: text('power_level').default('G'),
  kingdom: text('kingdom').default('AEGYRIA'),
  order_name: text('order_name').default('Neutre'),
  gold: integer('gold').default(100),
  experience: integer('experience').default(0),
  location: text('location').default('Auberge de départ'),
  character_data: text('character_data'), // JSON string for character appearance and equipment
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const game_sessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  player_id: integer('player_id').references(() => players.id),
  group_chat_id: text('group_chat_id'),
  session_data: text('session_data'), // JSON string for session state
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const player_inventory = pgTable('player_inventory', {
  id: serial('id').primaryKey(),
  player_id: integer('player_id').references(() => players.id),
  item_name: text('item_name').notNull(),
  item_type: text('item_type'), // weapon, armor, consumable, etc.
  quantity: integer('quantity').default(1),
  item_data: text('item_data'), // JSON string for item properties
  created_at: timestamp('created_at').defaultNow()
});

export const combat_logs = pgTable('combat_logs', {
  id: serial('id').primaryKey(),
  player_id: integer('player_id').references(() => players.id),
  enemy_name: text('enemy_name'),
  action_taken: text('action_taken'),
  damage_dealt: integer('damage_dealt'),
  damage_received: integer('damage_received'),
  result: text('result'), // victory, defeat, escape
  experience_gained: integer('experience_gained'),
  created_at: timestamp('created_at').defaultNow()
});

// Relations
export const playersRelations = relations(players, ({ many }) => ({
  game_sessions: many(game_sessions),
  inventory: many(player_inventory),
  combat_logs: many(combat_logs)
}));

export const gameSessionsRelations = relations(game_sessions, ({ one }) => ({
  player: one(players, {
    fields: [game_sessions.player_id],
    references: [players.id]
  })
}));

export const playerInventoryRelations = relations(player_inventory, ({ one }) => ({
  player: one(players, {
    fields: [player_inventory.player_id],
    references: [players.id]
  })
}));

export const combatLogsRelations = relations(combat_logs, ({ one }) => ({
  player: one(players, {
    fields: [combat_logs.player_id],
    references: [players.id]
  })
}));
