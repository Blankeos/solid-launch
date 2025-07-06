import { BProgress } from '@bprogress/core';

// Create custom page transition animations
export async function onPageTransitionEnd() {
  console.log('END');
  BProgress.done();
}
