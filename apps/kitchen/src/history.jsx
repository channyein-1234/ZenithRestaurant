import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

export default function HistoryPage() {
  const [servedOrders, setServedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    // fetch order history 
    const fetchHistory = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("history")
        .select(`
          id,
          created_at,
          orders (
            id,
            table_num,
            total,
            confirmed_orders (
              id,
              item_name,
              quantity,
              line_total
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
      } else {
        setServedOrders(data);
      }

      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="w-full min-h-screen bg-sky-100 ">
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

      <h1 className="text-xl  m-5 md:text-3xl font-bold text-sky-700 mb-5">
        Served Orders
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent"></div>
        </div>
      ) : servedOrders.length === 0 ? (
        <p className="text-center text-xl text-gray-700">No served orders yet.</p>
      ) : (
        <div className="space-y-6 mx-9">
          {servedOrders.map((historyItem) => {
            const order = historyItem.orders;
            return (
              <div
                key={historyItem.id}
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
                  <p className="text-md md:text-lg font-semibold text-gray-500">
                    Served at: {new Date(historyItem.created_at).toLocaleString()}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
