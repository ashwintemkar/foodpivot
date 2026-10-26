export type Diet = "any" | "veg" | "nonveg" | "vegan";
export type Spice = 1 | 2 | 3;
export type DishFamily =
  | "biryani"
  | "tandoor"
  | "south"
  | "curry"
  | "dal"
  | "street"
  | "comfort"
  | "kebab"
  | "bread";

export type FoodPhotoClass = "food-biryani" | "food-tandoor" | "food-south" | "food-curry" | "food-street";

export function foodPhotoClass(family: DishFamily): FoodPhotoClass {
  switch (family) {
    case "biryani":
      return "food-biryani";
    case "tandoor":
    case "kebab":
    case "bread":
      return "food-tandoor";
    case "south":
      return "food-south";
    case "curry":
    case "dal":
      return "food-curry";
    default:
      return "food-street";
  }
}

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  minutes: number;
  area: string;
  lat: number;
  lng: number;
};

export type Dish = {
  id: string;
  name: string;
  restaurant: string;
  restaurantId: string;
  cuisine: string;
  family: DishFamily;
  price: number;
  rating: number;
  restaurantRating: number;
  area: string;
  lat: number;
  lng: number;
  minutes: number;
  vegetarian: boolean;
  vegan: boolean;
  spice: Spice;
  oily: boolean;
  tags: string[];
  allergens: string[];
  description: string;
  imagePosition: string;
};

export type Order = {
  id: string;
  restaurant: string;
  items: string[];
  total: number;
  status: "Delivered" | "Preparing" | "Out for delivery";
  date: string;
};

export const restaurants: Restaurant[] = [
  { id: "r1", name: "Monsoon Table", cuisine: "Hyderabadi", rating: 4.6, minutes: 28, area: "Banjara Hills", lat: 17.415, lng: 78.4346 },
  { id: "r2", name: "Copper Tiffin", cuisine: "South Indian", rating: 4.4, minutes: 24, area: "Ameerpet", lat: 17.4375, lng: 78.4483 },
  { id: "r3", name: "Nani's Courtyard", cuisine: "North Indian", rating: 4.5, minutes: 32, area: "Somajiguda", lat: 17.4244, lng: 78.4576 },
  { id: "r4", name: "The Curry Chapter", cuisine: "Modern Indian", rating: 4.3, minutes: 26, area: "Madhapur", lat: 17.4483, lng: 78.3915 },
  { id: "r5", name: "Saffron Route", cuisine: "Hyderabadi", rating: 4.7, minutes: 30, area: "Film Nagar", lat: 17.4158, lng: 78.4095 },
  { id: "r6", name: "Dosa District", cuisine: "South Indian", rating: 4.4, minutes: 22, area: "Jubilee Hills", lat: 17.4239, lng: 78.407 },
  { id: "r7", name: "Bombay Canteenette", cuisine: "Street", rating: 4.2, minutes: 20, area: "Mehdipatnam", lat: 17.394, lng: 78.438 },
  { id: "r8", name: "Green Tadka", cuisine: "Vegetarian", rating: 4.5, minutes: 25, area: "Gachibowli", lat: 17.4401, lng: 78.3489 },
  { id: "r9", name: "Kolkata Kitchen", cuisine: "Bengali", rating: 4.3, minutes: 34, area: "Secunderabad", lat: 17.4399, lng: 78.4983 },
  { id: "r10", name: "Punjab Pantry", cuisine: "Punjabi", rating: 4.6, minutes: 29, area: "Kondapur", lat: 17.4622, lng: 78.3648 },
  { id: "r11", name: "Charminar Dum House", cuisine: "Hyderabadi", rating: 4.9, minutes: 48, area: "Charminar", lat: 17.3616, lng: 78.4747 },
];

export const restaurantById = Object.fromEntries(restaurants.map((entry) => [entry.id, entry])) as Record<
  string,
  Restaurant
>;

