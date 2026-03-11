const https = require('https');
https.get('https://unpkg.com/@elevenlabs/convai-widget-embed', (res) => {
  let output = '';
  res.on('data', d => output += d);
  res.on('end', () => {
    const triggerMatch = output.match(/class="[^"]*trigger[^"]*"/ig) || [];
    const fixedMatch = output.match(/fixed/g) || [];
    const btnMatch = output.match(/<button[^>]*>/ig) || [];
    console.log("Triggers:", triggerMatch.length);
    console.log("Fixed:", fixedMatch.length);
    console.log("Buttons:", btnMatch.length);
  });
});
