"use client";

import { Play } from "lucide-react";

interface VideoTutorialProps {
  title: string;
  duration: string;
  thumbnail: string;
  href: string;
}

export default function VideoTutorial({
  title,
  duration,
  thumbnail,
  href,
}: VideoTutorialProps) {
  return (
    <a href={href} className="block group">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-14 w-14 rounded-full bg-blue-600 bg-opacity-90 flex items-center justify-center text-white group-hover:bg-opacity-100 transition-all">
            <Play size={24} />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 rounded text-xs text-white">
          {duration}
        </div>
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback for missing images
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18d92a6a6a4%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18d92a6a6a4%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.82500076293945%22%20y%3D%22118.74000034332275%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
          }}
        />
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900 group-hover:text-blue-600">
        {title}
      </h3>
    </a>
  );
}