type DishSeed = {
  name: string;
  restaurantId: Restaurant["id"];
  cuisine: string;
  family: DishFamily;
  price: number;
  vegetarian: boolean;
  vegan?: boolean;
  spice: Spice;
  oily: boolean;
  tags: string[];
  allergens: string[];
  description: string;
  rating: number;
  minutes: number;
};

const catalog: DishSeed[] = [
  {
    name: "Dum Chicken Biryani",
    restaurantId: "r1",
    cuisine: "Hyderabadi",
    family: "biryani",
    price: 28900,
    vegetarian: false,
    spice: 3,
    oily: false,
    tags: ["Bestseller", "Protein-rich"],
    allergens: ["Dairy"],
    description: "Slow-sealed basmati, saffron and tender spiced chicken.",
    rating: 4.8,
    minutes: 28,
  },
  {
    name: "Smoked Paneer Tikka",
    restaurantId: "r3",
    cuisine: "North Indian",
    family: "tandoor",
    price: 25900,
    vegetarian: true,
    spice: 2,
    oily: false,
    tags: ["Vegetarian", "Tandoor"],
    allergens: ["Dairy"],
    description: "Charred cottage cheese, peppers and mint chutney.",
    rating: 4.6,
    minutes: 26,
  },
  {
    name: "Masala Dosa",
    restaurantId: "r6",
    cuisine: "South Indian",
    family: "south",
    price: 16900,
    vegetarian: true,
    spice: 2,
    oily: false,
    tags: ["Vegetarian", "Breakfast"],
    allergens: ["Mustard"],
    description: "Crisp fermented rice crepe with turmeric potato.",
    rating: 4.5,
    minutes: 22,
  },
  {
    name: "Butter Chicken",
    restaurantId: "r10",
    cuisine: "North Indian",
    family: "curry",
    price: 32900,
    vegetarian: false,
    spice: 1,
    oily: true,
    tags: ["Comfort", "Protein-rich"],
    allergens: ["Dairy", "Cashew"],
    description: "Tandoor chicken in a velvety tomato and fenugreek sauce.",
    rating: 4.7,
    minutes: 32,
  },
  {
    name: "Dal Tadka Bowl",
    restaurantId: "r8",
    cuisine: "North Indian",
    family: "dal",
    price: 19900,
    vegetarian: true,
    vegan: true,
    spice: 2,
    oily: false,
    tags: ["Vegan", "Light"],
    allergens: [],
    description: "Yellow lentils tempered with cumin, garlic and chilli.",
    rating: 4.4,
    minutes: 24,
  },
  {
    name: "Kathi Chicken Roll",
    restaurantId: "r7",
    cuisine: "Bengali",
    family: "street",
    price: 21900,
    vegetarian: false,
    spice: 2,
    oily: true,
    tags: ["Street", "Quick"],
    allergens: ["Gluten", "Egg"],
    description: "Flaky paratha wrapped around peppery chicken.",
    rating: 4.3,
    minutes: 20,
  },
  {
    name: "Palak Corn Khichdi",
    restaurantId: "r8",
    cuisine: "Modern Indian",
    family: "comfort",
    price: 23900,
    vegetarian: true,
    spice: 1,
    oily: false,
    tags: ["Light", "Comfort"],
    allergens: ["Dairy"],
    description: "Comforting rice and lentils with spinach and sweet corn.",
    rating: 4.5,
    minutes: 25,
  },
  {
    name: "Chettinad Pepper Chicken",
    restaurantId: "r2",
    cuisine: "Tamil",
    family: "curry",
    price: 31900,
    vegetarian: false,
    spice: 3,
    oily: false,
    tags: ["Spicy", "Protein-rich"],
    allergens: ["Coconut"],
    description: "Dark-roasted spices, coconut and cracked pepper.",
    rating: 4.6,
    minutes: 30,
  },
  {
    name: "Chole Kulcha",
    restaurantId: "r10",
    cuisine: "Punjabi",
    family: "bread",
    price: 18900,
    vegetarian: true,
    spice: 2,
    oily: false,
    tags: ["Vegetarian", "Comfort"],
    allergens: ["Gluten"],
    description: "Tangy chickpeas with soft, toasted kulcha.",
    rating: 4.4,
    minutes: 27,
  },
  {
    name: "Awadhi Galouti Plate",
    restaurantId: "r5",
    cuisine: "Lucknowi",
    family: "kebab",
    price: 34900,
    vegetarian: false,
    spice: 2,
    oily: true,
    tags: ["Premium", "Protein-rich"],
    allergens: ["Gluten", "Dairy"],
    description: "Melt-soft kebabs with saffron paratha and onion.",
    rating: 4.7,
    minutes: 34,
  },
  {
    name: "Goat Dum Biryani",
    restaurantId: "r5",
    cuisine: "Hyderabadi",
    family: "biryani",
    price: 36900,
    vegetarian: false,
    spice: 3,
    oily: false,
    tags: ["Premium", "Bestseller"],
    allergens: ["Dairy"],
    description: "Marrow-rich goat, seared onions and long-grain basmati.",
    rating: 4.8,
    minutes: 36,
  },
  {
    name: "Vegetable Dum Biryani",
    restaurantId: "r8",
    cuisine: "Hyderabadi",
    family: "biryani",
    price: 24900,
    vegetarian: true,
    spice: 2,
    oily: false,
    tags: ["Vegetarian", "Aromatic"],
    allergens: ["Dairy"],
    description: "Seasonal vegetables, mint, fried onion and saffron milk.",
    rating: 4.4,
    minutes: 27,
  },
  {
    name: "Egg Biryani Bowl",
    restaurantId: "r4",
    cuisine: "Hyderabadi",
    family: "biryani",
    price: 22900,
    vegetarian: false,
    spice: 2,
    oily: false,
    tags: ["Value", "Protein-rich"],
    allergens: ["Egg", "Dairy"],
    description: "Soft-boiled eggs nested in lightly spiced dum rice.",
    rating: 4.3,
    minutes: 24,
  },
  {
    name: "Lucknowi Chicken Biryani",
    restaurantId: "r3",
    cuisine: "Lucknowi",
    family: "biryani",
    price: 31900,
    vegetarian: false,
    spice: 2,
    oily: false,
    tags: ["Aromatic", "Protein-rich"],
    allergens: ["Dairy"],
    description: "Subtler spices, kewra and slow-cooked chicken.",
    rating: 4.6,
    minutes: 31,
  },
  {
    name: "Mint Raita",
    restaurantId: "r1",
    cuisine: "Hyderabadi",
    family: "comfort",
    price: 4500,
    vegetarian: true,
    spice: 1,
    oily: false,
    tags: ["Side", "Cooling"],
    allergens: ["Dairy"],
    description: "Yogurt, mint and roasted cumin — the usual biryani partner.",
    rating: 4.5,
    minutes: 18,
  },
  {
    name: "Filter Coffee",
    restaurantId: "r6",
    cuisine: "South Indian",
    family: "south",
    price: 7900,
    vegetarian: true,
    spice: 1,
    oily: false,
    tags: ["Drink", "Breakfast"],
    allergens: ["Dairy"],
    description: "Decoction poured over hot milk, served in a steel tumbler.",
    rating: 4.6,
    minutes: 16,
  },
  {
    name: "Idli Sambar",
    restaurantId: "r6",
    cuisine: "South Indian",
    family: "south",
    price: 14900,
    vegetarian: true,
    vegan: true,
    spice: 2,
    oily: false,
    tags: ["Light", "Breakfast"],
    allergens: [],
    description: "Steamed rice cakes with a tangy, vegetable-heavy sambar.",
    rating: 4.4,
    minutes: 20,
  },
  {
    name: "Tandoori Chicken",
    restaurantId: "r10",
    cuisine: "Punjabi",
    family: "tandoor",
    price: 29900,
    vegetarian: false,
    spice: 3,
    oily: false,
    tags: ["Protein-rich", "Spicy"],
    allergens: ["Dairy"],
    description: "Yogurt-marinated chicken, blistered in a clay oven.",
    rating: 4.7,
    minutes: 29,
  },
  {
    name: "Malabar Fish Curry",
    restaurantId: "r2",
    cuisine: "Kerala",
    family: "curry",
    price: 33900,
    vegetarian: false,
    spice: 2,
    oily: false,
    tags: ["Coastal", "Protein-rich"],
    allergens: ["Fish", "Coconut"],
    description: "Seer fish in coconut, kokum and mustard.",
    rating: 4.5,
    minutes: 33,
  },
  {
    name: "Veg Thali",
    restaurantId: "r3",
    cuisine: "North Indian",
    family: "comfort",
    price: 27900,
    vegetarian: true,
    spice: 2,
    oily: false,
    tags: ["Vegetarian", "Balanced"],
    allergens: ["Dairy", "Gluten"],
    description: "Dal, sabzi, roti, rice, pickle and a sweet.",
    rating: 4.5,
    minutes: 30,
  },
  {
    name: "Chicken 65",
    restaurantId: "r4",
    cuisine: "South Indian",
    family: "street",
    price: 24900,
    vegetarian: false,
    spice: 3,
    oily: true,
    tags: ["Spicy", "Starter"],
    allergens: ["Egg"],
    description: "Crisp chilli-garlic chicken with curry leaves.",
    rating: 4.4,
    minutes: 23,
  },
  {
    name: "Paneer Butter Masala",
    restaurantId: "r10",
    cuisine: "North Indian",
    family: "curry",
    price: 27900,
    vegetarian: true,
    spice: 1,
    oily: true,
    tags: ["Vegetarian", "Comfort"],
    allergens: ["Dairy", "Cashew"],
    description: "Cottage cheese in a mellow tomato-cashew gravy.",
    rating: 4.6,
    minutes: 28,
  },
  {
    name: "Poha Bowl",
    restaurantId: "r7",
    cuisine: "Maharashtrian",
    family: "comfort",
    price: 13900,
    vegetarian: true,
    vegan: true,
    spice: 1,
    oily: false,
    tags: ["Light", "Breakfast"],
    allergens: ["Mustard", "Peanuts"],
    description: "Flattened rice, turmeric, onion and a squeeze of lime.",
    rating: 4.2,
    minutes: 18,
  },
  {
    name: "Mutton Rogan Josh",
    restaurantId: "r5",
    cuisine: "Kashmiri",
    family: "curry",
    price: 38900,
    vegetarian: false,
    spice: 2,
    oily: true,
    tags: ["Premium", "Protein-rich"],
    allergens: [],
    description: "Slow-braised goat with fennel, ratan jot and yogurt.",
    rating: 4.7,
    minutes: 38,
  },
  {
    name: "Bengali Fish Fry",
    restaurantId: "r9",
    cuisine: "Bengali",
    family: "street",
    price: 26900,
    vegetarian: false,
    spice: 2,
    oily: true,
    tags: ["Coastal"],
    allergens: ["Fish", "Mustard"],
    description: "Mustard-marinated bhetki, shallow-fried.",
    rating: 4.4,
    minutes: 32,
  },
  {
    name: "Sambar Rice",
    restaurantId: "r2",
    cuisine: "South Indian",
    family: "south",
    price: 17900,
    vegetarian: true,
    vegan: true,
    spice: 2,
    oily: false,
    tags: ["Light", "Vegan"],
    allergens: [],
    description: "Tamarind lentil rice with vegetables and ghee optional on the side.",
    rating: 4.3,
    minutes: 22,
  },
  {
    name: "Amritsari Kulcha Platter",
    restaurantId: "r10",
    cuisine: "Punjabi",
    family: "bread",
    price: 21900,
    vegetarian: true,
    spice: 2,
    oily: true,
    tags: ["Vegetarian", "Comfort"],
    allergens: ["Gluten", "Dairy"],
    description: "Stuffed kulcha, chole and pickled onion.",
    rating: 4.5,
    minutes: 26,
  },
  {
    name: "Jeera Rice & Dal Fry",
    restaurantId: "r8",
    cuisine: "North Indian",
    family: "dal",
    price: 18900,
    vegetarian: true,
    vegan: true,
    spice: 1,
    oily: false,
    tags: ["Light", "Value"],
    allergens: [],
    description: "Cumin rice with a simple tadka dal — weeknight honest.",
    rating: 4.2,
    minutes: 21,
  },
  {
    name: "Hyderabadi Chicken 65 Biryani",
    restaurantId: "r1",
    cuisine: "Hyderabadi",
    family: "biryani",
    price: 32900,
    vegetarian: false,
    spice: 3,
    oily: true,
    tags: ["Spicy", "Indulgent"],
    allergens: ["Egg", "Dairy"],
    description: "Crisp Chicken 65 folded through dum rice — louder than the house dum.",
    rating: 4.6,
    minutes: 30,
  },
  {
    name: "Misal Pav",
    restaurantId: "r7",
    cuisine: "Maharashtrian",
    family: "street",
    price: 15900,
    vegetarian: true,
    spice: 3,
    oily: false,
    tags: ["Spicy", "Value"],
    allergens: ["Gluten", "Peanuts"],
    description: "Sprouted beans, fiery tarri and toasted pav.",
    rating: 4.3,
    minutes: 19,
  },
  {
    name: "Pearl Mutton Biryani",
    restaurantId: "r11",
    cuisine: "Hyderabadi",
    family: "biryani",
    price: 39900,
    vegetarian: false,
    spice: 3,
    oily: false,
    tags: ["Legendary", "Bestseller"],
    allergens: ["Dairy"],
    description: "Old-city dum with a 4.9 kitchen score — excellent, but a long ride from the west.",
    rating: 4.9,
    minutes: 48,
  },
];

