import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  const assetsRoot = path.resolve(process.cwd(), "assets");
  const requestedPath = path.resolve(assetsRoot, ...segments);
  if (!requestedPath.startsWith(`${assetsRoot}${path.sep}`)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(requestedPath);
    const contentType = contentTypes[path.extname(requestedPath).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
