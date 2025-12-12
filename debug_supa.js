import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ciodvktfajvjpemcpvkj.supabase.co';
// User provided calling key
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpb2R2a3RmYWp2anBlbWNwdmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjI0MTQsImV4cCI6MjA4MTA5ODQxNH0.yooeRR1od15PvqIzkTLpj9JFPpQLZkgnZV83XXvSwK0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log("1. Testing Public Read Access...");
  const { data, error } = await supabase.from('store_settings').select('*');
  if (error) {
    console.error("❌ READ FAILED:", error.message);
    console.error("   -> Cause: RLS Policies are blocking access. Run the SQL I gave you!");
  } else {
    console.log("✅ Read Success. Data:", data);
    if (data.length === 0) {
        console.warn("⚠️ Table is empty! Upsert logic should have fixed this.");
    }
  }

  console.log("\n2. Testing Realtime Subscription...");
  const channel = supabase.channel('debug_test')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, (payload) => {
        console.log("✅ REALTIME EVENT RECEIVED:", payload.eventType);
        process.exit(0); // Success!
    })
    .subscribe((status) => {
        console.log("   -> Subscription Status:", status);
        if (status === 'SUBSCRIBED') {
            console.log("   -> Listening for changes...");
            // Trigger an update to test
            setTimeout(async () => {
                console.log("\n3. Triggering Update...");
                // Note: Anonymous update usually fails due to policies, but let's try.
                // If this fails, we can't test functionality fully from script, 
                // but if Read worked, Realtime *should* work if Replication is on.
                console.log("   (Skipping update from script as it requires Auth, waiting for manual toggle if needed, or exiting)");
                console.log("   If you see 'SUBSCRIBED' but no events when you click the button in the app, REPLICATION is likely OFF.");
                // We keep it alive for a few seconds to see if any events come in
                setTimeout(() => {
                    console.log("   No events received in 5 seconds.");
                    process.exit(0); 
                }, 5000);
            }, 1000);
        }
    });
}

test();
