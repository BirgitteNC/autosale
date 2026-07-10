require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log("Checking buckets...");
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error("Error listing buckets:", bucketError);
  } else {
    console.log("Buckets:", buckets.map(b => b.name));
    if (!buckets.find(b => b.name === 'wardrobe-images')) {
      console.log("Bucket 'wardrobe-images' not found. Creating...");
      const { data, error } = await supabase.storage.createBucket('wardrobe-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      if (error) console.error("Error creating bucket:", error);
      else console.log("Bucket created!");
    } else {
      console.log("Bucket exists. Checking policies...");
    }
  }

  console.log("Fixing wardrobe items...");
  console.log("Fixing wardrobe items...");
  const { data, error } = await supabase.from('wardrobe_items').select('id, name, image_url');
  if (data) {
    for (let item of data) {
      if (item.image_url) {
        console.log(`Item: ${item.name}, URL length: ${item.image_url.length}`);
        if (item.image_url.startsWith('data:image') && item.image_url.length > 500000) {
          console.log("Deleting massive image for item:", item.name);
          await supabase.from('wardrobe_items').update({ image_url: null }).eq('id', item.id);
        }
      }
    }
  }
}
fix();
