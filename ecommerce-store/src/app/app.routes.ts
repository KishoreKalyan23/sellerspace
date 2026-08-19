import { Routes } from '@angular/router';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { FavoritesPageComponent } from './components/favorites-page/favorites-page.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { LocationPickerComponent } from './components/location-picker/location-picker.component';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'products/:id',
    component: ProductDetailComponent
  },
  {
    path: 'favorites',
    component: FavoritesPageComponent
  },
  {
    path: 'contact-us',
    component: ContactUsComponent
  },
  {
    path: 'location',
    component: LocationPickerComponent
  },
  {
    path: 'register',
    component: UserRegistrationComponent
  }
];
