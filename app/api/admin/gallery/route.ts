import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import {
  createGalleryCategory,
  createGalleryImage,
  deleteGalleryImage,
  updateGalleryImage,
  uploadGalleryBinary,
} from '@/lib/db';
import {
  inspectImageMagicBytes,
  sanitizeText,
  verifyRequestOrigin,
} from '@/lib/security';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  if (!verifyRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') || '';

  // Category creation via JSON
  if (contentType.includes('application/json')) {
    try {
      const body = await req.json();
      if (body?.action === 'create_category') {
        const name = sanitizeText(body?.name, 80);
        if (name.length < 2) {
          return NextResponse.json({ error: 'Category name is too short.' }, { status: 400 });
        }
        const category = await createGalleryCategory(name);
        return NextResponse.json({ ok: true, category }, { status: 201 });
      }
      return NextResponse.json({ error: 'Unsupported JSON action.' }, { status: 400 });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Unable to create category.' },
        { status: 400 }
      );
    }
  }

  // Image upload (new photo or replace existing photo) via multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await req.formData();
      const file = formData.get('file');
      const replaceId = typeof formData.get('replaceId') === 'string' ? (formData.get('replaceId') as string) : '';

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Please select an image file to upload.' }, { status: 400 });
      }
      if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: 'File must be non-empty and 5 MB or smaller.' },
          { status: 400 }
        );
      }

      const arrayBuf = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuf);
      const inspection = inspectImageMagicBytes(uint8, file.type);

      if (!inspection.valid || !inspection.ext || !inspection.mime) {
        return NextResponse.json(
          { error: 'Only valid JPG, PNG, and WebP image files are permitted.' },
          { status: 400 }
        );
      }

      const uploaded = await uploadGalleryBinary(
        Buffer.from(uint8),
        inspection.ext,
        inspection.mime
      );

      if (replaceId) {
        const updated = await updateGalleryImage(replaceId, {
          image_url: uploaded.imageUrl,
          storage_path: uploaded.storagePath,
        });
        if (!updated) {
          return NextResponse.json({ error: 'Gallery item not found.' }, { status: 404 });
        }
        return NextResponse.json({ ok: true, image: updated });
      }

      const categoryId = sanitizeText(formData.get('category_id'), 80);
      const title = sanitizeText(formData.get('title'), 140);
      const caption = sanitizeText(formData.get('caption'), 400);

      if (!categoryId || title.length < 2) {
        return NextResponse.json(
          { error: 'Category and image title are required.' },
          { status: 400 }
        );
      }

      const image = await createGalleryImage({
        category_id: categoryId,
        title,
        caption,
        image_url: uploaded.imageUrl,
        storage_path: uploaded.storagePath,
        is_published: true,
      });

      return NextResponse.json({ ok: true, image }, { status: 201 });
    } catch {
      return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Unsupported content type.' }, { status: 415 });
}

export async function PATCH(req: Request) {
  if (!verifyRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'Missing image ID.' }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (typeof body.title === 'string') patch.title = sanitizeText(body.title, 140);
    if (typeof body.caption === 'string') patch.caption = sanitizeText(body.caption, 400);
    if (typeof body.category_id === 'string') patch.category_id = sanitizeText(body.category_id, 80);
    if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;

    const updated = await updateGalleryImage(id, patch);
    if (!updated) return NextResponse.json({ error: 'Gallery item not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, image: updated });
  } catch {
    return NextResponse.json({ error: 'Unable to update gallery item.' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!verifyRequestOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'Missing image ID.' }, { status: 400 });

  const deleted = await deleteGalleryImage(id);
  if (!deleted) return NextResponse.json({ error: 'Gallery item not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
