// Cinematic style packs.
// Each pack expands a short style id into a rich, image-model-friendly suffix
// that gets appended to every per-scene image prompt. The negative string
// is folded into the prompt as positive constraints (gpt-image-1 doesn't
// support a separate negative_prompt field).

export type StylePack = {
  id: string;
  label: string;
  short: string; // shown in UI cards
  flagship?: boolean;
  // Appended verbatim to every image prompt for this style. Be thorough —
  // these are the bits the model actually anchors on.
  promptSuffix: string;
  // Folded into the prompt as "Avoid: …". gpt-image-1 doesn't have a
  // negative_prompt, but it does respect explicit avoidance language.
  avoid: string;
  // A short cinematographer reference Claude uses to shape composition.
  cinematographyRef: string;
};

export const STYLE_PACKS: StylePack[] = [
  {
    id: "cinematic",
    label: "Cinematic Realism",
    short: "Photoreal · anamorphic · trailer-grade",
    flagship: true,
    promptSuffix:
      "Cinematic photoreal still frame, shot on Arri Alexa Mini LF with anamorphic Hawk V-Lite 35mm lens, T2.2, oval bokeh, lens flares only when motivated. Naturalistic skin tones, micro-detail in pores and fabric, atmospheric haze and floating dust motes. Motivated practical lighting with deep shadow falloff, hair-rim light from a strong key. Subtle 35mm film grain. Teal-and-orange Hollywood colour grade with rich blacks and creamy highlights. High dynamic range, shallow depth of field, vertical 9:16 reframe. Frame composed for a blockbuster trailer cut.",
    avoid:
      "no cartoon, no anime, no illustration, no 3D Pixar render, no plastic CGI sheen, no oversaturation, no flat lighting, no mannequin look, no extra fingers, no deformed hands, no warped faces, no double pupils, no text, no watermark, no logo, no captions, no subtitles, no UI, no border, no frame",
    cinematographyRef:
      "Reference DPs: Roger Deakins, Hoyte van Hoytema, Greig Fraser, Bradford Young.",
  },
  {
    id: "noir",
    label: "Film Noir",
    short: "B&W · venetian shadows · 1940s",
    promptSuffix:
      "1940s film noir, black and white, deep silver-tone contrast, hard chiaroscuro key light through venetian blinds casting striped shadows, smoke-filled air, tungsten practicals, fedora silhouettes, wet streets reflecting neon. Shot on a vintage Bell & Howell with 25mm spherical lens. Heavy grain, low-angle compositions, dutch tilts, vertical 9:16 reframe.",
    avoid:
      "no colour grading, no modern clothing, no anime, no cartoon, no 3D, no text, no watermark, no logo",
    cinematographyRef: "Reference: Citizen Kane, Double Indemnity, Sin City.",
  },
  {
    id: "anime",
    label: "Anime",
    short: "Cel-shaded · Studio-grade keyframe",
    promptSuffix:
      "High-quality anime keyframe in the style of contemporary Japanese animation studios, cel-shaded, clean linework with weighted ink edges, painterly skies, dramatic motion lines when implied by action, vivid colour palette, soft volumetric light shafts. Vertical 9:16 reframe, dynamic poses.",
    avoid:
      "no photoreal skin, no 3D render, no western cartoon, no text, no watermark, no logo, no UI",
    cinematographyRef: "Reference: Studio Ghibli, Makoto Shinkai, MAPPA, Trigger.",
  },
  {
    id: "3d-pixar",
    label: "3D Animated",
    short: "Stylised CGI · soft lighting",
    promptSuffix:
      "Stylised 3D animated still in the style of contemporary feature animation, polished but not plastic, expressive sculpted character design, sub-surface skin scattering, soft global illumination, motivated coloured rim lights, subtle volumetrics, Pixar/DreamWorks-grade rendering, vertical 9:16 framing.",
    avoid:
      "no photoreal humans, no anime, no flat 2D, no text, no watermark, no logo",
    cinematographyRef: "Reference: Spider-Verse, Klaus, Soul.",
  },
  {
    id: "comic",
    label: "Comic / Graphic Novel",
    short: "Inked · halftone · bold colour",
    promptSuffix:
      "Inked graphic-novel illustration with bold black linework, screentone halftone shading, limited colour palette with two flat accent colours, Ben Day dot textures, dramatic motion implied through speed lines and impact bursts, vertical 9:16 panel composition.",
    avoid:
      "no photoreal, no 3D, no anime, no text bubbles, no watermark, no logo",
    cinematographyRef: "Reference: Mike Mignola (Hellboy), Frank Miller (Sin City), Jeff Lemire.",
  },
  {
    id: "watercolor",
    label: "Watercolor",
    short: "Soft washes · paper texture",
    promptSuffix:
      "Soft watercolour painting on textured cold-press paper, blooming pigments and granulation, wet-on-wet bleeds, soft focal subject with looser background washes, hand-drawn ink contour, muted desaturated palette, vertical 9:16 composition.",
    avoid:
      "no photoreal, no 3D, no harsh lines, no oversaturation, no text, no watermark, no logo",
    cinematographyRef: "Reference: Andrew Wyeth, Sara Midda.",
  },
  {
    id: "old-camera",
    label: "Old Camera (VHS / 35mm)",
    short: "Vintage stock · halation · grain",
    promptSuffix:
      "Vintage Kodak Portra 400 film aesthetic, heavy halation around highlights, soft contrast, warm magenta cast, visible film grain, slight vignette, shot on a 1990s point-and-shoot. Or alternatively VHS-tape look with chromatic shift, scanlines, magnetic-noise distortions in highlights only. Vertical 9:16.",
    avoid: "no modern HDR, no digital sharpness, no text, no watermark, no logo",
    cinematographyRef: "Reference: 1990s home video, Fincher's Mindhunter cold opens.",
  },
  {
    id: "lowpoly",
    label: "Low Poly",
    short: "Geometric · faceted",
    promptSuffix:
      "Low-poly stylised 3D illustration, faceted geometric shapes, flat colour fills with subtle gradient occlusion, isometric or three-quarter framing, clean game-trailer aesthetic, vertical 9:16.",
    avoid: "no photoreal, no smooth surfaces, no text, no watermark, no logo",
    cinematographyRef: "Reference: Monument Valley, Alto's Adventure.",
  },
  {
    id: "psychedelic",
    label: "Psychedelic",
    short: "Vibrant · surreal palettes",
    promptSuffix:
      "Surreal psychedelic illustration, vibrant complementary palette (magenta/cyan/lemon), kaleidoscopic symmetry where appropriate, fractal patterns, dreamlike compositions, soft airbrushed gradients with crisp pattern edges, vertical 9:16.",
    avoid: "no photoreal, no muted colours, no text, no watermark, no logo",
    cinematographyRef: "Reference: 1970s rock posters, Alex Grey.",
  },
  {
    id: "pop-art",
    label: "Pop Art",
    short: "Bold · screen-printed",
    promptSuffix:
      "Pop art screen-print aesthetic, bold flat colours, halftone Ben Day dot fields, thick black ink contours, high contrast, two-colour or four-colour separations, vertical 9:16.",
    avoid: "no photoreal, no gradients, no shading, no text, no watermark, no logo",
    cinematographyRef: "Reference: Roy Lichtenstein, Andy Warhol.",
  },
];

export function getStylePack(id: string | undefined | null): StylePack {
  return STYLE_PACKS.find((s) => s.id === id) ?? STYLE_PACKS[0];
}
