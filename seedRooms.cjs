/**
 * Seed a few rooms into the database.
 * Usage: node scripts/seedRooms.cjs
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in env before seeding.");
  process.exit(1);
}

const supabase = createClient(url, anon);

const rooms = [
  { name: "Burnout SOS", description: "Say it out loud. Quick vents welcome." },
  { name: "Founder Venting", description: "Shipping is hard. Share the messy middle." },
  { name: "Career Crossroads", description: "Interviews, transitions, and everything in between." },
  { name: "Wellness Wins", description: "Tiny habits, mood check-ins, and gentle accountability." }
];

const run = async () => {
  for (const r of rooms) {
    const { error } = await supabase.from('rooms').insert(r);
    if (error) console.error("Insert error:", r.name, error.message);
    else console.log("Inserted:", r.name);
  }
  process.exit(0);
};

run();
