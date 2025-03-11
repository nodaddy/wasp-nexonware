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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg shadow-sm"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg shadow-sm mb-4 text-xs">
        Error loading summary: {error}
      </div>
    );
  }

  if (!data || !data.byType) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-3 py-2 rounded-lg shadow-sm mb-4 text-xs">
        No summary data available
      </div>
    );
  }

  const cards = [
    {
      title: "Total Events",
      value: data.totalEvents,
      color:
        "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
      icon: "📊",
    },
    {
      title: "URL Visits",
      value: data.byType.urls,
      color:
        "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
      icon: "🔗",
    },
    {
      title: "File Downloads",
      value: data.byType.fileDownloads,
      color:
        "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
      icon: "⬇️",
    },
    {
      title: "File Uploads",
      value: data.byType.fileUploads,
      color:
        "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
      icon: "⬆️",
    },
    {
      title: "Clipboard Events",
      value: data.byType.clipboardEvents,
      color:
        "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
      icon: "📋",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border ${card.color} shadow-sm hover:shadow-md transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {card.title}
            </h3>
            <span className="text-base opacity-70">{card.icon}</span>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
