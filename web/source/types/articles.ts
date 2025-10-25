export interface Article {
  id: string;
  slug: string;                
  title: string;
  summary?: string;
  bodyMarkdown?: string;
  imageUrls?: string[];         
  sources?: string[];           
  sport?: "NFL" | "NBA" | "MLB" | "NHL";
  status?: "draft" | "published";
  createdAt?: any;              
  weekKey?: string;             
  teams?: { home?: string; away?: string };
}
