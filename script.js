// SMOKE TEST - put this at the very top of script.js
console.log("⛳ script.js loaded: ", { href: location.href, time: new Date().toISOString() });

// show if DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
  console.log("✅ DOM readyState:", document.readyState);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOMContentLoaded fired");
  });
}

// ---------- CONFIG / SELECTORS ----------
const themeToggle = document.querySelector(".theme-toggle");
const promptInputForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

// NOTE: We are NOT using any API key here (using pollinations free endpoint)
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

// =============================
//      THEME LOAD
// =============================
(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

  document.body.classList.toggle("dark-theme", isDarkTheme);
  if (themeToggle) {
    const icon = themeToggle.querySelector("i");
    if (icon) icon.className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
})();

// =============================
//      TOGGLE THEME
// =============================
const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  if (themeToggle) {
    const icon = themeToggle.querySelector("i");
    if (icon) icon.className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
};

// =============================
//      IMAGE SIZE CALC
// =============================
const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const parts = String(aspectRatio || "1/1").split("/").map(Number);
  const widthRatio = parts[0] || 1;
  const heightRatio = parts[1] || 1;

  const scaleFactor = baseSize / Math.sqrt(widthRatio * heightRatio);

  let calculatedWidth = Math.round(widthRatio * scaleFactor);
  let calculatedHeight = Math.round(heightRatio * scaleFactor);

  calculatedWidth = Math.floor(calculatedWidth / 16) * 16 || 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16 || 16;

  return { width: calculatedWidth, height: calculatedHeight };
};

// =============================
//      GENERATE IMAGES (Pollinations - no CORS)
// =============================
// Uses https://image.pollinations.ai/prompt/<encoded prompt>
// This endpoint works from the browser and doesn't require an API key.
// Note: Pollinations may return images that are different from HF models.

// =============================
//      GENERATE IMAGES (variation fixes + logs)
// =============================
// =============================
// generateImages (strong variation)
// =============================
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  console.log("▶ generateImages (strong variation) start", { selectedModel, imageCount, aspectRatio, promptSample: promptText?.slice(0,80) });

  // Modifier pools (you can add more items to each array)
  const styles = [
    "watercolor", "oil painting", "digital illustration", "photorealistic", "cyberpunk",
    "vaporwave", "surrealism", "low poly", "3D render", "matte painting",
    "ukiyo-e", "pixel art", "vector art", "concept art", "cartoon"
  ];

  const mediums = [
    "on canvas", "ink and wash", "watercolor on paper", "digital art", "acrylic on board",
    "gouache", "charcoal sketch", "mixed media collage", "film photography", "polaroid"
  ];

  const lights = [
    "dramatic rim lighting", "soft morning light", "golden hour lighting",
    "neon night lighting", "moody cinematic lighting", "studio softbox lighting",
    "high contrast chiaroscuro", "backlit silhouette"
  ];

  const palettes = [
    "vivid colors", "muted pastel palette", "monochrome blue", "warm earthy tones",
    "high saturation", "desaturated film look", "neon color palette", "duotone"
  ];

  const cameras = [
    "35mm lens, shallow depth of field", "wide-angle perspective", "telephoto compression",
    "top-down flatlay", "close-up macro", "bird's-eye view", "anamorphic lens cinematic"
  ];

  const accents = [
    "intricate details", "highly detailed", "minimalist", "gritty texture", "soft focus",
    "bold brush strokes", "glossy finish", "handcrafted look"
  ];

  const surprises = [
    "floating lanterns", "bioluminescent plants", "ancient ruins", "futuristic skyline",
    "giant koi", "tiny robots", "cracked porcelain", "glass shards", "paper cranes"
  ];

  // Helper to pick N random distinct elements from an array
  const pick = (arr, n = 1) => {
    const copy = arr.slice();
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  };

  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      // Choose modifiers (mix & match)
      const style = pick(styles, 1)[0];
      const medium = pick(mediums, 1)[0];
      const light = pick(lights, 1)[0];
      const palette = pick(palettes, 1)[0];
      const camera = pick(cameras, 1)[0];
      const accent = pick(accents, 1)[0];
      const surprise = pick(surprises, 1)[0];
      const randTag = Math.random().toString(36).slice(2, 7);

      // Construct a strong variant prompt
      // You can tweak the template here to suit your taste.
      const promptVariant = `${promptText}, ${style}, ${medium}, ${light}, ${palette}, ${camera}, ${accent}, featuring ${surprise}, ultra-detailed, high resolution, cinematic, colorful, variation ${i + 1} ${randTag}`;

      // Pollinations endpoint (cache-busted)
      const encodedPrompt = encodeURIComponent(promptVariant);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
      const cacheBust = `cb=${Date.now().toString().slice(-5)}${Math.floor(Math.random()*9000)}`;
      const fetchUrl = url + `?${cacheBust}`;

      console.log(`→ fetch #${i} promptVariant:`, promptVariant.slice(0,160));
      const res = await fetch(fetchUrl);
      console.log(`← fetch #${i} status:`, res.status, res.headers.get("content-type"));

      if (!res.ok) {
        const body = await res.text().catch(() => null);
        console.error(`❌ fetch #${i} failed`, { status: res.status, bodyPreview: (body||"").slice(0,200) });
        throw new Error(`Network error ${res.status}`);
      }

      const blob = await res.blob();
      console.log(`✅ fetch #${i} ok (blob)`);
      return { success: true, index: i, blob, promptVariant };
    } catch (err) {
      console.error(`🔥 fetch #${i} error:`, err);
      return { success: false, index: i, error: err.message || String(err) };
    }
  });

  const results = await Promise.allSettled(imagePromises);
  console.log("▶ generateImages results:", results.map(r => ({ status: r.status, value: r.value ? { index: r.value.index, success: r.value.success } : null })));

  // Update UI per result (same as before)
  results.forEach((r) => {
    if (r.status !== "fulfilled") return;
    const value = r.value;
    if (!value) return;
    const card = document.getElementById(`img-card-${value.index}`);
    if (!card) return;
    const imgEl = card.querySelector(".result-img");
    const statusText = card.querySelector(".status-text");
    const errorIcon = card.querySelector(".fa-triangle-exclamation");

    if (value.success) {
      imgEl.src = URL.createObjectURL(value.blob);
      card.classList.remove("loading");
      if (statusText) statusText.textContent = "Done";
      if (errorIcon) errorIcon.style.display = "none";
      // small tooltip-like info we log (won't display in UI)
      console.log(`✔ image #${value.index} set. promptVariant (preview):`, value.promptVariant?.slice(0,160));
    } else {
      card.classList.remove("loading");
      if (statusText) statusText.textContent = `Error: ${value.error}`;
      if (errorIcon) errorIcon.style.display = "inline-block";
      imgEl.src = "";
    }
  });

  return results;
};


