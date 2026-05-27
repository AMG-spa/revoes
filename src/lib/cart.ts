const CART_KEY = "revo-cart";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  formData: Record<string, string>;
};

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function addCartItem(item: Omit<CartItem, "id">) {
  const items = getCart();

  items.push({
    ...item,
    id: crypto.randomUUID(),
  });

  saveCart(items);
}

export function removeCartItem(id: string) {
  saveCart(getCart().filter((item) => item.id !== id));
}

export function clearCart() {
  saveCart([]);
}