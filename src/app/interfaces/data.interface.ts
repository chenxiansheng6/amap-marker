/**
 * Interface for the data
 */
export interface Data {
  id: string;
  name: string;
  description: string;
  lng: string;
  lat: string;
  images?: string[];
  created_at?: string;
  updated_at?: string;
}
