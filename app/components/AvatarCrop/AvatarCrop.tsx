"use client";

import { useState, useCallback, useId } from "react";
import Cropper from "react-easy-crop";

type CropResult = { blob: Blob; url: string };
type PixelArea = { x: number; y: number; width: number; height: number };

async function getCroppedImg(
  imageSrc: string,
  cropPixels: PixelArea,
): Promise<CropResult> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");

  // 使用 react-easy-crop 提供的像素裁剪区域
  const { width, height } = cropPixels;
  canvas.width = width;
  canvas.height = height;

  // 圆形导出：先裁剪为方形区域，再用圆形剪切
  ctx.save();
  ctx.beginPath();
  ctx.arc(
    width / 2,
    height / 2,
    Math.min(width, height) / 2,
    0,
    Math.PI * 2,
    true,
  );
  ctx.clip();

  // 将图像的指定像素矩形绘制到 0,0 处，缩放到 size x size
  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    width,
    height,
    0,
    0,
    width,
    height,
  );
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Failed to export");
      resolve({ blob, url: URL.createObjectURL(blob) });
    }, "image/png");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

interface AvatarCropperProps {
  onDone: (res: CropResult) => void;
  buttonText?: string;
  buttonClassName?: string;
}

export default function AvatarCropper({
  onDone,
  buttonText = "上传头像",
  buttonClassName,
}: AvatarCropperProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelArea | null>(
    null,
  );

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url);
    setOpen(true);
  };

  const onCropComplete = useCallback(async () => {
    if (!image) return;
    if (!croppedAreaPixels) return;
    const res = await getCroppedImg(image, croppedAreaPixels);
    onDone(res); // 上传或更新头像
    setOpen(false);
    URL.revokeObjectURL(image);
  }, [image, croppedAreaPixels, onDone]);

  return (
    <div>
      <button
        className={buttonClassName ?? "btn"}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        {buttonText}
      </button>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelectFile}
      />

      {open && image && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-base-100 p-4 rounded-lg w-[90vw] max-w-xl h-[70vh]">
            <div className="relative w-full h-[70%] bg-black/40 rounded-lg overflow-hidden">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round" // UI 圆形提示
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) =>
                  setCroppedAreaPixels(areaPixels as PixelArea)
                }
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="range range-sm flex-1"
              />
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={onCropComplete}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
