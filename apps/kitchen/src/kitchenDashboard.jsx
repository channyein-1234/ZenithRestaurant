import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

export default function KitchenOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serving, setServing] = useState(false);
  const [navbarLogo, setNavbarLogo] = useState(null);

  useEffect(() => {
    // fetch logo 
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
    // fetch orders 
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          table_num,
          total,
          created_at,
          confirmed_orders (
            id,
            item_name,
            price,
            quantity,
            line_total
          )
        `)
        .eq("status", "not_served")
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching orders:", error);
      else setOrders(data);

      setLoading(false);
    };

    fetchOrders();
  }, []);

  const markAsServed = async (orderId) => {
    setServing(true);

    try {
      // 1️⃣ Update orders and confirmed_orders status
      const { error: ordersError } = await supabase
        .from("orders")
        .update({ status: "served" })
        .eq("id", orderId);

      const { error: itemsError } = await supabase
        .from("confirmed_orders")
        .update({ status: "served" })
        .eq("order_id", orderId);

      if (ordersError || itemsError) throw ordersError || itemsError;

      // 2️⃣ Insert into history
      const { error: historyError } = await supabase
        .from("history")
        .insert({
          order_id: orderId,
          created_at: new Date().toISOString(),
        });

      if (historyError) throw historyError;

      // 3️⃣ Remove from UI
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (err) {
      console.error("Error serving order:", err);
    }

    setServing(false);
  };

  return (
    <div className="min-h-screen bg-sky-100 ">
        {/* Navbar */}
      <nav className="w-full bg-sky-300 p-4 shadow">
              <div className="flex flex-row flex-wrap items-center justify-between gap-2 sm:gap-4">

                {/* Logo */}
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <div>
                  <img
                    src={navbarLogo || "/logo.svg"}
                    alt="Logo"
                    className="h-10 m-2 w-10 object-contain"
                  />
                  </div>

                  {/* Links */}
                  <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 ">
                    <Link
                      to="/kitchenDashboard"
                      className="font-bold ml-1 text-sm sm:text-sm sm:ml-2 md:text-lg lg:text-xl xl:text-xl 
                      hover:text-gray-700 px-2 sm:px-3 md:px-5 lg:px-7"
                    >
                      Current Orders
                    </Link>

                    <Link
                      to="/history"
                      className="font-bold text-sm sm:text-sm md:text-lg lg:text-xl xl:text-xl 
                      hover:text-gray-700"
                    >
                      History
                    </Link>
                  </div>
                </div>

              </div>
            </nav>

      <h1 className="p-5 text-xl md:text-3xl font-bold text-sky-700 mb-5">
        Kitchen Orders
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-xl text-gray-700">No pending orders.</p>
      ) : (
        <div className="mx-9 space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border shadow-md p-4 rounded-xl">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center mb-4">
                <p className="text-lg md:text-xl font-bold text-sky-600">
                  Table {order.table_num}
                </p>
                <p className="text-md md:text-lg font-semibold text-gray-700">
                  Order ID: {order.id}
                </p>
                <p className="text-md md:text-lg text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              {/* Items */}
              <div className="w-full border-t pt-3 space-y-2">
                {order.confirmed_orders.map((item) => (
                  <div key={item.id} className="flex justify-between border-b pb-1">
                    <p className="text-md md:text-lg font-medium">
                      {item.item_name} × {item.quantity}
                    </p>
                    <p className="text-md md:text-lg font-semibold text-sky-700">
                      {item.line_total} Kyats
                    </p>
                  </div>
                ))}
              </div>

              {/* Total & Served Button */}
              <div className="mt-4 flex justify-between items-center">
                <p className="text-xl md:text-2xl font-bold text-gray-800">
                  Total: {order.total} Kyats
                </p>
                <button
                  onClick={() => markAsServed(order.id)}
                  disabled={serving}
                  className={`px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-bold ${
                    serving ? "cursor-not-allowed bg-gray-400" : ""
                  }`}
                >
                  Served
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
