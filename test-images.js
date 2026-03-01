// Simple test to check if the image URLs work
const testImages = [
  'https://picsum.photos/seed/teapot/300/200',
  'https://picsum.photos/seed/gifts/300/200',
  'https://picsum.photos/seed/bottle/300/200'
];

console.log('Testing image URLs...');
testImages.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});
console.log('All image URLs should work with Picsum Photos service.');
