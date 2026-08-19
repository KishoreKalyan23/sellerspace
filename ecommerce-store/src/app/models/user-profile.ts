export interface UserProfile {
  id: number;
  name: string;
  age: number;
  gender: string;
  mobileNumber: string;
  email: string;
  favoriteProductIds: number[];
  preferredCategories: string[];
  preferredVendors: string[];
}
