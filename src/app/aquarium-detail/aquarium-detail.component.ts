import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Aquarium, Parameter } from '../models/aquarium.model';
import { AquariumService } from '../services/aquarium.service';
import { DaysSincePipe } from '../pipes/days-since.pipe';
import { ParameterStatusPipe } from '../pipes/parameter-status.pipe';

@Component({
  selector: 'app-aquarium-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DaysSincePipe, ParameterStatusPipe],
  templateUrl: './aquarium-detail.component.html',
  styleUrls: ['./aquarium-detail.component.scss']
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

  addInhabitant(): void {
    // For now, we'll add a simple dialog-like prompt
    // In a real app, you might open a modal dialog or navigate to a form
    const aquariumId = this.route.snapshot.params['id'];
    
    const name = prompt('Enter inhabitant name:');
    if (!name) return;
    
    const species = prompt('Enter species:') || '';
    const typeInput = prompt('Enter type (fish, invertebrate, plant, coral):') || 'fish';
    const quantityInput = prompt('Enter quantity:') || '1';
    
    // Validate type
    const validTypes = ['fish', 'invertebrate', 'plant', 'coral'];
    const type = validTypes.includes(typeInput) ? typeInput as any : 'fish';
    
    const quantity = parseInt(quantityInput) || 1;
    const notes = prompt('Enter notes (optional):') || '';

    const newInhabitant = {
      name,
      species,
      type,
      quantity,
      dateAdded: new Date(),
      notes: notes || undefined
    };

    this.aquariumService.addInhabitant(aquariumId, newInhabitant);
  }

  trackByParameterId(index: number, param: Parameter): string {
    return param.id;
  }

  trackByInhabitantId(index: number, inhabitant: any): string {
    return inhabitant.id;
  }
}