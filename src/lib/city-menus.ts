import { dishes, type Dish } from "./data";

type City = "hyderabad" | "pune" | "mumbai" | "bengaluru" | "delhi";

const plate = (
  id: string,
  name: string,
  restaurant: string,
  area: string,
  lat: number,
  lng: number,
  family: Dish["family"],
  price: number,
  veg: boolean,
  tags: string[],
  allergens: string[] = [],
): Dish => ({
  id,
  name,
  restaurant,
  restaurantId: id,
  cuisine: tags[0] || family,
  family,
  price,
  rating: 4.5,
  restaurantRating: 4.5,
  area,
  lat,
  lng,
  minutes: 25,
  vegetarian: veg,
  vegan: false,
  spice: 2,
  oily: tags.includes("fried"),
  tags,
  allergens,
  description: name,
  imagePosition: "50% 50%",
});

const extra: Record<Exclude<City, "hyderabad">, Dish[]> = {
  pune: [
    plate("pn-1", "Misal Pav", "Bedekar", "Narayan Peth", 18.516, 73.855, "street", 12000, true, ["Maharashtrian", "spicy"]),
    plate("pn-2", "Chicken Thali", "Sujata", "Sadashiv Peth", 18.51, 73.844, "comfort", 28000, false, ["hearty"]),
    plate("pn-3", "Hakka Noodles", "Oriental Leaf", "Kothrud", 18.507, 73.807, "street", 22000, true, ["Chinese", "light"]),
    plate("pn-4", "Grilled Chicken Bowl", "Fit Kitchen", "Baner", 18.56, 73.776, "comfort", 32000, false, ["healthy", "protein"]),
  ],
  mumbai: [
    plate("mb-1", "Vada Pav", "Ashok Vada Pav", "Dadar", 19.018, 72.844, "street", 4000, true, ["snack"]),
    plate("mb-2", "Prawn Koliwada", "Gajalee", "Vile Parle", 19.1, 72.84, "street", 45000, false, ["seafood"]),
    plate("mb-3", "Veg Hakka Noodles", "China Gate", "Bandra", 19.054, 72.84, "street", 28000, true, ["Chinese"]),
    plate("mb-4", "Quinoa Millet Bowl", "Farzi Cafe", "Lower Parel", 18.995, 72.825, "comfort", 39000, true, ["healthy"]),
  ],
  bengaluru: [
    plate("bl-1", "Bisi Bele Bath", "CTR", "Malleshwaram", 13.003, 77.57, "south", 16000, true, ["South Indian", "comfort"]),
    plate("bl-2", "Chicken Ghee Roast", "Mangalore Pearl", "Indiranagar", 12.978, 77.64, "curry", 34000, false, ["hearty"]),
    plate("bl-3", "Chilli Paneer", "Beijing Bites", "Koramangala", 12.935, 77.624, "street", 26000, true, ["Chinese"]),
    plate("bl-4", "Grilled Fish and Greens", "The Green Table", "HSR Layout", 12.912, 77.644, "comfort", 42000, false, ["healthy", "light"]),
  ],
  delhi: [
    plate("dl-1", "Butter Chicken", "Gulati", "Pandara Road", 28.607, 77.23, "curry", 48000, false, ["North Indian", "hearty"], ["Dairy"]),
    plate("dl-2", "Chole Bhature", "Sita Ram", "Paharganj", 28.641, 77.216, "street", 18000, true, ["hearty"]),
    plate("dl-3", "Chilli Chicken", "Andhra Bhavan", "Feroze Shah", 28.625, 77.227, "street", 32000, false, ["Chinese", "spicy"]),
    plate("dl-4", "Tandoori Chicken Salad", "Farzi", "Connaught Place", 28.632, 77.22, "tandoor", 36000, false, ["healthy", "protein"]),
  ],
};

export function cityFrom(location: string): City {
  const text = location.toLowerCase();
  if (/pune|kothrud|baner|koregaon|shivaji nagar|hinjewadi/.test(text)) return "pune";
  if (/mumbai|bombay|bandra|dadar|andheri|powai/.test(text)) return "mumbai";
  if (/bengaluru|bangalore|indiranagar|koramangala|hsr|malleshwaram/.test(text)) return "bengaluru";
  if (/delhi|hauz khas|connaught|pandara|paharganj/.test(text)) return "delhi";
  return "hyderabad";
}

export function menuFor(location: string): Dish[] {
  const city = cityFrom(location);
  if (city === "hyderabad") return dishes;
  return extra[city];
}
