import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AquariumService } from '../services/aquarium.service';
import { AquariumDataService, AquariumType, InhabitantType, InhabitantLibraryItem } from '../services/aquarium-data.service';
import { Aquarium, Inhabitant } from '../models/aquarium.model';

interface InhabitantFormGroup extends FormGroup {
  value: {
    name: string;
    species: string;
    type: string;
    quantity: number;
    notes: string;
  };
  controls: {
    name: FormControl<string>;
    species: FormControl<string>;
    type: FormControl<string>;
    quantity: FormControl<number>;
    notes: FormControl<string>;
  };
}

@Component({
  selector: 'app-aquarium-new',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './aquarium-new.component.html',
  styleUrls: ['./aquarium-new.component.scss']
})
export class AquariumNewComponent implements OnInit {
  aquariumForm: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  isSubmitting = false;
  showSuccess = false;
  
  // Inhabitant library properties
  addMode: 'library' | 'custom' = 'library';
  libraryFilter = '';
  selectedLibraryType: string = '';

  // Data properties from service
  aquariumTypes: AquariumType[] = [];
  commonCapacities: number[] = [];
  inhabitantTypes: InhabitantType[] = [];
  inhabitantLibrary: InhabitantLibraryItem[] = [];

  constructor(
    private fb: FormBuilder,
    private aquariumService: AquariumService,
    private aquariumDataService: AquariumDataService,
    private router: Router
  ) {
    this.aquariumForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      type: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      notes: ['', Validators.maxLength(500)],
      inhabitants: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Initialize data from service (async loading from JSON files)
    this.aquariumDataService.getAquariumTypes().subscribe(types => {
      this.aquariumTypes = types;
    });

    this.aquariumDataService.getCommonCapacities().subscribe(capacities => {
      this.commonCapacities = capacities;
    });

    this.aquariumDataService.getInhabitantTypes().subscribe(types => {
      this.inhabitantTypes = types;
    });

    this.aquariumDataService.getInhabitantLibrary().subscribe(library => {
      this.inhabitantLibrary = library;
    });
  }

  get progressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  get inhabitants(): FormArray<InhabitantFormGroup> {
    return this.aquariumForm.get('inhabitants') as FormArray<InhabitantFormGroup>;
  }

