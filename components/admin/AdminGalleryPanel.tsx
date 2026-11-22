'use client';

import { useState } from 'react';
import { FolderPlus, ImagePlus, Loader2, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import type { GalleryCategory, GalleryImage } from '@/lib/types';

interface AdminGalleryPanelProps {
  categories: GalleryCategory[];
  images: GalleryImage[];
  onRefresh: () => Promise<void>;
  onNotice: (msg: string, isError?: boolean) => void;
}

export default function AdminGalleryPanel({
  categories,
  images,
  onRefresh,
  onNotice,
}: AdminGalleryPanelProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategoryId, setUploadCategoryId] = useState(categories[0]?.id || '');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (newCategoryName.trim().length < 2) return;
    setCreatingCat(true);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({ action: 'create_category', name: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotice(data?.error || 'Could not create category.', true);
        return;
      }
      setNewCategoryName('');
      await onRefresh();
      onNotice(`Category "${data.category.name}" created.`);
    } finally {
      setCreatingCat(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) {
      onNotice('Select a JPG, PNG, or WebP image (max 5 MB) and enter a title.', true);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('title', uploadTitle.trim());
      fd.append('caption', uploadCaption.trim());
      fd.append('category_id', uploadCategoryId || categories[0]?.id || '');

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'ABM-Admin-Client' },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        onNotice(data?.error || 'Upload failed.', true);
        return;
      }
      setUploadTitle('');
      setUploadCaption('');
      setUploadFile(null);
      await onRefresh();
      onNotice('Photo uploaded and published to gallery.');
    } finally {
      setUploading(false);
    }
  }

  async function handleReplaceFile(id: string, file: File) {
    setSavingId(id);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('replaceId', id);
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'ABM-Admin-Client' },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        onNotice(data?.error || 'Image replacement failed.', true);
        return;
      }
      await onRefresh();
      onNotice('Gallery image replaced.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleSaveEdit(id: string) {
    setSavingId(id);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({
          id,
          title: editTitle,
          caption: editCaption,
          category_id: editCategoryId,
        }),
      });
      if (!res.ok) {
        onNotice('Failed to save gallery updates.', true);
        return;
      }
      setEditingId(null);
      await onRefresh();
      onNotice('Gallery item updated.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleTogglePublish(img: GalleryImage) {
    setSavingId(img.id);
    try {
      await fetch('/api/admin/gallery', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'ABM-Admin-Client',
        },
        body: JSON.stringify({ id: img.id, is_published: !img.is_published }),
      });
      await onRefresh();
      onNotice(img.is_published ? 'Image unpublished.' : 'Image published.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/gallery?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-Requested-With': 'ABM-Admin-Client' },
      });
      if (res.ok) {
        await onRefresh();
        onNotice('Gallery item deleted.');
      } else {
        onNotice('Failed to delete image.', true);
      }
    } finally {
      setSavingId(null);
    }
  }

  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Photo Form */}
        <form
          onSubmit={handleUpload}
          className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-[#0B1F3A]" />
            <h2 className="text-lg font-semibold text-[#0B1F3A]">Upload New Gallery Photo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Category *
              </label>
              <select
                value={uploadCategoryId || categories[0]?.id || ''}
                onChange={(e) => setUploadCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#0B1F3A]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Photo Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 24-Port Rack Installation — Osu"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0B1F3A]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Caption
              </label>
              <input
                type="text"
                placeholder="Brief technical description shown below the photo"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0B1F3A]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Image File (JPG, PNG, or WebP, max 5 MB) *
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#F4F6F8] file:text-[#0B1F3A] file:font-medium hover:file:bg-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F2B705] hover:bg-[#F7C733] text-[#0B1F3A] text-sm font-medium cursor-pointer"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            Upload & Publish Photo
          </button>
        </form>

        {/* Create Category Form */}
        <form
          onSubmit={handleCreateCategory}
          className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#0B1F3A]" />
            <h2 className="text-lg font-semibold text-[#0B1F3A]">Create Category</h2>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              New Category Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Solar Power & UPS Backup"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0B1F3A]"
            />
          </div>
          <button
            type="submit"
            disabled={creatingCat}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#132C4E] text-white text-sm font-medium cursor-pointer"
          >
            {creatingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
            Add Category
          </button>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1.5">Active Categories ({categories.length})</p>
            <ul className="space-y-1 text-xs text-slate-700">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <span>{c.name}</span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {images.filter((i) => i.category_id === c.id).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </form>
      </div>

      {/* Existing Gallery Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {images.map((img) => {
          const isEditing = editingId === img.id;
          return (
            <div
              key={img.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-slate-100 relative">
                <SafeImage
                  src={img.image_url}
                  alt={img.title}
                  fallbackTitle={img.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {isEditing ? (
                  <div className="space-y-2.5">
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-[#0B1F3A]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-[#0B1F3A]"
                    />
                    <textarea
                      rows={2}
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-[#0B1F3A]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={savingId === img.id}
                        onClick={() => handleSaveEdit(img.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#0B1F3A] text-white text-xs font-medium cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">
                        {catMap.get(img.category_id) || 'Uncategorized'} ·{' '}
                        <span className={img.is_published ? 'text-[#1E9E5A] font-medium' : 'text-amber-600 font-medium'}>
                          {img.is_published ? 'Published' : 'Hidden'}
                        </span>
                      </p>
                      <h3 className="text-sm font-semibold text-[#0B1F3A]">{img.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{img.caption}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(img.id);
                          setEditTitle(img.title);
                          setEditCaption(img.caption);
                          setEditCategoryId(img.category_id);
                        }}
                        className="px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-[#0B1F3A] cursor-pointer"
                      >
                        Edit Text
                      </button>

                      <label className="px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-[#0B1F3A] cursor-pointer inline-flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Replace
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleReplaceFile(img.id, f);
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleTogglePublish(img)}
                        className="px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-[#0B1F3A] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {img.is_published ? 'Hide' : 'Publish'}
                      </button>

                      <button
                        type="button"
                        disabled={savingId === img.id}
                        onClick={() => handleDelete(img.id)}
                        aria-label={`Delete ${img.title}`}
                        className="ml-auto p-1.5 rounded-md text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
