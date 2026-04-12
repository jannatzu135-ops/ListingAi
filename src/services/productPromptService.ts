// productPromptService.ts

export const generateProductPrompt = (params: any) => {
  const { mode, products, scene, controls, modelImage } = params;
  const parts: any[] = [];

  // 1. Quality Directive (HD Realism)
  const qualityDirective = `
    **ULTRA-HIGH FIDELITY PRODUCT RENDERING**
    - Photorealistic 8k resolution, cinematic lighting.
    - Micro-detail textures: Render realistic metal reflections, glass transparency, and material grains.
    - Physically accurate shadows and global illumination.
  `;

  let textPrompt = mode === 'on-model' 
    ? `**ON-MODEL PRODUCT PHOTOSHOOT DIRECTIVE**\n` 
    : `**STAGED PRODUCT PHOTOSHOOT DIRECTIVE**\n`;

  textPrompt += qualityDirective;

  if (mode === 'on-model') {
    // --- ON-MODEL LOGIC ---
    textPrompt += `
      - **MODEL IDENTITY:** Recreate the person from the FIRST image with perfect accuracy.
      - **PRODUCT:** The model must be ${controls.interactionType || 'holding'} the product from the SECOND image.
      - **POSE:** ${controls.shotType || 'natural'}.
      - **SCENE:** Set in a ${scene.background} with ${scene.lighting} lighting.
    `;
    
    // Add Images to parts array
    parts.push({ text: textPrompt });
    if (modelImage) {
      parts.push({ inlineData: { mimeType: "image/png", data: modelImage } }); // Image 1
    }
    if (products && products[0] && products[0].base64) {
      parts.push({ inlineData: { mimeType: "image/png", data: products[0].base64 } }); // Image 2
    }

  } else {
    // --- STAGED MODE LOGIC ---
    textPrompt += `
      - **COMPOSITION:** Arrange the products from the provided images on a ${controls.surface || 'clean'} surface.
      - **STAGING:** 
    `;
    
    // Position mapping
    if (products && Array.isArray(products)) {
      products.forEach((p: any, i: number) => {
        textPrompt += `  - Product ${i+1}: Located at x:${p.x || 50}%, y:${p.y || 50}% with scale ${p.scale || 100}%.\n`;
      });
    }

    textPrompt += `
      - **ENVIRONMENT:** ${scene.background}.
      - **LIGHTING:** ${scene.lighting} with ${controls.shadowType || 'natural'} shadows.
    `;

    parts.push({ text: textPrompt });
    if (products && Array.isArray(products)) {
      products.forEach((p: any) => {
        if (p.base64) {
          parts.push({ inlineData: { mimeType: "image/png", data: p.base64 } });
        }
      });
    }
  }

  return parts;
};
