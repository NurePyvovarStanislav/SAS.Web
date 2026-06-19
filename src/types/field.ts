export interface FieldDto {
  fieldId: string;
  name: string;
  cropType: string;
  area: number;
  location: string | null;
}

export interface FieldFormDto {
  name: string;
  cropType: string;
  area: number;
  location: string | null;
}
