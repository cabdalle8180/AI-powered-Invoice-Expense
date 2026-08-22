import { Outlet } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";

const CustomerLayout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
