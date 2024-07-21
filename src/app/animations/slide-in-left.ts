import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const slideInLeft = trigger('slideInLeft', [
  state('open', style({
    transform: 'translate3d(0, 0, 0)',
  })),
  state('close', style({
    transform: 'translate3d(-100%, 0, 0)',
  })),
  transition('open <=> close', [
    animate('0.3s ease-in-out'),
  ]),
]);