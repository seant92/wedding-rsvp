"use client";

import { useState, useEffect } from "react";
import { subscribeToGuests, deleteGuest } from "@/lib/db";
import { Guest } from "@/types";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const unsub = subscribeToGuests(setGuests);
    return () => unsub();
  }, []);

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this RSVP?")) {
      await deleteGuest(id);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Phone",
      "Status",
      "Plus One Attending",
      "Plus One Name",
      "Dietary Requirements",
      "Message",
      "Date",
    ];
    const rows = filteredGuests.map((g) => [
      g.name,
      g.phone,
      g.status,
      g.plusOne.attending ? "Yes" : "No",
      g.plusOne.name,
      g.dietaryRequirements,
      g.message,
      new Date(g.createdAt).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-rsvp-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: guests.length,
    yes: guests.filter((g) => g.status === "yes").length,
    no: guests.filter((g) => g.status === "no").length,
    maybe: guests.filter((g) => g.status === "maybe").length,
    plusOnes: guests.filter((g) => g.plusOne.attending).length,
    totalAttending: guests.filter((g) => g.status === "yes").length + guests.filter((g) => g.plusOne.attending && g.status === "yes").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-stone-800">Guest List</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-stone-800">{stats.total}</div>
          <div className="text-xs text-stone-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.yes}</div>
          <div className="text-xs text-stone-600">Yes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.no}</div>
          <div className="text-xs text-stone-600">No</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.maybe}</div>
          <div className="text-xs text-stone-600">Maybe</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-[#b91c1c]">{stats.plusOnes}</div>
          <div className="text-xs text-stone-600">+1s</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalAttending}</div>
          <div className="text-xs text-stone-600">Total Attending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] outline-none"
          >
            <option value="all">All Status</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="maybe">Maybe</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="p-8 text-center text-stone-500">
            No RSVPs found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="text-left py-3 px-4 font-medium text-stone-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-600">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-600">Plus One</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-600">Dietary</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-600">Message</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-stone-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGuests.map((guest) => (
                    <tr key={guest.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-3 px-4 font-medium">{guest.name}</td>
                      <td className="py-3 px-4">{guest.phone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            guest.status === "yes"
                              ? "bg-green-100 text-green-800"
                              : guest.status === "no"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {guest.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {guest.plusOne.attending ? (
                          <span className="text-[#b91c1c]">{guest.plusOne.name || "Yes"}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-600 max-w-48 truncate">
                        {guest.dietaryRequirements || "-"}
                      </td>
                      <td className="py-3 px-4 text-stone-600 max-w-48 truncate">
                        {guest.message || "-"}
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-xs">
                        {new Date(guest.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200">
                <p className="text-sm text-stone-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredGuests.length)} of{" "}
                  {filteredGuests.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-stone-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-stone-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
