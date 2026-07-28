const fs = require('fs');

async function check() {
  const url = 'https://meny.dk/opskrift/sliders-torpedorejer-og-avocadocoleslaw';
  const res = await fetch(url);
  const html = await res.text();
  
  const images = html.match(/<img[^>]+src="([^"]+)"/g);
  if (images) {
    const dagrofa = images.filter(img => img.includes('dagrofa-dk'));
    console.log('Images found in HTML:');
    dagrofa.forEach(i => console.log(i));
  } else {
    console.log('No images found');
  }
}
check();
