const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://woyljiptosmecmdkjiay.supabase.co', 'sb_publishable_g98HhXGrR6EkSODEde7qsg_0r6CXaA_');

async function setup() {
  const { data, error } = await supabase.storage.createBucket('wardrobe-images', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });
  if (error) {
    console.error('Error creating bucket:', error);
  } else {
    console.log('Bucket created:', data);
  }
}
setup();
