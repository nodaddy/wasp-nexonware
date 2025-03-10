import React from "react";

type SummaryData = {
  totalEvents: number;
  byType: {
    urls: number;
    fileDownloads: number;
    fileUploads: number;
    clipboardEvents: number;
  };
};

type SummaryCardsProps = {
  data: SummaryData;
  loading: boolean;
  error: string | null;
};

export function SummaryCards({ data, loading, error }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 animate-pulse rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        Error loading summary: {error}
      </div>
    );
  }

  if (!data || !data.byType) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        No summary data available
      </div>
    );
  }

  const cards = [
    {
      title: "Total Events",
      value: data.totalEvents,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "URL Visits",
      value: data.byType.urls,
      color: "bg-purple-50 border-purple-200",
    },
    {
      title: "File Downloads",
      value: data.byType.fileDownloads,
      color: "bg-green-50 border-green-200",
    },
    {
      title: "File Uploads",
      value: data.byType.fileUploads,
      color: "bg-yellow-50 border-yellow-200",
    },
    {
      title: "Clipboard Events",
      value: data.byType.clipboardEvents,
      color: "bg-red-50 border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${card.color} shadow-sm`}
        >
          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700">{card.title}</h3>
          </div>
          <p className="text-2xl font-semibold">
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
