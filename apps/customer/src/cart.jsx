import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

export default function CartPage() {
  const [tableId, setTableId] = useState(null);
  const [token, setToken] = useState(null);
  const [isValid, setIsValid] = useState(null); // null = validating, true/false = validated
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [navbarLogo, setNavbarLogo] = useState(null);

  // Get table number and token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get("table");
    const qrToken = params.get("token");

    setTableId(table ? parseInt(table) : null);
    setToken(qrToken || null);
  }, []);

  // Validate token
  useEffect(() => {
    const validateToken = async () => {
      if (!tableId || !token) {
        setIsValid(false);
        return;
      }

      const { data, error } = await supabase
        .from("table_tokens")
        .select("*")
        .eq("table_num", tableId)
        .eq("token", token)
        .single();

      if (error || !data) setIsValid(false);
      else setIsValid(true);
    };

    validateToken();
  }, [tableId, token]);

  // Fetch logo
  useEffect(() => {
    const loadLogo = async () => {
      const { data } = await supabase
        .from("logos")
        .select("logo_url")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setNavbarLogo(data.logo_url);
    };

    loadLogo();
  }, []);

  // Fetch cart whenever tableId changes and token is valid
  useEffect(() => {
    const fetchCart = async () => {
      if (!isValid) return;

      setIsLoadingCart(true);

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          table_num,
          quantity,
          status,
          menu:item_id (
            id,
            name,
            price
          )
        `)
        .eq("table_num", tableId);

      if (!error) {
        const itemsWithTotals = data.map((item) => ({
          ...item,
          lineTotal: item.quantity * item.menu.price,
        }));

        setCartItems(itemsWithTotals);
        setTotal(itemsWithTotals.reduce((acc, item) => acc + item.lineTotal, 0));

        // Freeze cart if any item is already confirmed
        if (itemsWithTotals.some((item) => item.status === "confirmed")) {
          setIsConfirmed(true);
        }
      } else {
        console.error("Error fetching cart:", error);
      }

      setIsLoadingCart(false);
    };

    fetchCart();
  }, [tableId, isValid]);

  // Update quantity (optimistic UI)
  // const updateQuantity = async (cartId, newQuantity) => {
  //   if (newQuantity < 1 || isConfirmed) return;

  //   setCartItems((prevItems) =>
  //     prevItems.map((item) =>
  //       item.id === cartId
  //         ? { ...item, quantity: newQuantity, lineTotal: newQuantity * item.menu.price }
  //         : item
  //     )
  //   );

  //   setTotal((prevTotal) =>
  //     cartItems.reduce((acc, item) => {
  //       if (item.id === cartId) return acc + newQuantity * item.menu.price;
  //       return acc + item.lineTotal;
  //     }, 0)
  //   );

  //   const { error } = await supabase
  //     .from("cart_items")
  //     .update({ quantity: newQuantity })
  //     .eq("id", cartId);

  //   if (error) console.error("Error updating quantity:", error);
  // };

  // Update quantity (optimistic UI + delete if 0)
const updateQuantity = async (cartId, newQuantity) => {
  if (isConfirmed) return;

  if (newQuantity < 1) {
    // Remove item from UI immediately
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartId));

    // Update total
    setTotal((prevTotal) =>
      cartItems
        .filter((item) => item.id !== cartId)
        .reduce((acc, item) => acc + item.lineTotal, 0)
    );

    // Delete from database
    const { error } = await supabase.from("cart_items").delete().eq("id", cartId);
    if (error) console.error("Error deleting cart item:", error);

    return;
  }

  // Update quantity normally
  setCartItems((prevItems) =>
    prevItems.map((item) =>
      item.id === cartId
        ? { ...item, quantity: newQuantity, lineTotal: newQuantity * item.menu.price }
        : item
    )
  );

  // Update total
  setTotal((prevTotal) =>
    cartItems.reduce((acc, item) => {
      if (item.id === cartId) return acc + newQuantity * item.menu.price;
      return acc + item.lineTotal;
    }, 0)
  );

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: newQuantity })
    .eq("id", cartId);

  if (error) console.error("Error updating quantity:", error);
};



  // Confirm order
  const confirmOrder = async () => {
    if (cartItems.length === 0 || isConfirmed) return;

    setIsConfirming(true);

    try {
      // Insert new order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          table_num: tableId,
          total,
          status: "not_served",
        })
        .select("*")
        .single();

      if (orderError) throw orderError;

      // Insert cart items into confirmed_orders
      const payload = cartItems.map((item) => ({
        order_id: orderData.id,
        table_num: tableId,
        item_id: item.menu.id,
        item_name: item.menu.name,
        price: item.menu.price,
        quantity: item.quantity,
        line_total: item.lineTotal,
        status: "not_served",
      }));

      const { error: itemsError } = await supabase
        .from("confirmed_orders")
        .insert(payload);

      if (itemsError) throw itemsError;

      // Clear cart items from UI
      setCartItems([]);
      setTotal(0);
      setIsConfirmed(true);

      // Delete cart items from database
      await supabase
        .from("cart_items")
        .delete()
        .eq("table_num", tableId);
    } catch (err) {
      console.error("Error confirming order:", err);
    }

    setIsConfirming(false);
  };

  // Show message if table or token is missing / invalid
  if (isValid === false) {
    return <div className="p-10 text-xl font-bold text-red-500">Invalid table token. Please scan your QR code.</div>;
  }

  if (!tableId || isValid === null) {
    return <div className="p-10 text-xl font-bold">Loading table data...</div>;
  }

  return (
    <div className="min-h-screen bg-sky-100">
      {/* Navbar */}
      <nav className="w-full bg-sky-300 p-4 shadow">
        <div className="flex flex-row flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link to="/logo">
              <img
                src={navbarLogo || "/logo.svg"}
                alt="Logo"
                className="h-10 m-2 w-10 object-contain"
              />
            </Link>

            {/* Links */}
            <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              <Link
                to="/"
                className="font-bold ml-1 text-sm sm:text-sm sm:ml-2 md:text-lg lg:text-xl xl:text-xl hover:text-gray-700 px-2 sm:px-3 md:px-5 lg:px-7"
              >
                Menu
              </Link>

              <Link
                to={`/cart?table=${tableId}&token=${token}`}
                className="font-bold text-sm sm:text-sm md:text-lg lg:text-xl xl:text-xl hover:text-gray-700"
              >
                Cart
              </Link>

              <Link
                to={`/orders?table=${tableId}&token=${token}`}
                className="font-bold ml-1 sm:ml-3 text-sm sm:text-sm md:text-lg lg:text-xl xl:text-xl hover:text-gray-700"
              >
                Orders
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-full mx-auto p-4 border rounded shadow">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Table {tableId} Cart</h2>

        {isLoadingCart ? (
          <p className="text-lg sm:text-xl md:text-2xl">Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <p className="text-lg sm:text-xl md:text-2xl">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="border p-2 rounded flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="w-full bg-sky-200 p-4 shadow rounded">
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold">{item.menu.name}</p>
                  <p className="text-base sm:text-lg md:text-xl">Price: {item.menu.price} Kyats</p>
                  <div className="flex items-center mt-1">
                    <button
                      className="px-2 py-1 bg-gray-300 rounded-l hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-200"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={isConfirmed}
                    >
                      -
                    </button>
                    <span className="px-4 text-base sm:text-lg md:text-xl">{item.quantity}</span>
                    <button
                      className="px-2 py-1 bg-gray-300 rounded-r hover:bg-gray-400 disabled:cursor-not-allowed disabled:bg-gray-200"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isConfirmed}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl font-semibold mt-1">Line Total: {item.lineTotal} Kyats</p>
                </div>
              </div>
            ))}

            <div className="p-2 sm:p-3 md:p-5 lg:p-7 border-t pt-2 mt-2 text-md sm:text-lg md:text-2xl font-bold">
              Total: {total} Kyats
            </div>

            <button
              onClick={!isConfirmed && !isConfirming ? confirmOrder : undefined}
              disabled={isConfirmed || isConfirming}
              className={`
                w-full sm:w-auto 
                ${isConfirmed || isConfirming ? "bg-gray-400 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600"} 
                text-md sm:text-lg md:text-xl lg:text-2xl 
                font-bold 
                text-white 
                px-4 sm:px-6 md:px-8  
                py-2 sm:py-3 
                rounded-xl 
                shadow 
                transition
              `}
            >
              {isConfirming ? "Confirming..." : isConfirmed ? "Confirmed" : "Confirm Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
