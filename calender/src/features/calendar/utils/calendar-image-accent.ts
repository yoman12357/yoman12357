import type { CalendarMonthPalette } from "@/features/calendar/types/calendar";

type ExtractCalendarImageAccentParams = {
  imageFilter?: string;
  imageSource: string;
};

type CalendarAccentTokens = {
  accentBorder: string;
  accentGlow: string;
  accentSoft: string;
  accentStrong: string;
  heroTint: string;
  shellGlow: string;
};

type RgbColor = {
  b: number;
  g: number;
  r: number;
};

type HslColor = {
  h: number;
  l: number;
  s: number;
};

type SampleRegion = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type ColorBucket = {
  b: number;
  count: number;
  g: number;
  r: number;
  weight: number;
};

const COLOR_EXTRACTION_SIZE = 96;
const IMAGE_ACCENT_CACHE = new Map<string, Promise<string | null>>();
const HERO_FOCUS_REGION = {
  x: 0.24,
  y: 0.27,
  width: 0.52,
  height: 0.28,
};

export function getCalendarAccentTokens(
  fallbackPalette: CalendarMonthPalette,
  imageAccentHex: string | null,
): CalendarAccentTokens {
  if (!imageAccentHex) {
    return {
      accentStrong: fallbackPalette.accentStrong,
      accentBorder: fallbackPalette.accentBorder,
      accentSoft: fallbackPalette.accentSoft,
      accentGlow: fallbackPalette.accentGlow,
      shellGlow: fallbackPalette.shellGlow,
      heroTint: fallbackPalette.heroTint,
    };
  }

  const fallbackAccent = parseHexColor(fallbackPalette.accentStrong);

  if (!fallbackAccent) {
    return {
      accentStrong: fallbackPalette.accentStrong,
      accentBorder: fallbackPalette.accentBorder,
      accentSoft: fallbackPalette.accentSoft,
      accentGlow: fallbackPalette.accentGlow,
      shellGlow: fallbackPalette.shellGlow,
      heroTint: fallbackPalette.heroTint,
    };
  }

  const extractedAccent = parseHexColor(imageAccentHex);

  if (!extractedAccent) {
    return {
      accentStrong: fallbackPalette.accentStrong,
      accentBorder: fallbackPalette.accentBorder,
      accentSoft: fallbackPalette.accentSoft,
      accentGlow: fallbackPalette.accentGlow,
      shellGlow: fallbackPalette.shellGlow,
      heroTint: fallbackPalette.heroTint,
    };
  }

  const blendedAccent = normalizeAccentColor(
    mixRgbColors(extractedAccent, fallbackAccent, 0.36),
  );
  const glowAccent = normalizeAccentColor(
    adjustColor(blendedAccent, { lightnessDelta: 0.08, saturationDelta: 0.06 }),
  );
  const baseShadowAccent = normalizeAccentColor(
    adjustColor(blendedAccent, { lightnessDelta: -0.06, saturationDelta: -0.04 }),
  );

  return {
    accentStrong: formatHexColor(blendedAccent),
    accentBorder: formatRgba(blendedAccent, 0.28),
    accentSoft: formatRgba(blendedAccent, 0.14),
    accentGlow: formatRgba(glowAccent, 0.24),
    shellGlow: [
      `radial-gradient(circle at top right, ${formatRgba(glowAccent, 0.2)}, transparent 34%)`,
      `radial-gradient(circle at bottom left, ${formatRgba(baseShadowAccent, 0.1)}, transparent 28%)`,
    ].join(", "),
    heroTint: `linear-gradient(180deg, rgba(255, 255, 255, 0.05), ${formatRgba(blendedAccent, 0.14)})`,
  };
}

export function extractCalendarImageAccent({
  imageFilter = "none",
  imageSource,
}: ExtractCalendarImageAccentParams): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(null);
  }

  const cacheKey = `${imageSource}::${imageFilter}`;
  const cachedAccent = IMAGE_ACCENT_CACHE.get(cacheKey);

  if (cachedAccent) {
    return cachedAccent;
  }

  const extractionPromise = loadImage(imageSource)
    .then((image) => {
      const canvas = document.createElement("canvas");
      canvas.width = COLOR_EXTRACTION_SIZE;
      canvas.height = COLOR_EXTRACTION_SIZE;

      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        return null;
      }

      context.filter = imageFilter;
      context.imageSmoothingEnabled = true;
      context.drawImage(image, 0, 0, COLOR_EXTRACTION_SIZE, COLOR_EXTRACTION_SIZE);

      const preferredAccent =
        extractAccentFromRegion(
          context,
          createRegion(COLOR_EXTRACTION_SIZE, COLOR_EXTRACTION_SIZE, HERO_FOCUS_REGION),
          0.12,
        ) ??
        extractAccentFromRegion(
          context,
          createRegion(COLOR_EXTRACTION_SIZE, COLOR_EXTRACTION_SIZE, {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
          }),
          0.1,
        ) ??
        extractAccentFromRegion(
          context,
          createRegion(COLOR_EXTRACTION_SIZE, COLOR_EXTRACTION_SIZE, HERO_FOCUS_REGION),
          0.04,
        );

      return preferredAccent;
    })
    .catch(() => null);

  IMAGE_ACCENT_CACHE.set(cacheKey, extractionPromise);

  return extractionPromise;
}

function loadImage(imageSource: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();

    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load hero image."));
    image.src = imageSource;
  });
}