// =============================
//      CREATE IMAGE CARDS
// =============================
const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
  console.log("▶ createImageCards", { selectedModel, imageCount, aspectRatio, promptSample: promptText?.slice(0,80) });
  if (!gridGallery) {
    console.error("Grid gallery element not found (.gallery-grid)");
    return;
  }
  gridGallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `
      <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
        
        <div class="status-container">
          <div class="spinner"></div>
          <i class="fa-solid fa-triangle-exclamation" style="display:none;"></i>
          <p class="status-text">Generating...</p>
        </div>

        <img src="" class="result-img" alt="image ${i}">

        <!-- DOWNLOAD BUTTON OVERLAY -->
        <div class="img-overlay">
          <button type="button" class="img-download-btn" onclick="downloadImage(${i})">
⬇
        </div>

      </div>
    `;
  }

  // start generating asynchronously
  generateImages(selectedModel, imageCount, aspectRatio, promptText)
    .then(() => console.log("▶ generateImages finished"))
    .catch((err) => console.error("generation error:", err));
};

function downloadImage(index) {
  try {
    const imgCard = document.getElementById(`img-card-${index}`);
    if (!imgCard) throw new Error("image card not found");
    const img = imgCard.querySelector(".result-img");
    if (!img || !img.src) {
      alert("Image not ready for download.");
      return;
    }

    const link = document.createElement("a");
    link.href = img.src;
    link.download = `image-${index}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    console.log("⬇ download triggered for image", index);
  } catch (err) {
    console.error("downloadImage error:", err);
  }
}

// =============================
//      FORM SUBMIT
// =============================
const handleFormSubmit = (e) => {
  e.preventDefault();
  console.log("▶ handleFormSubmit called", {
    model: modelSelect?.value,
    count: countSelect?.value,
    ratio: ratioSelect?.value,
    promptSample: (promptInput?.value || "").slice(0, 80)
  });

  const selectedModel = modelSelect?.value || "default";
  const imageCount = parseInt(countSelect?.value, 10) || 1;
  const aspectRatio = ratioSelect?.value || "1/1";
  const promptText = promptInput?.value?.trim() || "";

  if (!promptText) {
    alert("Please enter a prompt.");
    return;
  }

  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

// ========== EVENT LISTENERS ==========
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

if (promptBtn) {
  promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    if (promptInput) {
      promptInput.value = prompt;
      promptInput.focus();
      console.log("▶ random prompt inserted", { prompt: prompt.slice(0,80) });
    }
  });
}

if (promptInputForm) promptInputForm.addEventListener("submit", handleFormSubmit);

// final state log
console.log("✅ script initialization complete. Ready.");
