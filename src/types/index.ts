export interface Venue {
  id: string;
  name: string;
  address: string;
  mapEmbedUrl: string;
  date: string;
  time: string;
  order: number;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  status: "yes" | "no" | "maybe";
  plusOne: {
    attending: boolean;
    name: string;
  };
  dietaryRequirements: string;
  message: string;
  createdAt: number;
}

export interface WeddingData {
  cardImageUrl: string | null;
  cardPdfUrl: string | null;
  createdAt: number;
}