function extractAccentFromRegion(
  context: CanvasRenderingContext2D,
  region: SampleRegion,
  minimumSaturation: number,
) {
  const { data } = context.getImageData(
    region.x,
    region.y,
    region.width,
    region.height,
  );
  const buckets = new Map<string, ColorBucket>();

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];

    if (alpha < 170) {
      continue;
    }

    const color = {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
    };
    const hslColor = rgbToHsl(color);

    if (hslColor.l < 0.16 || hslColor.l > 0.88 || hslColor.s < minimumSaturation) {
      continue;
    }

    const bucketKey = [
      quantizeChannel(color.r),
      quantizeChannel(color.g),
      quantizeChannel(color.b),
    ].join("-");
    const valueWeight = 1 - Math.abs(hslColor.l - 0.54);
    const colorWeight = 0.55 + hslColor.s * 2.6 + valueWeight * 0.9;
    const existingBucket = buckets.get(bucketKey);

    if (existingBucket) {
      existingBucket.count += 1;
      existingBucket.weight += colorWeight;
      existingBucket.r += color.r;
      existingBucket.g += color.g;
      existingBucket.b += color.b;
      continue;
    }

    buckets.set(bucketKey, {
      count: 1,
      weight: colorWeight,
      r: color.r,
      g: color.g,
      b: color.b,
    });
  }

  const bestBucket = Array.from(buckets.values()).sort(
    (firstBucket, secondBucket) => secondBucket.weight - firstBucket.weight,
  )[0];

  if (!bestBucket) {
    return null;
  }

  return formatHexColor(
    normalizeAccentColor({
      r: bestBucket.r / bestBucket.count,
      g: bestBucket.g / bestBucket.count,
      b: bestBucket.b / bestBucket.count,
    }),
  );
}

function createRegion(
  width: number,
  height: number,
  relativeRegion: {
    height: number;
    width: number;
    x: number;
    y: number;
  },
): SampleRegion {
  return {
    x: Math.max(0, Math.floor(width * relativeRegion.x)),
    y: Math.max(0, Math.floor(height * relativeRegion.y)),
    width: Math.max(1, Math.floor(width * relativeRegion.width)),
    height: Math.max(1, Math.floor(height * relativeRegion.height)),
  };
}

function quantizeChannel(channel: number) {
  return Math.round(channel / 24) * 24;
}

function mixRgbColors(primaryColor: RgbColor, secondaryColor: RgbColor, amount: number) {
  return {
    r: primaryColor.r * (1 - amount) + secondaryColor.r * amount,
    g: primaryColor.g * (1 - amount) + secondaryColor.g * amount,
    b: primaryColor.b * (1 - amount) + secondaryColor.b * amount,
  };
}

function normalizeAccentColor(color: RgbColor): RgbColor {
  const hslColor = rgbToHsl(color);

  return hslToRgb({
    h: hslColor.h,
    s: clamp(hslColor.s * 1.08, 0.24, 0.62),
    l: clamp(hslColor.l, 0.38, 0.58),
  });
}

function adjustColor(
  color: RgbColor,
  {
    lightnessDelta = 0,
    saturationDelta = 0,
  }: {
    lightnessDelta?: number;
    saturationDelta?: number;
  },
): RgbColor {
  const hslColor = rgbToHsl(color);

  return hslToRgb({
    h: hslColor.h,
    s: clamp(hslColor.s + saturationDelta, 0.18, 0.72),
    l: clamp(hslColor.l + lightnessDelta, 0.22, 0.68),
  });
}

function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);
  const delta = maxChannel - minChannel;
  const lightness = (maxChannel + minChannel) / 2;

  if (delta === 0) {
    return {
      h: 0,
      s: 0,
      l: lightness,
    };
  }

  const saturation =
    lightness > 0.5
      ? delta / (2 - maxChannel - minChannel)
      : delta / (maxChannel + minChannel);

  let hue = 0;

  switch (maxChannel) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  return {
    h: hue / 6,
    s: saturation,
    l: lightness,
  };
}

function hslToRgb({ h, s, l }: HslColor): RgbColor {
  if (s === 0) {
    const grayscaleChannel = Math.round(l * 255);

    return {
      r: grayscaleChannel,
      g: grayscaleChannel,
      b: grayscaleChannel,
    };
  }

  const hueToRgb = (
    firstChannel: number,
    secondChannel: number,
    hue: number,
  ) => {
    if (hue < 0) {
      hue += 1;
    }

    if (hue > 1) {
      hue -= 1;
    }

    if (hue < 1 / 6) {
      return firstChannel + (secondChannel - firstChannel) * 6 * hue;
    }

    if (hue < 1 / 2) {
      return secondChannel;
    }

    if (hue < 2 / 3) {
      return firstChannel + (secondChannel - firstChannel) * (2 / 3 - hue) * 6;
    }

    return firstChannel;
  };
  const secondChannel =
    l < 0.5 ? l * (1 + s) : l + s - l * s;
  const firstChannel = 2 * l - secondChannel;

  return {
    r: Math.round(hueToRgb(firstChannel, secondChannel, h + 1 / 3) * 255),
    g: Math.round(hueToRgb(firstChannel, secondChannel, h) * 255),
    b: Math.round(hueToRgb(firstChannel, secondChannel, h - 1 / 3) * 255),
  };
}

function parseHexColor(hexColor: string): RgbColor | null {
  const normalizedHex = hexColor.trim().replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalizedHex)) {
    return null;
  }

  return {
    r: Number.parseInt(normalizedHex.slice(0, 2), 16),
    g: Number.parseInt(normalizedHex.slice(2, 4), 16),
    b: Number.parseInt(normalizedHex.slice(4, 6), 16),
  };
}

function formatHexColor({ r, g, b }: RgbColor) {
  return `#${[r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function formatRgba({ r, g, b }: RgbColor, alpha: number) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

function clamp(value: number, minimumValue: number, maximumValue: number) {
  return Math.min(Math.max(value, minimumValue), maximumValue);
}
