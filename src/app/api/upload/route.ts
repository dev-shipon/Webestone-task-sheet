import { NextResponse } from "next/server";
import { app, firebaseConfig } from "@/lib/firebase"; // Clean import of the app

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const path = formData.get("path") as string;

        if (!file || !path) {
            return NextResponse.json({ error: "File and path are required" }, { status: 400 });
        }

        const projectId = firebaseConfig.projectId;
        if (!projectId) throw new Error("Firebase Project ID missing in config.");

        // Define potential buckets to try
        const possibleBuckets = [
            `${projectId}.appspot.com`,              // Standard default
            `${projectId}.firebasestorage.app`,      // Newer regional default
            app.options.storageBucket,               // Configured fallback
        ].filter(Boolean) as string[];

        // Remove duplicates
        const uniqueBuckets = Array.from(new Set(possibleBuckets));

        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);
        const encodedPath = encodeURIComponent(path);

        let lastError: Error | null = null;

        // Try each bucket until one works
        for (const bucketName of uniqueBuckets) {
            try {
                console.log(`Attempting upload to bucket: ${bucketName}...`);
                const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o?name=${encodedPath}`;

                const response = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type || "application/octet-stream" },
                    body: buffer,
                });

                if (response.ok) {
                    const data = await response.json();
                    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${data.downloadTokens}`;
                    console.log(`Success! Uploaded to ${bucketName}`);
                    return NextResponse.json({ url: publicUrl });
                }

                if (response.status === 404) {
                    console.warn(`Bucket ${bucketName} not found (404). Trying next...`);
                    continue; // Try next bucket
                }

                // If other error, throw it immediately
                const errorText = await response.text();
                throw new Error(`Firebase Error (${response.status}): ${errorText}`);

            } catch (error: any) {
                lastError = error;
                console.error(`Failed to upload to ${bucketName}:`, error.message);
            }
        }

        // If loop finishes without return, all failed
        throw new Error(`All bucket attempts failed. Last error: ${lastError?.message || "Unknown error"}`);

    } catch (error: any) {
        console.error("Server Upload Fatal Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
