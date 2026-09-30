import multer from "multer";

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("শুধু ইমেজ ফাইল আপলোড করা যাবে"));
};

export const uploadImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 8 * 1024 * 1024, files: 10 }, // 8MB/image, up to 10 at once
});

const importFileFilter = (req, file, cb) => {
  const ok =
    file.mimetype.includes("spreadsheet") ||
    file.mimetype === "text/csv" ||
    file.originalname.endsWith(".csv") ||
    file.originalname.endsWith(".xlsx") ||
    file.originalname.endsWith(".xls");
  if (ok) cb(null, true);
  else cb(new Error("শুধু CSV/Excel ফাইল আপলোড করা যাবে"));
};

export const uploadImportFile = multer({
  storage,
  fileFilter: importFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});