export const dishes: Dish[] = catalog.map((item, index) => {
  const restaurant = restaurants.find((entry) => entry.id === item.restaurantId)!;
  return {
    id: `dish-${index + 1}`,
    name: item.name,
    restaurant: restaurant.name,
    restaurantId: restaurant.id,
    cuisine: item.cuisine,
    family: item.family,
    price: item.price,
    rating: item.rating,
    restaurantRating: restaurant.rating,
    area: restaurant.area,
    lat: restaurant.lat,
    lng: restaurant.lng,
    minutes: item.minutes,
    vegetarian: item.vegetarian,
    vegan: Boolean(item.vegan),
    spice: item.spice,
    oily: item.oily,
    tags: item.tags,
    allergens: item.allergens,
    description: item.description,
    imagePosition: `${15 + (index % 5) * 18}% ${25 + (index % 3) * 25}%`,
  };
});

export const dishById = Object.fromEntries(dishes.map((dish) => [dish.id, dish])) as Record<string, Dish>;

export const BIRYANI_ID = "dish-1";
export const RAITA_ID = "dish-15";
export const DOSA_ID = "dish-3";
export const KHICHDI_ID = "dish-7";

export const promptSuggestions = [
  "Today I feel like eating biryani.",
  "Order me the usual.",
  "I want something light for dinner.",
  "Find a high-protein vegetarian lunch.",
  "Order something warm for this rainy evening.",
];

export const DELIVERY_FEES_PAISE = 6200;
export const DEMO_COUPON_PAISE = 5000;

export const money = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

export function payableTotal(subtotal: number, coupon: boolean) {
  return subtotal + DELIVERY_FEES_PAISE - (coupon ? DEMO_COUPON_PAISE : 0);
}

export interface FoodContextEngine {
  context(now?: Date): { weather: string; meal: string; hour: number; note: string };
}

export const MockFoodContextEngine: FoodContextEngine = {
  context: (now = new Date()) => {
    const hour = now.getHours();
    const meal = hour < 11 ? "Breakfast" : hour < 16 ? "Lunch" : hour < 22 ? "Dinner" : "Late night";
    return {
      weather: "Rainy, 24°C",
      meal,
      hour,
      note: "Warm, lower-oil options are gently prioritized when you ask for comfort.",
    };
  },
};
