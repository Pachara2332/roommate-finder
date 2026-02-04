
import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { uploadImage } from '@/lib/r2';

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate User
        const token = getAuthToken(req);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await getUserFromToken(token);
        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = user.id;

        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate File Type (Server-side)
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Validate File Size (5MB for listings)
        if (file.size > 5 * 1024 * 1024) {
             return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
        }

        // 3. Upload to Cloudflare R2
        const timestamp = Date.now();
        // Sanitize filename
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
        // Store in 'uploads' folder or 'listings'
        const fileName = `uploads/${userId}-${timestamp}-${cleanName}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        // Use the R2 helper
        const publicUrl = await uploadImage(buffer, fileName, file.type);

        return NextResponse.json({ 
            success: true, 
            url: publicUrl 
        });

    } catch (error: any) {
        console.error('Upload Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
