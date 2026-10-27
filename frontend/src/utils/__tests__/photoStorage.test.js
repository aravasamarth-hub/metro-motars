import {
  validatePhotoFile,
  LocalIndexedDBPhotoProvider,
  CloudStoragePhotoProvider,
  getActivePhotoProvider,
  MAX_PHOTO_SIZE_BYTES,
} from "../photoStorage";

describe("Photo Validation and Storage Providers", () => {
  test("accepts valid JPEG, PNG, and WebP files under 10MB", async () => {
    const jpegFile = new File(["fake-jpeg-data"], "front.jpg", { type: "image/jpeg" });
    const pngFile = new File(["fake-png-data"], "side.png", { type: "image/png" });
    const webpFile = new File(["fake-webp-data"], "cluster.webp", { type: "image/webp" });

    const resJpeg = await validatePhotoFile(jpegFile);
    expect(resJpeg.valid).toBe(true);

    const resPng = await validatePhotoFile(pngFile);
    expect(resPng.valid).toBe(true);

    const resWebp = await validatePhotoFile(webpFile);
    expect(resWebp.valid).toBe(true);
  });

  test("rejects unsupported MIME types", async () => {
    const gifFile = new File(["fake-gif"], "anim.gif", { type: "image/gif" });
    const pdfFile = new File(["fake-pdf"], "doc.pdf", { type: "application/pdf" });

    const resGif = await validatePhotoFile(gifFile);
    expect(resGif.valid).toBe(false);
    expect(resGif.error).toContain("Unsupported image format");

    const resPdf = await validatePhotoFile(pdfFile);
    expect(resPdf.valid).toBe(false);
  });

  test("rejects files exceeding 10MB", async () => {
    const hugeFile = {
      name: "huge.jpg",
      type: "image/jpeg",
      size: MAX_PHOTO_SIZE_BYTES + 1024,
    };

    const res = await validatePhotoFile(hugeFile);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("Photo exceeds 10 MB limit");
  });

  test("rejects null or missing file", async () => {
    const res = await validatePhotoFile(null);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("No file selected.");
  });

  test("LocalIndexedDBPhotoProvider uploads safely with metadata", async () => {
    const provider = new LocalIndexedDBPhotoProvider();
    expect(provider.isConfigured()).toBe(true);

    const file = new File(["sample-data"], "odometer.jpg", { type: "image/jpeg" });
    const result = await provider.upload(file, { slot: "odometer", vehicleId: "V-100" });

    expect(result.provider).toBe("local_indexeddb");
    expect(result.name).toBe("odometer.jpg");
    expect(result.storageKey).toMatch(/^local_/);
    expect(result.metadata.slot).toBe("odometer");
  });

  test("CloudStoragePhotoProvider reports unconfigured and throws descriptive errors", async () => {
    const provider = new CloudStoragePhotoProvider();
    expect(provider.isConfigured()).toBe(false);

    const file = new File(["sample-data"], "odometer.jpg", { type: "image/jpeg" });
    await expect(provider.upload(file)).rejects.toThrow(
      "Cloud photo storage provider is not configured"
    );
    await expect(provider.delete("key-123")).rejects.toThrow(
      "Cloud photo storage provider is not configured"
    );
  });

  test("getActivePhotoProvider returns local provider when cloud is unconfigured", () => {
    const active = getActivePhotoProvider();
    expect(active.name).toBe("local_indexeddb");
    expect(active.isConfigured()).toBe(true);
  });
});