  createInhabitantForm(): InhabitantFormGroup {
    return this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
      species: this.fb.control('', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
      type: this.fb.control('fish', [Validators.required]),
      quantity: this.fb.control(1, [Validators.required, Validators.min(1), Validators.max(1000)]),
      notes: this.fb.control('', [Validators.maxLength(200)])
    }) as InhabitantFormGroup;
  }

  addInhabitant(): void {
    this.inhabitants.push(this.createInhabitantForm());
  }

  removeInhabitant(index: number): void {
    this.inhabitants.removeAt(index);
  }

  get filteredLibrary() {
    let filtered = this.inhabitantLibrary;
    
    // Filter by type if selected
    if (this.selectedLibraryType) {
      filtered = filtered.filter(item => item.type === this.selectedLibraryType);
    }
    
    // Filter by search term
    if (this.libraryFilter.trim()) {
      const search = this.libraryFilter.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.species.toLowerCase().includes(search) ||
        item.notes.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }

  addInhabitantFromLibrary(libraryItem: any): void {
    const inhabitantForm = this.fb.group({
      name: this.fb.control(libraryItem.name, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
      species: this.fb.control(libraryItem.species, [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
      type: this.fb.control(libraryItem.type, [Validators.required]),
      quantity: this.fb.control(1, [Validators.required, Validators.min(1), Validators.max(1000)]),
      notes: this.fb.control(libraryItem.notes || '', [Validators.maxLength(200)])
    }) as InhabitantFormGroup;
    
    this.inhabitants.push(inhabitantForm);
  }

  setAddMode(mode: 'library' | 'custom'): void {
    this.addMode = mode;
  }

  clearLibraryFilters(): void {
    this.libraryFilter = '';
    this.selectedLibraryType = '';
  }

  getInhabitantEmoji(type: string): string {
    const inhabitantType = this.inhabitantTypes.find(t => t.value === type);
    return inhabitantType ? inhabitantType.emoji : '🐠';
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.libraryFilter = target.value;
  }

  onTypeFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedLibraryType = target.value;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.aquariumForm.get('name')?.valid || false;
      case 2:
        return this.aquariumForm.get('type')?.valid || false;
      case 3:
        return this.aquariumForm.get('capacity')?.valid || false;
      default:
        return false;
    }
  }

  selectCapacity(capacity: number): void {
    this.aquariumForm.patchValue({ capacity });
  }

  selectType(type: string): void {
    this.aquariumForm.patchValue({ type });
  }

  async onSubmit(): Promise<void> {
    // Only submit on the final step
    if (this.currentStep !== this.totalSteps) {
      return;
    }
    
    if (this.aquariumForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.aquariumForm.value;
      
      // Process inhabitants data with generated IDs
      const processedInhabitants: Inhabitant[] = formValue.inhabitants.map((inhabitant: any) => ({
        id: this.generateId(),
        name: inhabitant.name.trim(),
        species: inhabitant.species.trim(),
        type: inhabitant.type,
        quantity: Number(inhabitant.quantity),
        dateAdded: new Date(),
        notes: inhabitant.notes?.trim() || undefined
      }));
      
      const newAquarium: Omit<Aquarium, 'id'> = {
        name: formValue.name.trim(),
        type: formValue.type,
        capacity: Number(formValue.capacity),
        dateCreated: new Date(),
        parameters: this.getDefaultParameters(formValue.type),
        inhabitants: processedInhabitants,
        notes: formValue.notes?.trim() || undefined
      };

      try {
        // Replace simulated delay with the real service call (await in case it's async)
        await this.aquariumService.addAquarium(newAquarium);

        this.showSuccess = true;
        this.isSubmitting = false;
        
        // Navigate to aquarium list after success animation
        setTimeout(() => {
          this.router.navigate(['/aquariums']);
        }, 2000);
        
      } catch (error) {
        console.error('Error creating aquarium:', error);
        this.isSubmitting = false;
      }
    } else {
      // Surface validation errors in the UI
      if (!this.aquariumForm.valid) {
        Object.keys(this.aquariumForm.controls).forEach(key => {
          const control = this.aquariumForm.get(key);
          if (control) {
            control.markAsTouched();
          }
        });
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getDefaultParameters(type: string) {
    const baseParameters = [
      {
        id: this.generateId(),
        name: 'pH',
        currentValue: type === 'saltwater' || type === 'reef' ? 8.1 : 7.0,
        targetMin: type === 'saltwater' || type === 'reef' ? 7.8 : 6.5,
        targetMax: type === 'saltwater' || type === 'reef' ? 8.4 : 7.5,
        unit: '',
        lastUpdated: new Date()
      },
      {
        id: this.generateId(),
        name: 'Temperature',
        currentValue: type === 'reef' ? 26 : 24,
        targetMin: type === 'reef' ? 25 : 22,
        targetMax: type === 'reef' ? 27 : 26,
        unit: '°C',
        lastUpdated: new Date()
      },
      {
        id: this.generateId(),
        name: 'Ammonia',
        currentValue: 0,
        targetMin: 0,
        targetMax: 0.25,
        unit: 'ppm',
        lastUpdated: new Date()
      }
    ];

    if (type === 'saltwater' || type === 'reef') {
      baseParameters.push({
        id: this.generateId(),
        name: 'Salinity',
        currentValue: 35,
        targetMin: 34,
        targetMax: 36,
        unit: 'ppt',
        lastUpdated: new Date()
      });
    }

    return baseParameters;
  }

  getStepLabel(step: number): string {
    switch (step) {
      case 1: return 'Name';
      case 2: return 'Type';
      case 3: return 'Capacity';
      case 4: return 'Inhabitants';
      default: return '';
    }
  }

  goBack(): void {
    this.router.navigate(['/aquariums']);
  }
}