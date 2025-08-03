import CheckoutButton from '../components/CheckoutButton';

export default function CartPage() {
  const cartItems = [
    { name: 'Midwest Death Metal Tee', price: 2479, quantity: 1 }
  ];

  return (
    <div>
      <h1>Your Cart</h1>
      {/* Other cart details */}
      <CheckoutButton cartItems={cartItems} />
    </div>
  );
}
