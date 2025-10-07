// app/assets/pictures.ts

import { StaticImageData } from 'next/image';
import image1 from './SliderImage1.jpg';
import image2 from './SliderImage2.jpg';
import image3 from './SliderImage3.jpg';

// Define the type for the array of images.
// StaticImageData is a special type provided by 'next/image' for imported images.
const urls: StaticImageData[] = [
    image1,
    image2,
    image3,
];

export default urls;