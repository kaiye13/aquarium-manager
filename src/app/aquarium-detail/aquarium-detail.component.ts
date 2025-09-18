import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Aquarium, Parameter } from '../models/aquarium.model';
import { AquariumService } from '../services/aquarium.service';
import { DaysSincePipe } from '../pipes/days-since.pipe';
import { ParameterStatusPipe } from '../pipes/parameter-status.pipe';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-aquarium-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, DaysSincePipe, ParameterStatusPipe],
  templateUrl: './aquarium-detail.component.html',
  styleUrls: ['./aquarium-detail.component.scss']
})
export class AquariumDetailComponent implements OnInit {
  aquarium$: Observable<Aquarium | undefined>;
  editingParameter: Parameter | null = null;
  constructor(
    private route: ActivatedRoute,
    private aquariumService: AquariumService,
    private fb: FormBuilder
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

  openAddInhabitantModal(): void {
  // Open modal with reactive form
}

  addInhabitant(): void {
    // TODO: Replace with proper modal dialog or form component
    // This is a temporary implementation
    const aquariumId = this.route.snapshot.params['id'];
    
    const name = prompt('Enter inhabitant name:');
    if (!name?.trim()) return;
    
    const species = prompt('Enter species:') || '';
    const typeInput = prompt('Enter type (fish, invertebrate, plant, coral):') || 'fish';
    const quantityInput = prompt('Enter quantity:') || '1';
    
    // Validate type with proper typing
    const validTypes = ['fish', 'invertebrate', 'plant', 'coral'] as const;
    type ValidType = typeof validTypes[number];
    const type: ValidType = validTypes.includes(typeInput as ValidType) ? typeInput as ValidType : 'fish';
    
    const quantity = Math.max(1, parseInt(quantityInput) || 1);
    const notes = prompt('Enter notes (optional):') || '';

    const newInhabitant = {
      name: name.trim(),
      species: species.trim(),
      type,
      quantity,
      dateAdded: new Date(),
      notes: notes?.trim() || undefined
    };

    try {
      this.aquariumService.addInhabitant(aquariumId, newInhabitant);
      // TODO: Add success feedback to user
    } catch (error) {
      console.error('Failed to add inhabitant:', error);
      // TODO: Add error feedback to user
    }
  }
  trackByParameterId(index: number, param: Parameter): string {
    return param.id;
  }

  trackByInhabitantId(index: number, inhabitant: any): string {
    return inhabitant.id;
  }
}