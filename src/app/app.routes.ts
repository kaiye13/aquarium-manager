import { Routes } from '@angular/router';
import { AquariumListComponent } from './aquarium-list/aquarium-list.component';
import { AquariumDetailComponent } from './aquarium-detail/aquarium-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'aquariums', pathMatch: 'full' },
  { path: 'aquariums', component: AquariumListComponent },
  { path: 'aquarium/:id', component: AquariumDetailComponent },
  { path: 'aquarium/new', component: AquariumDetailComponent, data: { mode: 'create' } },
  { path: '**', redirectTo: 'aquariums' }
];
