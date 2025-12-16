import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

export default function MenuPage() {
  const [tableId, setTableId] = useState(null);
  const [token, setToken] = useState(null);
  const [isValid, setIsValid] = useState(null); // null = validating, true/false = validated
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navbarLogo, setNavbarLogo] = useState(null);

  // Get table ID and token from URL
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

  // Fetch logo and menu items
  useEffect(() => {
    if (!isValid) return;

    const loadLogo = async () => {
      const { data } = await supabase
        .from("logos")
        .select("logo_url")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setNavbarLogo(data.logo_url);
    };

    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu")
        .select("id, created_at, price, name, image");

      if (error) console.error("Error fetching menu items:", error);
      else setItems(data || []);
      setLoading(false);
    };

    loadLogo();
    fetchItems();
  }, [isValid]);

  // Add to cart
  const AddtoCart = async (itemId) => {
    if (!tableId) {
      alert("Table number not detected!");
      return;
    }

    try {
      const { error } = await supabase.from("cart_items").insert([
        {
          table_num: tableId,
          item_id: itemId,
          quantity: 1,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Error adding to cart:", error);
        alert("Failed to add item to cart!");
      } else {
        alert("Item added to cart!");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  // Show invalid token message
  if (isValid === false) {
    return (
      <div className="p-10 text-xl font-bold text-red-500">
        Invalid table token. Please scan your QR code.
      </div>
    );
  }

  if (!tableId || isValid === null) {
    return (
      <div className="p-10 text-xl font-bold">
        Loading table data...
      </div>
    );
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
                to={`/menu?table=${tableId}&token=${token}`}
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

      <h1 className="text-2xl font-bold mb-4 text-sky-600 p-2">
        Menu {tableId ? `- Table ${tableId}` : ""}
      </h1>

      {/* ---------------- LOADING ---------------- */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-xl font-semibold text-gray-600">
          No menu items yet.
        </p>
      ) : (
        <div
          className="
            grid gap-4
            grid-cols-1 
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            p-2 sm:px-3 md:px-4 lg:px-5
          "
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="menu-item p-4 bg-gray-100 rounded border border-gray-300 shadow-sm hover:shadow-md transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover rounded"
              />

              <p className="font-bold mt-2 text-lg">{item.name}</p>
              <p className="text-sm md:text-base">
                Price: {item.price} Kyats
              </p>

              <button
                className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 mt-3 rounded w-full font-semibold"
                onClick={() => AddtoCart(item.id)}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
