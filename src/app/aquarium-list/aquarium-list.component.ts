import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Aquarium } from '../models/aquarium.model';
import { AquariumService } from '../services/aquarium.service';

@Component({
  selector: 'app-aquarium-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aquarium-list.component.html',
  styleUrl: './aquarium-list.component.scss'
})
export class AquariumListComponent implements OnInit {
  aquariums$: Observable<Aquarium[]>;

  constructor(private aquariumService: AquariumService) {
    this.aquariums$ = this.aquariumService.getAquariums();
  }

  ngOnInit(): void {}

  getParameterStatus(aquarium: Aquarium): { inRange: number; total: number } {
    const total = aquarium.parameters.length;
    const inRange = aquarium.parameters.filter(param => 
      param.currentValue >= param.targetMin && param.currentValue <= param.targetMax
    ).length;
    
    return { inRange, total };
  }

  getStatusColor(aquarium: Aquarium): string {
    const status = this.getParameterStatus(aquarium);
    const percentage = status.total > 0 ? (status.inRange / status.total) * 100 : 100;
    
    if (percentage === 100) return 'success';
    if (percentage >= 80) return 'warning';
    return 'danger';
  }
}