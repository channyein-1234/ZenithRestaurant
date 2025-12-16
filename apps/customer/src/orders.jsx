import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const [tableId, setTableId] = useState(null);
  const [token, setToken] = useState(null);
  const [isValid, setIsValid] = useState(null); // null = validating, true/false = validated
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navbarLogo, setNavbarLogo] = useState(null);

  // Get table and token from URL
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

  // Fetch logo and orders
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

    const fetchOrders = async () => {
      setLoading(true);

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          id,
          table_num,
          total,
          status,
          confirmed_orders (
            id,
            item_name,
            quantity,
            line_total
          )
        `)
        .eq("table_num", tableId)
        .eq("status", null) // only unserved orders
        .order("id", { ascending: false });

      if (error) console.error("Error fetching orders:", error);
      else setOrders(ordersData || []);

      setLoading(false);
    };

    loadLogo();
    fetchOrders();
  }, [isValid, tableId]);

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
    <div className="w-full min-h-screen bg-sky-100">
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

      <h1 className="text-2xl p-5 md:text-3xl font-bold text-sky-700 mb-5">
        Table {tableId} Orders
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-xl text-gray-700">No orders yet.</p>
      ) : (
        <div className="space-y-6 mx-9">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border shadow-md p-4 rounded-xl"
            >
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center mb-4">
                <p className="text-lg md:text-xl font-bold text-sky-600">
                  Table {order.table_num}
                </p>
                <p className="text-md md:text-lg font-semibold text-gray-700">
                  Order ID: {order.id}
                </p>
              </div>

              {/* Order Items */}
              <div className="w-full border-t pt-3">
                <p className="text-lg md:text-xl font-semibold mb-2">Items</p>

                <div className="space-y-3">
                  {order.confirmed_orders.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap justify-between border-b pb-2"
                    >
                      <p className="text-md md:text-lg font-medium">
                        {item.item_name} × {item.quantity}
                      </p>
                      <p className="text-md md:text-lg font-semibold text-sky-700">
                        {item.line_total} Kyats
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 flex justify-end">
                <p className="text-xl md:text-2xl font-bold text-gray-800">
                  Total: {order.total} Kyats
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
