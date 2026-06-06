import { NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const apkPath = path.join(process.cwd(), 'public', 'app-release.apk');
    const stats = await stat(apkPath);
    const sizeMB = Math.round(stats.size / (1024 * 1024));
    return NextResponse.json({
      size: `~${sizeMB} MB`,
      bytes: stats.size,
      filename: 'app-release.apk',
    });
  } catch {
    return NextResponse.json({ size: 'N/A', bytes: 0, filename: 'app-release.apk' });
  }
}
