import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AquariumService } from '../services/aquarium.service';
import { Aquarium } from '../models/aquarium.model';

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
  totalSteps = 3;
  isSubmitting = false;
  showSuccess = false;

  aquariumTypes = [
    { value: 'freshwater', label: 'Freshwater', emoji: '🐠', description: 'Perfect for beginners and tropical fish' },
    { value: 'saltwater', label: 'Saltwater', emoji: '🌊', description: 'Marine environment for oceanic species' },
    { value: 'brackish', label: 'Brackish', emoji: '🦐', description: 'Mix of fresh and saltwater species' },
    { value: 'reef', label: 'Reef', emoji: '🐙', description: 'Advanced setup for corals and marine life' }
  ];

  commonCapacities = [10, 20, 40, 55, 75, 100, 125, 150, 200, 300];

  constructor(
    private fb: FormBuilder,
    private aquariumService: AquariumService,
    private router: Router
  ) {
    this.aquariumForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      type: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      notes: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {}

  get progressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
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
      const newAquarium: Omit<Aquarium, 'id'> = {
        name: formValue.name.trim(),
        type: formValue.type,
        capacity: Number(formValue.capacity),
        dateCreated: new Date(),
        parameters: this.getDefaultParameters(formValue.type),
        inhabitants: [],
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