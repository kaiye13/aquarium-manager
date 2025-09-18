import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Aquarium, Parameter } from '../models/aquarium.model';
import { AquariumService } from '../services/aquarium.service';

@Component({
  selector: 'app-aquarium-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './aquarium-detail.component.html',
  styleUrl: './aquarium-detail.component.scss'
})
export class AquariumDetailComponent implements OnInit {
  aquarium$: Observable<Aquarium | undefined>;
  editingParameter: Parameter | null = null;

  constructor(
    private route: ActivatedRoute,
    private aquariumService: AquariumService
  ) {
    // Get aquarium by ID from route parameters
    const aquariumId = this.route.snapshot.params['id'];
    this.aquarium$ = this.aquariumService.getAquariums().pipe(
      map(aquariums => aquariums.find(a => a.id === aquariumId))
    );
  }

  ngOnInit(): void {}

  isParameterInRange(param: Parameter): boolean {
    return param.currentValue >= param.targetMin && param.currentValue <= param.targetMax;
  }

  getParameterStatusClass(param: Parameter): string {
    if (this.isParameterInRange(param)) return 'success';
    return 'danger';
  }

  editParameter(param: Parameter): void {
    this.editingParameter = { ...param };
  }

  saveParameter(): void {
    if (!this.editingParameter) return;
    
    const aquariumId = this.route.snapshot.params['id'];
    this.aquariumService.updateParameter(
      aquariumId, 
      this.editingParameter.id, 
      this.editingParameter
    );
    this.editingParameter = null;
  }

  cancelEdit(): void {
    this.editingParameter = null;
  }

  getDaysSinceAdded(dateAdded: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(dateAdded).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}