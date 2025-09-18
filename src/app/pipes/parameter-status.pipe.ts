import { Pipe, PipeTransform } from '@angular/core';
import { Parameter } from '../models/aquarium.model';

@Pipe({
  name: 'parameterStatus',
  standalone: true,
  pure: true
})
export class ParameterStatusPipe implements PipeTransform {
  transform(param: Parameter): string {
    if (param.currentValue >= param.targetMin && param.currentValue <= param.targetMax) {
      return 'success';
    }
    return 'danger';
  }
}