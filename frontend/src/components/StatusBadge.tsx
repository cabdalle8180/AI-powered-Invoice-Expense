// import React from "react";

// interface StatusBadgeProps {
//   status: string;
// }

// export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
//   switch (status) {
//     case "paid":
//       return (
//         <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
//           Paid
//         </span>
//       );
//     case "overdue":
//       return (
//         <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-600">
//           Overdue
//         </span>
//       );
//     case "sent":
//       return (
//         <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
//           Sent
//         </span>
//       );
//     default:
//       return (
//         <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
//           Draft
//         </span>
//       );
//   }
// };


























import React from "react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
          Paid
        </span>
      );
    case "overdue":
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-600">
          Overdue
        </span>
      );
    case "sent":
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
          Sent
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
          Draft
        </span>
      );
  }
};