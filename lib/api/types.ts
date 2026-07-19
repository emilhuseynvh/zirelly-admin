export type Translations = Record<string, Record<string, string | null>>;

export interface Language {
  id: number;
  code: string;
  name: string;
  native_name: string | null;
  is_default: boolean;
  is_active: boolean;
  position: number;
}

export interface Upload {
  id: number;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export interface Blog {
  id: number;
  slug: string;
  image: string | null;
  title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  translations?: Translations;
}

export interface ProductFeature {
  id: number;
  name: string | null;
  value: string | null;
  translations?: Translations;
}

export interface Product {
  id: number;
  slug: string;
  title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  description: string | null;
  price: number;
  discount: number | null;
  discount_type: "percent" | "fixed" | null;
  final_price: number;
  is_active: boolean;
  images: Upload[];
  features: ProductFeature[];
  rating: { average: number; count: number };
  created_at: string;
  updated_at: string;
  translations?: Translations;
}

export interface AboutItem {
  id: number;
  title: string | null;
  description: string | null;
  translations?: Translations;
}

export interface AboutPage {
  meta_title: string | null;
  meta_description: string | null;
  hero: {
    title: string | null;
    description: string | null;
    image: Upload | null;
  };
  section: {
    title: string | null;
    image: Upload | null;
    items: AboutItem[];
  };
  updated_at: string;
  translations?: Translations;
}

export interface HomeSlide {
  id: number;
  title: string | null;
  description: string | null;
  button_text: string | null;
  link: string | null;
  image: Upload | null;
  translations?: Translations;
}

export interface HomeStat {
  id: number;
  value: string;
  label: string | null;
  translations?: Translations;
}

export interface Testimonial {
  id: number;
  name: string;
  rating: number;
  comment: string | null;
  image: Upload | null;
  translations?: Translations;
}

export interface Faq {
  id: number;
  question: string | null;
  answer: string | null;
  translations?: Translations;
}

export interface HomePage {
  meta_title: string | null;
  meta_description: string | null;
  slides: HomeSlide[];
  stats: { title: string | null; items: HomeStat[] };
  banner: { button_text: string | null; link: string | null; image: Upload | null };
  testimonials: { title: string | null; items: Testimonial[] };
  faq: { title: string | null; items: Faq[] };
  updated_at: string;
  translations?: Translations;
}

export interface ProductsPageSlide {
  id: number;
  title: string | null;
  button_text: string | null;
  link: string | null;
  image: Upload | null;
  translations?: Translations;
}

export interface ProductsPage {
  meta_title: string | null;
  meta_description: string | null;
  products_title: string | null;
  slides: ProductsPageSlide[];
  side_image: Upload | null;
  updated_at: string;
  translations?: Translations;
}

export interface ContactPage {
  meta_title: string | null;
  meta_description: string | null;
  title: string | null;
  subtitle: string | null;
  email: string | null;
  phone: string | null;
  map_embed_url: string | null;
  updated_at: string;
  translations?: Translations;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  surname: string | null;
  phone: string | null;
  birth_date: string | null;
  email: string;
  role: "user" | "admin";
  email_verified: boolean;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type PromocodeType = "first_order" | "single_use" | "unlimited";

export interface Promocode {
  id: number;
  code: string;
  type: PromocodeType;
  discount_type: "percent" | "fixed";
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  uses_count: number;
  discount_total: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface OrderItem {
  id: number;
  product_id: number | null;
  title: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  product?: Product;
}

export interface Transaction {
  id: number;
  status: "pending" | "success" | "failed";
  method: string;
  amount: number;
  reference: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  total: number;
  promocode_code: string | null;
  items_count: number;
  paid_at: string | null;
  created_at: string;
  user?: User;
  items?: OrderItem[];
  transactions?: Transaction[];
}

export interface OrderStats {
  totals: {
    orders: number;
    paid_orders: number;
    revenue: number;
    discount_total: number;
    average_order: number;
  };
  by_day: { date: string; orders: number; revenue: number }[];
  by_status: { status: OrderStatus; count: number }[];
  top_products: { title: string; quantity: number; revenue: number }[];
  promocodes: { code: string; uses: number; discount_total: number }[];
}
