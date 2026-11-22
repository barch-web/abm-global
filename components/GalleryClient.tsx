'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import SafeImage from './SafeImage';
import type { GalleryCategory, GalleryImage } from '@/lib/types';

interface GalleryClientProps {
  categories: GalleryCategory[];
  images: GalleryImage[];
}

export default function GalleryClient({ categories, images }: GalleryClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredImages = useMemo(() => {
    if (selectedCategoryId === 'all') return images;
    return images.filter((img) => img.category_id === selectedCategoryId);
  }, [images, selectedCategoryId]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredImages.length
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredImages.length) % filteredImages.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredImages.length]);

  const activeImage =
    lightboxIndex !== null && filteredImages[lightboxIndex]
      ? filteredImages[lightboxIndex]
      : null;

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter gallery by service category"
        className="flex flex-wrap items-center gap-2 p-1.5 bg-[#F4F6F8] rounded-xl border border-slate-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategoryId === 'all'}
          onClick={() => {
            setSelectedCategoryId('all');
            setLightboxIndex(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategoryId === 'all'
              ? 'bg-[#0B1F3A] text-white shadow-sm'
              : 'text-slate-700 hover:text-[#0B1F3A] hover:bg-white/70'
          }`}
        >
          All Work ({images.length})
        </button>

        {categories.map((cat) => {
          const count = images.filter((i) => i.category_id === cat.id).length;
          const active = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setLightboxIndex(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[#0B1F3A] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#0B1F3A] hover:bg-white/70'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-[#F4F6F8] p-12 text-center">
          <p className="text-base font-medium text-[#0B1F3A]">
            No gallery items published in this category yet.
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Select another category above or contact our team for recent project documentation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img, idx) => (
            <figure
              key={img.id}
              className="group rounded-xl border border-slate-200 bg-white overflow-hidden transition-shadow hover:shadow-md flex flex-col"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 text-left cursor-pointer focus-visible:outline-none"
                aria-label={`Open ${img.title} in lightbox`}
              >
                <SafeImage
                  src={img.image_url}
                  alt={img.title}
                  fallbackTitle={img.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0B1F3A]/85 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Inspect
                </span>
              </button>
              <figcaption className="p-5 space-y-1.5 flex-1">
                <p className="text-xs font-medium text-slate-500">
                  {categoryMap.get(img.category_id) || 'Field Work'}
                </p>
                <h3 className="text-base font-semibold text-[#0B1F3A] leading-snug">
                  {img.title}
                </h3>
                {img.caption && (
                  <p className="text-sm text-slate-600 leading-relaxed">{img.caption}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeImage && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.title}
          className="fixed inset-0 z-50 bg-[#061326]/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  {categoryMap.get(activeImage.category_id) || 'Gallery'} ·{' '}
                  <span className="font-mono tabular-nums">
                    {lightboxIndex + 1} / {filteredImages.length}
                  </span>
                </p>
                <h3 className="text-base font-semibold text-[#0B1F3A] truncate">
                  {activeImage.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close lightbox"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-[#0B1F3A] aspect-[16/10] w-full flex items-center justify-center">
              <SafeImage
                src={activeImage.image_url}
                alt={activeImage.title}
                fallbackTitle={activeImage.title}
                priority
                className="w-full h-full object-contain"
              />

              {filteredImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + filteredImages.length) % filteredImages.length
                      )
                    }
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#0B1F3A] flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % filteredImages.length)
                    }
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#0B1F3A] flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {activeImage.caption && (
              <div className="px-5 py-4 bg-white border-t border-slate-100">
                <p className="text-sm text-slate-700">{activeImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
