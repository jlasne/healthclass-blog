import { ogImage, ogSize } from '@/lib/og';

export const alt = 'Health Class: your pelvic floor, taught by a urologist, Dr. Dana Kivlin';
export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return ogImage({ eyebrow: 'Letters from a urologist', title: 'Your pelvic floor, taught by a urologist.', pose: 'hello', tone: 'rosy' });
}
