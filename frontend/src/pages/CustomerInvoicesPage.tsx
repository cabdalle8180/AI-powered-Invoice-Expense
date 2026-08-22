import React from "react";
import InvoicesPage from "./InvoicesPage";

/** Customer read-only invoice list — backend scopes to their customerId. */
const CustomerInvoicesPage: React.FC = () => {
  return <InvoicesPage pageTitle="My Invoices" />;
};

export default CustomerInvoicesPage;
