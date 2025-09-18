import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysSince',
  pure: true,
  standalone: true
})
export class DaysSincePipe implements PipeTransform {
  
  transform(date: Date | string): number {
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - targetDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}