import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { AquariumService } from '../services/aquarium.service';
import { Aquarium, Inhabitant } from '../models/aquarium.model';

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

  aquariumTypes = [
    { value: 'freshwater', label: 'Freshwater', emoji: '🐠', description: 'Perfect for beginners and tropical fish' },
    { value: 'saltwater', label: 'Saltwater', emoji: '🌊', description: 'Marine environment for oceanic species' },
    { value: 'brackish', label: 'Brackish', emoji: '🦐', description: 'Mix of fresh and saltwater species' },
    { value: 'reef', label: 'Reef', emoji: '🐙', description: 'Advanced setup for corals and marine life' }
  ];

  commonCapacities = [10, 20, 40, 55, 75, 100, 125, 150, 200, 300];

  inhabitantTypes = [
    { value: 'fish', label: 'Fish', emoji: '🐠' },
    { value: 'invertebrate', label: 'Invertebrate', emoji: '🦐' },
    { value: 'plant', label: 'Plant', emoji: '🌱' },
    { value: 'coral', label: 'Coral', emoji: '🪸' }
  ];

  inhabitantLibrary = [
    // Popular Freshwater Fish
    { name: 'Neon Tetra', species: 'Paracheirodon innesi', type: 'fish', notes: 'Peaceful schooling fish, keep in groups of 6+' },
    { name: 'Betta Fish', species: 'Betta splendens', type: 'fish', notes: 'Solitary fish, needs warm water 24-28°C' },
    { name: 'Guppy', species: 'Poecilia reticulata', type: 'fish', notes: 'Easy to breed, colorful, peaceful community fish' },
    { name: 'Angelfish', species: 'Pterophyllum scalare', type: 'fish', notes: 'Semi-aggressive, needs tall tank, pairs well' },
    { name: 'Corydoras Catfish', species: 'Corydoras paleatus', type: 'fish', notes: 'Bottom dweller, peaceful, keep in groups' },
    { name: 'Pleco', species: 'Hypostomus plecostomus', type: 'fish', notes: 'Algae eater, can grow large, nocturnal' },
    { name: 'Molly', species: 'Poecilia sphenops', type: 'fish', notes: 'Hardy, peaceful, can adapt to brackish water' },
    { name: 'Swordtail', species: 'Xiphophorus hellerii', type: 'fish', notes: 'Active swimmer, peaceful, easy to breed' },
    
    // Saltwater Fish
    { name: 'Clownfish', species: 'Amphiprion ocellatus', type: 'fish', notes: 'Symbiotic with anemones, hardy marine fish' },
    { name: 'Blue Tang', species: 'Paracanthurus hepatus', type: 'fish', notes: 'Active swimmer, needs large tank, reef safe' },
    { name: 'Yellow Tang', species: 'Zebrasoma flavescens', type: 'fish', notes: 'Herbivorous, territorial, bright yellow coloration' },
    { name: 'Mandarin Fish', species: 'Synchiropus splendidus', type: 'fish', notes: 'Requires established tank with copepods' },
    
    // Plants
    { name: 'Java Moss', species: 'Taxiphyllum barbieri', type: 'plant', notes: 'Easy care, low light, good for beginners' },
    { name: 'Anubias', species: 'Anubias barteri', type: 'plant', notes: 'Low light, attach to rocks/wood, slow growing' },
    { name: 'Amazon Sword', species: 'Echinodorus amazonicus', type: 'plant', notes: 'Background plant, needs root tabs, moderate light' },
    { name: 'Java Fern', species: 'Microsorum pteropus', type: 'plant', notes: 'Hardy, low light, attach to hardscape' },
    { name: 'Hornwort', species: 'Ceratophyllum demersum', type: 'plant', notes: 'Fast growing, floating or planted, nutrient absorber' },
    { name: 'Cryptocoryne', species: 'Cryptocoryne wendtii', type: 'plant', notes: 'Foreground plant, low light, melts initially' },
    
    // Invertebrates
    { name: 'Cherry Shrimp', species: 'Neocaridina davidi', type: 'invertebrate', notes: 'Algae eater, breeds easily, peaceful' },
    { name: 'Amano Shrimp', species: 'Caridina multidentata', type: 'invertebrate', notes: 'Excellent algae eater, larger than cherry shrimp' },
    { name: 'Mystery Snail', species: 'Pomacea bridgesii', type: 'invertebrate', notes: 'Algae eater, colorful, lays eggs above water' },
    { name: 'Hermit Crab', species: 'Calcinus elegans', type: 'invertebrate', notes: 'Scavenger, needs shells for growth, saltwater' },
    { name: 'Cleaner Shrimp', species: 'Lysmata amboinensis', type: 'invertebrate', notes: 'Cleans fish, reef safe, saltwater only' },
    
    // Corals
    { name: 'Green Star Polyp', species: 'Briareum violacea', type: 'coral', notes: 'Easy coral, fast growing, low to moderate light' },
    { name: 'Mushroom Coral', species: 'Discosoma sp.', type: 'coral', notes: 'Beginner coral, low light, various colors' },
    { name: 'Zoa Polyps', species: 'Zoanthus sp.', type: 'coral', notes: 'Colorful, moderate care, can be toxic' },
    { name: 'Hammer Coral', species: 'Euphyllia ancora', type: 'coral', notes: 'LPS coral, moderate light, needs feeding' }
  ];

  constructor(
    private fb: FormBuilder,
    private aquariumService: AquariumService,
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

  ngOnInit(): void {}

  get progressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  get inhabitants(): FormArray {
    return this.aquariumForm.get('inhabitants') as FormArray;
  }

  createInhabitantForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      species: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      type: ['fish', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      notes: ['', Validators.maxLength(200)]
    });
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
      name: [libraryItem.name, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      species: [libraryItem.species, [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      type: [libraryItem.type, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      notes: [libraryItem.notes || '', Validators.maxLength(200)]
    });
    
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
    console.log('onSubmit called');
    console.log('Current step:', this.currentStep);
    console.log('Total steps:', this.totalSteps);
    console.log('Form valid:', this.aquariumForm.valid);
    console.log('Is submitting:', this.isSubmitting);
    console.log('Form value:', this.aquariumForm.value);
    
    // Only submit on the final step
    if (this.currentStep !== this.totalSteps) {
      console.log('Not on final step, preventing submission');
      return;
    }
    
    if (this.aquariumForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      console.log('Starting submission process');

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

      console.log('New aquarium object to be added:', newAquarium);

      try {
        // Simulate API call delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('About to call aquariumService.addAquarium');
        this.aquariumService.addAquarium(newAquarium);
        console.log('Called aquariumService.addAquarium successfully');
        
        // Add a visible alert for debugging
        alert('Aquarium has been added to the service!');
        
        this.showSuccess = true;
        
        // Navigate to aquarium list after success animation
        setTimeout(() => {
          console.log('Navigating to /aquariums');
          this.router.navigate(['/aquariums']);
        }, 2000);
        
      } catch (error) {
        console.error('Error creating aquarium:', error);
        this.isSubmitting = false;
      }
    } else {
      console.log('Form validation failed or already submitting');
      if (!this.aquariumForm.valid) {
        console.log('Form errors:', this.aquariumForm.errors);
        Object.keys(this.aquariumForm.controls).forEach(key => {
          const control = this.aquariumForm.get(key);
          if (control && control.invalid) {
            console.log(`${key} errors:`, control.errors);
          }
        });
      }
    }
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'param-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultParameters(type: string) {
    const baseParameters = [
      {
        id: this.generateId(),
        name: 'pH',
        currentValue: type === 'saltwater' || type === 'reef' ? 8.2 : 7.0,
        targetMin: type === 'saltwater' || type === 'reef' ? 8.0 : 6.8,
        targetMax: type === 'saltwater' || type === 'reef' ? 8.4 : 7.4,
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

  goBack(): void {
    this.router.navigate(['/aquariums']);
  }
}