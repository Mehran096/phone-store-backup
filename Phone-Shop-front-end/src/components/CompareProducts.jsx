import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  addToCompare,
  removeFromCompare,
} from '../slices/compareSlice';
import { FaChevronDown, FaTrophy, } from 'react-icons/fa';
import CompareSearch from './CompareSearch';

const CompareProducts = ({ products, showRemove = true, onReplace, onClear, updating }) => {
  //console.count("CompareProducts");
 const isPrinting = window.matchMedia("print").matches;

const maxCompare =
  isPrinting
    ? 4
    : window.innerWidth < 1024
      ? 2
      : 4;

  const displayProducts = useMemo(() => {
    const slots = [...products];

    while (slots.length < maxCompare) {
      slots.push(null);
    }

    return slots;
  }, [products, maxCompare]);

  const dispatch = useDispatch();
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showDifferences, setShowDifferences] = useState(false);
  //const { products } = useSelector((state) => state.compare);
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const obj = {};

    displayProducts.filter(Boolean).forEach((product) => {
      obj[product._id] = {
        storage: product.defaultStorage,
        color: product.defaultColor,
      };
    });

    return obj;
  });

  //for sticky specs scrolling
  const performanceRef = useRef(null);
  const displayRef = useRef(null);
  const cameraRef = useRef(null);
  const batteryRef = useRef(null);
  const connectivityRef = useRef(null);
  const designRef = useRef(null);
  const phoneRef = useRef(null);

  const scrollToSection = (ref) => {
    if (!ref.current) return;
    const offset = 180;
    window.scrollTo({
      top: ref.current.offsetTop - offset,
      behavior: "smooth",
    });
  };
  //for mobile screen only /start
  const [openSections, setOpenSections] = useState({
    overview: true,
    performance: false,
    display: false,
    camera: false,
    battery: false,
    design: false,
    connectivity: false,
  });
  //for mobile screen only /end
 useEffect(() => {
  setSelectedVariants((prev) => {
    let changed = false;
    const next = { ...prev };

    displayProducts.filter(Boolean).forEach((product) => {
      const current = next[product._id];

      if (
        !current ||
        current.storage !== product.defaultStorage ||
        current.color !== product.defaultColor
      ) {
        next[product._id] = {
          storage: product.defaultStorage,
          color: product.defaultColor,
        };
        changed = true;
      }
    });

    return changed ? next : prev;
  });
}, [products]);

  const getSelectedVariant = (product) => {
    if (!product) return null;

    const selected = selectedVariants[product._id];

    return (
      product.variants.find(
        (v) => v.storage === selected?.storage
      ) || product.variants[0]
    );
  };

  //for mobile screen only
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getSelectedColor = (product) => {
    if (!product) return null
    const variant = getSelectedVariant(product);

    return (
      variant.colors.find(
        (color) => color.name === selectedVariants[product._id]?.color
      ) || variant.colors[0]
    );
  };

  //for spesc highlights
  const comparableSpecs = [
    "RAM",
    "Storage",
    "Battery",
    "Refresh Rate",
    "Charging",
    "Brightness",
    "Display",
    "OS",
    "Chipset",
    "Rear Camera",
    "Front Camera",
    "Build",
    "Other",
    "Connectivity",
    "Other",
  ];

  //handler for specs
  const extractNumber = (value) => {
    if (!value) return 0;

    const match = value.toString().match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const isBestValue = (specKey, value) => {
    const getValidProducts = () => displayProducts.filter(Boolean);
    if (!comparableSpecs.includes(specKey)) return false;

    // Special handling for Chipset
    if (specKey === "Chipset") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getChipsetScore(variant.specs?.Chipset);
      });

      const max = Math.max(...values);

      return getChipsetScore(value) === max && max > 0;
    }

    if (specKey === "Storage") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getStorageScore(variant.specs?.Storage);
      });

      const max = Math.max(...values);

      return getStorageScore(value) === max && max > 0;
    }

    if (specKey === "RAM") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getRamScore(variant.specs?.RAM);
      });

      const max = Math.max(...values);

      return getRamScore(value) === max && max > 0;
    }

    if (specKey === "Battery") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getBatteryScore(variant.specs?.Battery);
      });

      const max = Math.max(...values);

      return getBatteryScore(value) === max && max > 0;
    }

    if (specKey === "Display") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getDisplayScore(variant.specs?.Display);
      });

      const max = Math.max(...values);

      return getDisplayScore(value) === max && max > 0;
    }

    if (specKey === "Rear Camera") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getRearCameraScore(variant.specs?.["Rear Camera"]);
      });

      const max = Math.max(...values);

      return getRearCameraScore(value) === max && max > 0;
    }

    if (specKey === "Front Camera") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getRearCameraScore(variant.specs?.["Front Camera"]);
      });

      const max = Math.max(...values);

      return getRearCameraScore(value) === max && max > 0;
    }

    if (specKey === "Build") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getBuildScore(variant.specs?.Build);
      });

      const max = Math.max(...values);

      return getBuildScore(value) === max && max > 0;
    }

    if (specKey === "Connectivity") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getConnectivityScore(variant.specs?.Connectivity);
      });

      const max = Math.max(...values);

      return getConnectivityScore(value) === max && max > 0;
    }

    if (specKey === "OS") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getOSScore(variant.specs?.OS);
      });

      const max = Math.max(...values);

      return getOSScore(value) === max && max > 0;
    }

    if (specKey === "Other") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getOtherScore(variant.specs?.Other);
      });

      const max = Math.max(...values);

      return getOtherScore(value) === max && max > 0;
    }



    // Default numeric comparison
    const values = displayProducts
      .map((product) => {
        if (!product) return null;

        const variant = getSelectedVariant(product);
        return variant?.specs?.[specKey];
      })
      .filter(Boolean);

    const max = Math.max(...values);

    return extractNumber(value) === max && max > 0;
  };

  //helper for all specs calculation getAbcScore /start
  const normalizeScore = (current, values) => {
  const validValues = values.filter((v) => typeof v === "number" && !isNaN(v));

  if (!validValues.length) return 0;

  const max = Math.max(...validValues);

  if (max === 0) return 0;

  return current / max;
};

const getComparisonValues = (key, parser) => {
  return displayProducts
    .filter(Boolean)
    .map((product) => {
      const variant = getSelectedVariant(product);
      return parser(variant?.specs?.[key]);
    });
};
// end
 


  const BUILD_MATERIAL_RANKS = {
  "grade 5 titanium": 100,
  "grade 2 titanium": 95,
  "titanium": 90,

  "stainless steel": 85,

  "aluminum": 75,
  "aluminium": 75,

  "glass": 65,

  "plastic": 45,
  "polycarbonate": 40,
};

 const parseBuild = (build = "") => {
  const text = build.toLowerCase();

  let score = 0;

  // Main Material
  for (const [material, value] of Object.entries(BUILD_MATERIAL_RANKS)) {
    if (text.includes(material)) {
      score += value;
      break;
    }
  }

  // Front Glass Protection
  if (text.includes("ceramic shield")) score += 80;
  else if (text.includes("gorilla glass armor")) score += 75;
  else if (text.includes("gorilla glass victus 2")) score += 70;
  else if (text.includes("gorilla glass victus")) score += 65;
  else if (text.includes("gorilla glass 7")) score += 60;
  else if (text.includes("gorilla glass 6")) score += 55;
  else if (text.includes("gorilla glass 5")) score += 50;

  // IP Rating
  if (text.includes("ip69")) score += 60;
  else if (text.includes("ip68")) score += 55;
  else if (text.includes("ip67")) score += 45;
  else if (text.includes("ip65")) score += 35;
  else if (text.includes("ip64")) score += 25;
  else if (text.includes("ip54")) score += 15;

  // Foldables
  if (text.includes("armor flex hinge")) score += 30;
  if (text.includes("flex hinge")) score += 25;

  return score;
};

 const getBuildScore = (build = "") => {
  return normalizeScore(
    parseBuild(build),
    getComparisonValues("Build", parseBuild)
  );
};

  const DISPLAY_PANEL_RANKS = {
  // Apple
  "super retina xdr oled": 100,
  "super retina xdr": 98,

  // Samsung
  "dynamic amoled 2x": 98,
  "dynamic amoled": 96,

  // LTPO
  "ltpo amoled": 95,
  "ltpo oled": 94,

  // AMOLED
  "super amoled": 92,
  "fluid amoled": 91,
  "flexible amoled": 90,
  "amoled": 88,

  // OLED
  "p-oled": 86,
  "poled": 86,
  "oled": 84,

  // LCD
  "mini led": 80,
  "ips lcd": 70,
  "tft lcd": 60,
  "lcd": 55,
};

  const parseDisplay = (display = "") => {
  const text = display.toLowerCase();

  let score = 0;

  // Panel
  for (const [panel, value] of Object.entries(DISPLAY_PANEL_RANKS)) {
    if (text.includes(panel)) {
      score += value;
      break;
    }
  }

  // Refresh Rate
  const refresh = text.match(/(\d+)\s*hz/i);
  if (refresh) {
    score += Number(refresh[1]);
  }

  // Peak Brightness
  const brightness = text.match(/(\d+)\s*nits?/i);
  if (brightness) {
    score += Math.round(Number(brightness[1]) / 50);
  }

  // Resolution
  if (text.includes("8k")) score += 40;
  else if (text.includes("4k")) score += 30;
  else if (text.includes("qhd")) score += 25;
  else if (text.includes("2k")) score += 25;
  else if (text.includes("fhd")) score += 18;
  else if (text.includes("hd")) score += 10;

  // LTPO
  if (text.includes("ltpo")) score += 25;

  // HDR
  if (text.includes("dolby vision")) score += 25;
  else if (text.includes("hdr10+")) score += 20;
  else if (text.includes("hdr10")) score += 15;

  // Always-On Display
  if (
    text.includes("always-on") ||
    text.includes("always on")
  ) {
    score += 10;
  }

  // PWM Dimming
  const pwm = text.match(/(\d+)\s*hz pwm/i);
  if (pwm) {
    score += Math.round(Number(pwm[1]) / 200);
  }

  return score;
};

  const getDisplayScore = (display = "") => {
  return normalizeScore(
    parseDisplay(display),
    getComparisonValues("Display", parseDisplay)
  );
};

  const CHIPSET_RANKS = {
    // Apple
    "Apple A19 Pro": 101,
    "Apple A19": 100,
    "Apple A18 Pro": 98,
    "Apple A18": 96,
    "Apple A17 Pro": 94,
    "Apple A16 Bionic": 90,
    "Apple A15 Bionic": 86,
    "Apple A14 Bionic": 82,
    "Apple A13 Bionic": 78,

    // Snapdragon
    "Snapdragon 8 Elite": 99,
    "Snapdragon 8 Gen 4": 97,
    "Snapdragon 8 Gen 3": 95,
    "Snapdragon 8s Gen 3": 93,
    "Snapdragon 8 Gen 2": 91,
    "Snapdragon 8+ Gen 1": 89,
    "Snapdragon 8 Gen 1": 87,
    "Snapdragon 7+ Gen 3": 86,
    "Snapdragon 888": 83,
    "Snapdragon 870": 80,
    "Snapdragon 865": 76,

    // MediaTek
    "Dimensity 9400": 98,
    "Dimensity 9300+": 97,
    "Dimensity 9300": 95,
    "Dimensity 9200+": 93,
    "Dimensity 9200": 91,
    "Dimensity 9000": 88,
    "Dimensity 8400": 87,
    "Dimensity 8300": 84,

    // Google
    "Google Tensor G5": 96,
    "Google Tensor G4": 92,
    "Google Tensor G3": 88,
    "Google Tensor G2": 84,

    // Samsung
    "Exynos 2500": 96,
    "Exynos 2400": 92,
    "Exynos 2200": 86,
  };

  const parseChipset = (chipset = "") => {
    const text = chipset.toLowerCase();

    for (const [name, score] of Object.entries(CHIPSET_RANKS)) {
      if (text.includes(name.toLowerCase())) {
        return score;
      }
    }

    return 0;
  };

  const getChipsetScore = (chipset = "") => {
  const current = parseChipset(chipset);

  return normalizeScore(
    current,
    getComparisonValues("Chipset", parseChipset)
  );
};

const RAM_TYPE_BONUS = {
  "lpddr6": 25,
  "lpddr5x": 20,
  "lpddr5": 15,
  "lpddr4x": 8,
  "lpddr4": 5,
};
  const parseRam = (ram = "") => {
  const text = ram.toLowerCase();

  const size = parseFloat(text) || 0;

  let bonus = 0;

  for (const type in RAM_TYPE_BONUS) {
    if (text.includes(type)) {
      bonus = RAM_TYPE_BONUS[type];
      break;
    }
  }

  // Capacity is much more important than RAM type.
  return size * 100 + bonus;
};


 const getRamScore = (ram = "") => {
  return normalizeScore(
    parseRam(ram),
    getComparisonValues("RAM", parseRam)
  );
};

 const STORAGE_TYPE_BONUS = {
  "ufs 5.0": 40,
  "ufs 4.1": 38,
  "ufs 4.0": 35,
  "ufs 3.1": 25,
  "ufs 3.0": 20,
  "ufs 2.2": 12,
  "ufs 2.1": 10,
  "emmc": 5,
};

const parseStorage = (storage = "") => {
  const text = storage.toLowerCase();

  // Capacity
  let size = parseFloat(text) || 0;

  if (text.includes("tb")) {
    size *= 1024;
  }

  // Storage Type Bonus
  let bonus = 0;

  for (const type in STORAGE_TYPE_BONUS) {
    if (text.includes(type)) {
      bonus = STORAGE_TYPE_BONUS[type];
      break;
    }
  }

  // Capacity is much more important than storage type
  return size * 10 + bonus;
};

  const getStorageScore = (storage = "") => {
  return normalizeScore(
    parseStorage(storage),
    getComparisonValues("Storage", parseStorage)
  );
};


 const parseBattery = (battery = "") => {
  const text = battery.toLowerCase();

  let score = 0;

  // Battery Capacity (mAh)
  const capacity = text.match(/(\d+)\s*mah/i);
  if (capacity) {
    score += parseInt(capacity[1]);
  }

  // Wired Charging (W)
  const wired = text.match(/(\d+)\s*w/i);
  if (wired) {
    score += parseInt(wired[1]) * 10;
  }

  // Wireless Charging
  const wireless = text.match(/wireless.*?(\d+)\s*w/i);
  if (wireless) {
    score += parseInt(wireless[1]) * 8;
  }

  // Reverse Wireless Charging
  if (text.includes("reverse wireless")) {
    score += 80;
  }

  // Silicon Carbon Battery
  if (
    text.includes("silicon carbon") ||
    text.includes("si/c")
  ) {
    score += 150;
  }

  return score;
};

 const getBatteryScore = (battery = "") => {
  return normalizeScore(
    parseBattery(battery),
    getComparisonValues("Battery", parseBattery)
  );
};

  const parseRearCamera = (camera = "") => {
  const text = camera.toLowerCase();

  let score = 0;

  // Main Camera (MP)
  const main = text.match(/(\d+)\s*mp/i);
  if (main) {
    score += parseInt(main[1]) * 8;
  }

  // OIS
  if (text.includes("ois")) {
    score += 150;
  }

  // Telephoto
  if (text.includes("telephoto")) {
    score += 180;
  }

  // Periscope
  if (text.includes("periscope")) {
    score += 250;
  }

  // Ultrawide
  if (
    text.includes("ultra wide") ||
    text.includes("ultrawide")
  ) {
    score += 120;
  }

  // Optical Zoom
  const opticalZoom = text.match(/(\d+(\.\d+)?)x/i);
  if (opticalZoom) {
    score += Number(opticalZoom[1]) * 40;
  }

  // Laser Autofocus
  if (text.includes("laser af")) {
    score += 80;
  }

  // PDAF
  if (text.includes("pdaf")) {
    score += 60;
  }

  // HDR
  if (text.includes("hdr")) {
    score += 40;
  }

  // Dolby Vision Recording
  if (text.includes("dolby vision")) {
    score += 100;
  }

  // 8K Recording
  if (text.includes("8k")) {
    score += 120;
  } else if (text.includes("4k")) {
    score += 60;
  }

  return score;
};

 const getRearCameraScore = (camera = "") => {
  return normalizeScore(
    parseRearCamera(camera),
    getComparisonValues("Rear Camera", parseRearCamera)
  );
};

  const parseFrontCamera = (camera = "") => {
  const text = camera.toLowerCase();

  let score = 0;

  // Selfie Camera (MP)
  const mp = text.match(/(\d+)\s*mp/i);
  if (mp) {
    score += parseInt(mp[1]) * 8;
  }

  // Autofocus
  if (text.includes("autofocus") || text.includes("af")) {
    score += 150;
  }

  // OIS
  if (text.includes("ois")) {
    score += 180;
  }

  // HDR
  if (text.includes("hdr")) {
    score += 50;
  }

  // Dolby Vision Video
  if (text.includes("dolby vision")) {
    score += 100;
  }

  // Video Recording
  if (text.includes("8k")) {
    score += 120;
  } else if (text.includes("4k")) {
    score += 80;
  } else if (text.includes("1080p")) {
    score += 40;
  }

  // Dual Front Camera
  if (text.includes("dual")) {
    score += 80;
  }

  // TOF / Depth Sensor
  if (
    text.includes("tof") ||
    text.includes("depth sensor")
  ) {
    score += 60;
  }

  return score;
};

 const getFrontCameraScore = (camera = "") => {
  return normalizeScore(
    parseFrontCamera(camera),
    getComparisonValues("Front Camera", parseFrontCamera)
  );
};

  const parseConnectivity = (connectivity = "") => {
  const text = connectivity.toLowerCase();

  let score = 0;

  // Cellular
  if (text.includes("6g")) score += 120;
  else if (text.includes("5g")) score += 100;
  else if (text.includes("4g")) score += 50;

  // Wi-Fi
  if (text.includes("wi-fi 7")) score += 80;
  else if (text.includes("wi-fi 6e")) score += 70;
  else if (text.includes("wi-fi 6")) score += 60;
  else if (text.includes("wi-fi 5")) score += 40;

  // Bluetooth
  if (text.includes("bluetooth 6")) score += 60;
  else if (text.includes("bluetooth 5.4")) score += 55;
  else if (text.includes("bluetooth 5.3")) score += 50;
  else if (text.includes("bluetooth 5.2")) score += 45;
  else if (text.includes("bluetooth 5.1")) score += 40;
  else if (text.includes("bluetooth 5.0")) score += 35;

  // USB
  if (text.includes("usb-c 4")) score += 70;
  else if (text.includes("usb 4")) score += 70;
  else if (text.includes("usb-c 3.2")) score += 60;
  else if (text.includes("usb 3.2")) score += 60;
  else if (text.includes("usb-c 3.1")) score += 50;
  else if (text.includes("usb 3.1")) score += 50;
  else if (text.includes("usb-c 2")) score += 30;
  else if (text.includes("usb 2.0")) score += 30;

  // NFC
  if (text.includes("nfc")) score += 30;

  // Ultra Wideband
  if (text.includes("uwb")) score += 35;

  // Satellite Communication
  if (text.includes("satellite")) score += 40;

  // eSIM
  if (text.includes("esim")) score += 25;

  // Dual SIM
  if (text.includes("dual sim")) score += 15;

  // Infrared Blaster
  if (
    text.includes("infrared") ||
    text.includes("ir blaster")
  ) {
    score += 20;
  }

  return score;
};

 const getConnectivityScore = (connectivity = "") => {
  return normalizeScore(
    parseConnectivity(connectivity),
    getComparisonValues("Connectivity", parseConnectivity)
  );
};

  const parseOS = (os = "") => {
  const text = os.toLowerCase();

  let score = 0;

  // Android / iOS Version
  const version = text.match(/(android|ios)\s*(\d+)/i);

  if (version) {
    const osName = version[1].toLowerCase();
    const osVersion = parseInt(version[2]);

    if (osName === "android") {
      score += osVersion * 15;
    } else if (osName === "ios") {
      score += osVersion * 15;
    }
  }

  // Major Android Skins
  if (text.includes("one ui")) score += 30;
  else if (text.includes("oxygenos")) score += 28;
  else if (text.includes("hyperos")) score += 26;
  else if (text.includes("coloros")) score += 24;
  else if (text.includes("funtouch")) score += 20;
  else if (text.includes("magicos")) score += 22;
  else if (text.includes("nothing os")) score += 25;

  // Software Updates
  const updates = text.match(/(\d+)\s*years?/i);

  if (updates) {
    score += parseInt(updates[1]) * 40;
  }

  // AI Features
  if (text.includes("apple intelligence")) score += 80;
  if (text.includes("galaxy ai")) score += 80;
  if (text.includes("gemini")) score += 70;
  if (text.includes("circle to search")) score += 30;
  if (text.includes("live translate")) score += 25;

  // Security Updates
  const security = text.match(/(\d+)\s*years?\s*security/i);

  if (security) {
    score += parseInt(security[1]) * 15;
  }

  // Desktop Mode
  if (text.includes("dex")) score += 40;
  if (text.includes("ready for")) score += 35;

  return score;
};

  const getOSScore = (os = "") => {
  return normalizeScore(
    parseOS(os),
    getComparisonValues("OS", parseOS)
  );
};

  const parseOther = (other = "") => {
  const text = other.toLowerCase();

  let score = 0;

  // Audio
  if (text.includes("stereo speakers")) score += 40;
  else if (text.includes("stereo")) score += 30;

  if (text.includes("dolby atmos")) score += 25;

  if (
    text.includes("hi-res audio") ||
    text.includes("hi res audio")
  ) {
    score += 20;
  }

  // Cooling
  if (
    text.includes("vapor chamber") ||
    text.includes("vc cooling")
  ) {
    score += 40;
  }

  // Haptics
  if (
    text.includes("x-axis") ||
    text.includes("linear motor")
  ) {
    score += 35;
  }

  // Fingerprint
  if (text.includes("ultrasonic fingerprint")) {
    score += 40;
  } else if (
    text.includes("in-display fingerprint") ||
    text.includes("under display fingerprint")
  ) {
    score += 30;
  } else if (text.includes("side fingerprint")) {
    score += 20;
  }

  // Face Unlock
  if (text.includes("face id")) {
    score += 40;
  } else if (
    text.includes("3d face unlock") ||
    text.includes("3d face")
  ) {
    score += 35;
  } else if (text.includes("face unlock")) {
    score += 20;
  }

  // Emergency SOS
  if (text.includes("emergency sos")) {
    score += 15;
  }

  return score;
};

 const getOtherScore = (other = "") => {
  return normalizeScore(
    parseOther(other),
    getComparisonValues("Other", parseOther)
  );
};

  // console.log(getChipsetRank("Apple A19 Pro"));
  // console.log(getChipsetRank("Apple A14 Bionic"));
  // console.log(getChipsetRank("Snapdragon 8 Elite"));

  const SCORE_WEIGHTS = {
    Chipset: 23,
    RAM: 10,
    Storage: 8,
    Display: 15,
    "Rear Camera": 15,
    "Front Camera": 5,
    Battery: 10,
    OS: 5,
    Build: 4,
    Connectivity: 3,
    Other: 2,
  };


  const calculateScore = (variant) => {
    if (!variant) return 0;
    let score = 0;

    score +=
      getChipsetScore(variant.specs?.Chipset) *
      SCORE_WEIGHTS.Chipset;

    score +=
      getRamScore(variant.specs?.RAM) *
      SCORE_WEIGHTS.RAM;

    score +=
      getStorageScore(variant.specs?.Storage) *
      SCORE_WEIGHTS.Storage;

    score +=
      getDisplayScore(variant.specs?.Display) *
      SCORE_WEIGHTS.Display;

    score +=
      getRearCameraScore(variant.specs?.["Rear Camera"]) *
      SCORE_WEIGHTS["Rear Camera"];

    score +=
      getFrontCameraScore(variant.specs?.["Front Camera"]) *
      SCORE_WEIGHTS["Front Camera"];

    score +=
      getBatteryScore(variant.specs?.Battery) *
      SCORE_WEIGHTS.Battery;

    score +=
      getOSScore(variant.specs?.OS) *
      SCORE_WEIGHTS.OS;

    score +=
      getBuildScore(variant.specs?.Build) *
      SCORE_WEIGHTS.Build;

    score +=
      getOtherScore(variant.specs?.Other) *
      SCORE_WEIGHTS.Other;

    score +=
      getConnectivityScore(variant.specs?.Connectivity) *
      SCORE_WEIGHTS.Connectivity;

    return Math.round(score);
  };

  const score1 = displayProducts[0]
    ? calculateScore(getSelectedVariant(displayProducts[0]))
    : 0;

  const score2 = displayProducts[1]
    ? calculateScore(getSelectedVariant(displayProducts[1]))
    : 0;

  const winner =
    score1 > score2
      ? displayProducts[0]
      : score2 > score1
        ? displayProducts[1]
        : null;


  //progress bar helper
  const getScoreColor = (score) => {
    if (score >= 80)
      return {
        bar: "bg-green-500",
        text: "text-green-600",
      };

    if (score >= 60)
      return {
        bar: "bg-yellow-500",
        text: "text-yellow-600",
      };

    if (score >= 40)
      return {
        bar: "bg-blue-500",
        text: "text-blue-600",
      };

    return {
      bar: "bg-red-500",
      text: "text-red-600",
    };
  };

  const score1Style = getScoreColor(score1);
  const score2Style = getScoreColor(score2);

  //handler for specs difference
  const shouldShowRow = (specKey) => {
    if (!showDifferences) return true;

    const values = displayProducts.map((product) => {
      const variant = getSelectedVariant(product);
      return (variant.specs?.[specKey] || "").trim();
    });

    return new Set(values).size > 1;
  };

  //   const replaceProduct = (index, newProduct) => {
  //   console.log("Replace:", index, newProduct);
  // };
  const TableRow = ({ title, renderValue }) => (
    <tr className="border-b last:border-b-0">
      <td className="bg-gray-50 font-semibold text-gray-800 print:min-w-[150px] px-5 py-4 min-w-[260px] text-center">
        {title}
      </td>

      {displayProducts.map((product, index) => (
        <td
          key={product ? `${product._id}-${index}` : `empty-${index}`}
          className="w-70 print:min-w-[150px] print:max-w-[150px] min-w-[320px] max-w-[320px] px-5 py-4 text-center align-top"
        >
          {renderValue(product, index)}
        </td>
      ))}
    </tr>
  );

  //for mobile screen
  const MobileSection = ({
    title,
    sectionKey,
    openSections,
    setOpenSections,
    children,
  }) => {
    const open = openSections[sectionKey];

    return (
      <div className="border-t">

        <button
          onClick={() =>
            setOpenSections((prev) => ({
              ...prev,
              [sectionKey]: !prev[sectionKey],
            }))
          }
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 font-semibold"
        >
          <span>{title}</span>

          <span className="text-xl">
            {open ? "−" : "+"}
          </span>
        </button>

        {open && (
          <div className="p-4 space-y-3">
            {children}
          </div>
        )}

      </div>
    );
  };

  //custom drop down for mobile
  const CustomDropdown = ({ value, onChange, options, label, displayMap = {} }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={ref} className="relative w-full md:w-auto md:min-w-[160px]">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 border-gray-300 rounded-lg px-4 py-3 text-base bg-white 
            hover:border-gray-400 transition"
        >
          <span className="text-gray-900">
            {options.find((opt) => opt.value === value)?.label || label}
          </span>
          <FaChevronDown size={18} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[999] 
            max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm text-gray-900
                                    hover:bg-gray-100 ${value === opt.value ? 'bg-gray-100 font-medium' : ''
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>

      {/* Desktop */}
      <div className="hidden lg:block print:block overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-[1200px] w-full border-collapse">
          <thead className='w-56'>

            {showRemove && (
              <TableRow
                title="Search"
                renderValue={(product, index) => (

                  <CompareSearch
                  disabled={updating}
                    currentSlug={product?.slug || null}
                    compareProductIds={displayProducts
                      .filter(Boolean)
                      .map((p) => p._id)}
                    onSelect={(selectedProduct) =>
                      onReplace(index, selectedProduct)
                    }
                  />

                )}
              />
            )}
            <TableRow
              title="image"
              renderValue={(product, index) => {
                
                
                if (!product) {
                  if(!showRemove) return null
                  return (
                    
                    <div className="flex flex-col items-center py-4 px-10">
                      <span className="text-gray-400 italic">
                        No phone selected.
                        Search and add a phone to compare.
                      </span>
                    </div>
                  );
                }
                
                const variant = getSelectedVariant(product);
                const color = getSelectedColor(product, variant);

                return (
                  <div className="w-full flex flex-col items-center py-4">
                    <img
                      src={
                        color?.images?.[0]?.url ||
                        product.defaultImage
                      }
                      alt={product.name}
                      className="w-56 h-56 object-contain"
                    />

                    {showRemove && (
                      <button
                        onClick={() => onClear(index)}
                        className="mt-4 text-sm text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              }}
            />
            <TableRow
              title="Name"
              renderValue={(product) =>
                product ? (
                  <span className="font-medium">
                    {product.name}
                  </span>
                  
                ) : (
                showRemove && (
                  <span className="text-gray-400 italic">
                    No phone selected
                  </span>
                )
                )
              }
            />

            <TableRow
              title="Brand"
              renderValue={(product) =>
                  
                product ? product.brand || "-" : 
                showRemove && (
                "-"
                )
                 
              }
            />

            <TableRow
              title="Starting Price"
              renderValue={(product) => {
                  
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }

                const color = getSelectedColor(product);
                return `$${color?.price || 0}`;
              }}
            />

            <TableRow
              title="Rating"
              renderValue={(product) =>
                product ? (
                  <>⭐ {product.rating?.toFixed(1) || "0.0"}</>
                ) : (
                  showRemove && (
                  "-"
                  )
                )
              }
            />

            <TableRow
              title="Reviews"
              renderValue={(product) =>

                product ? product.numReviews : 
                 showRemove && (
                "-"
                 )
              }
            />
            <TableRow
              title="Storage"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }

                return (
                  <select
                    className="mt-2 w-full border rounded-md p-2"
                    value={selectedVariants[product._id]?.storage || ""}
                    onChange={(e) =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [product._id]: {
                          ...prev[product._id],
                          storage: e.target.value,
                        },
                      }))
                    }
                  >
                    {product.variants.map((variant) => (
                      <option
                        key={variant.storage}
                        value={variant.storage}
                      >
                        {variant.storage}
                      </option>
                    ))}
                  </select>
                );
              }}
            />
            <TableRow
              title="Colors"
              renderValue={(product) => {
                if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);

                return (
                  <select
                    className="mt-2 border rounded-md p-2  w-full"
                    value={selectedVariants[product._id]?.color || ""}
                    onChange={(e) =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [product._id]: {
                          ...prev[product._id],
                          color: e.target.value,
                        },
                      }))
                    }
                  >
                    {variant.colors.map((color) => (
                      <option
                        key={color.name}
                        value={color.name}
                      >
                        {color.name}
                      </option>
                    ))}
                  </select>
                );
              }}
            />
            <TableRow
              title="Display"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }

                const variant = getSelectedVariant(product);
                return variant?.specs?.Display || "-";
              }}
            />

            <TableRow
              title="RAM"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }

                const variant = getSelectedVariant(product);
                return variant?.specs?.RAM || "-";
              }}
            />

            <TableRow
              title="Rear Camera"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }

                const variant = getSelectedVariant(product);
                return variant?.specs?.["Rear Camera"] || "-";
              }}
            />

            <TableRow
              title="Front Camera"

              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.["Front Camera"] || "-";
              }}


            />

            <TableRow
              title="Battery"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.Battery || "-";
              }}

            />

            <TableRow
              title="Chipset"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.Chipset || "-";
              }}
            />

            <TableRow
              title="Operating System"
              renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.OS || "-";
              }}
            />

            <TableRow
              title="Build"

              renderValue={(product) => {
                if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                const variant = getSelectedVariant(product);
                return variant?.specs?.Build || "-";
              }}
            />


          </thead>

        </table>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Performance</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Chipset"

                renderValue={(product) => {
                  if (!product) {
                      if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.Chipset || "Search and add a phone to compare.";
                }}

              />

              <TableRow
                title="RAM"

                renderValue={(product) => {
                  if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.RAM || "-";
                }}
              />

              <TableRow
                title="Storage"

                renderValue={(product) => {
                   if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.Storage || "-";
                }}
              />

              <TableRow
                title="Operating System"

                renderValue={(product) => {
                 if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected 
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.OS || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Display</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Display"
                renderValue={(product) => {
                  if (!product) {
                      if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.Display || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Camera</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Rear Camera"

                renderValue={(product) => {
                  if (!product) {
                      if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.["Rear Camera"] || "-";
                }}
              />

              <TableRow
                title="Front Camera"

                renderValue={(product) => {
                  if (!product){
                     if(!showRemove) return null
                       return(
                        <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          
                          Search and add a phone to compare.
                        </span>
                      </div>
                      ) 
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.["Front Camera"] || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Battery</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Battery"
                renderValue={(product) => {
                  if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Battery || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Design</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Build"
                renderValue={(product) => {
                  if (!product) {
                     if(!showRemove) return null
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected.
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Build || "-";
                }}
              />

              <TableRow
                title="Other"

                renderValue={(product) => {
                   if (!product){
                     if(!showRemove) return null
                       return(
                        <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          
                          Search and add a phone to compare.
                        </span>
                      </div>
                      ) 
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Other || "-";
                }}
              />

              {/* <TableRow
        title="Colors"
        renderValue={(product) =>
          product.defaultColor?.join(", ") || "-"
        }
      /> */}

            </tbody>
          </table>
        </div>
        <div className="mt-10 mb-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Connectivity</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Connectivity"

                renderValue={(product) => {
                  if (!product){
                     if(!showRemove) return null
                       return(
                        <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          
                          Search and add a phone to compare.
                        </span>
                      </div>
                      ) 
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Connectivity || "-";
                }}

              />

            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
    MOBILE LAYOUT
========================= */}
      <div className="lg:hidden print:hidden bg-gray-100">

        <div className="grid grid-cols-2 gap-2">

          {displayProducts.slice(0, 2).map((product, index) => {
            const variant = product ? getSelectedVariant(product) : null;
            const color = product ? getSelectedColor(product) : null;
            const score = variant ? calculateScore(variant) : 0;
            const compareProductIds = displayProducts.filter(Boolean).map((p) => p._id);



            return (
              <div
                ref={phoneRef}
                key={product ? `${product._id}-${index}` : `empty-${index}`}
                className="w-full bg-white rounded-xl border shadow-md overflow-visible"
              >
                {!product ? (

                  <div className="p-2 border-b">
                    <CompareSearch
                      currentSlug={null}
                      compareProductIds={compareProductIds}
                      onSelect={(selectedProduct) =>
                        onReplace(index, selectedProduct)
                      }
                    />
                  </div>

                ) : (
                  <>
                    {/* Product Image */}
                    <div className="relative bg-gray-50 pt-8 pb-6 flex justify-center">
                      {showRemove && (
                        <button
                          onClick={() => onClear(index)}
                          className="absolute top-1 right-1 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50"
                        >
                          ✕
                        </button>
                      )}
                      <img
                        src={variant.colors?.find(
                          (c) =>
                            c.name ===
                            (selectedVariants[product._id]?.color ||
                              variant.colors?.[0]?.name)
                        )?.images?.[0]?.url}
                        alt={product.name}
                        className="h-40 w-auto object-contain"
                      />



                    </div>

                    {/* Product Info */}
                    <div className="p-4">

                      <h2 className="font-semibold text-lg line-clamp-2">
                        {product.name}
                      </h2>

                      {/* <p className="text-sm text-gray-500">
                    {product.brand}
                  </p> */}

                      {/* Price */}
                      <div className="mt-2 text-2xl font-bold text-blue-600">
                        ${getSelectedColor(product)?.price?.toLocaleString() || 0}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mt-2">

                        <span className="text-yellow-500">
                          ★
                        </span>

                        <span className="font-medium">
                          {product.rating?.toFixed(1) || 0}
                        </span>

                        <span className="text-gray-500">
                          ({product.numReviews})
                        </span>

                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">
                            Comparison Score
                          </span>

                          <span className="font-bold text-blue-600">
                            {score}
                          </span>
                        </div>

                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${score}%`,
                            }}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Variant Selectors */}
                    <div className="border-t p-4 space-y-4">

                      {/* Storage */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Select Storage
                        </label>

                        <div className="relative border rounded-lg">
                          <CustomDropdown
                            value={selectedVariants[product._id]?.storage || ""}
                            onChange={(storage) =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [product._id]: {
                                  ...prev[product._id],
                                  storage,
                                },
                              }))
                            }
                            options={product.variants.map((v) => ({
                              value: v.storage,
                              label: v.storage,
                            }))}
                            label="storage"
                          />


                        </div>
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Select Color
                        </label>
                        <div className="relative border rounded-lg">
                          <CustomDropdown
                            value={selectedVariants[product._id]?.color || ""}
                            onChange={(color) =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [product._id]: {
                                  ...prev[product._id],
                                  color,
                                },
                              }))
                            }
                            options={variant.colors.map((color) => ({
                              value: color.name,
                              label: color.name,
                            }))}
                            label="Color"
                          />
                        </div>
                      </div>
                      {showRemove && (
                        <MobileSection
                          title="Overview"
                          sectionKey="overview"
                          openSections={openSections}
                          setOpenSections={setOpenSections}
                        >

                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Reviews
                            </span>

                            <span>
                              {product.numReviews}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Storage
                            </span>

                            <span>
                              {variant.storage}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Color
                            </span>

                            <span>
                              {selectedVariants[product._id]?.color ||
                                variant.colors?.[0]?.name}
                            </span>
                          </div>

                        </MobileSection>
                      )}

                    </div>
                  </>
                )}

              </div>
            );
          })}
        </div>


        {/* sticky header */}
        <div
          className={`
              sticky top-16 z-40 lg:hidden
              transition-all duration-300 ease-in-out mt-2
              ${showStickyHeader
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
            }
            `}
        >
          <div className="bg-white border-b shadow-sm">
            <div className="grid grid-cols-2 gap-2 px-2 py-1">
              {displayProducts.slice(0, 2).map((product, index) => {
                const compareProductIds = displayProducts.filter(Boolean).map((p) => p._id);
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <CompareSearch
                        currentSlug={null}
                        compareProductIds={compareProductIds}
                        onSelect={(selectedProduct) =>
                          onReplace(index, selectedProduct)
                        }
                      />
                    </div>
                  );
                }
                const variant = getSelectedVariant(product);
                const color = getSelectedColor(product);


                return (

                  <div
                    key={product._id}
                    onClick={() => scrollToSection(phoneRef)}
                    className="flex items-center gap-2 bg-white border rounded-lg p-2 shadow-sm"
                  >
                    <img
                      src={color?.images?.[0]?.url || product.defaultImage}
                      alt={product.name}
                      className="w-10 h-10 object-contain flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">
                        {product.name}
                      </p>

                      <p className="text-[11px] text-gray-500 truncate">
                        {variant.storage} • {color?.name}
                      </p>
                      <p className="text-xs font-bold text-blue-600">
                        ${color?.price || product.price}
                      </p>
                    </div>
                  </div>
                );

              })}
            </div>
          </div>
        </div>
        {/* specs sticky bar */}
        <div className="sticky top-[132px] z-30 bg-white border-b shadow-sm">
          <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap">

            <button
              onClick={() => scrollToSection(performanceRef)}
              className="px-3 py-3 font-medium hover:text-blue-600"
            >
              Performance
            </button>

            <button
              onClick={() => scrollToSection(displayRef)}
              className="px-3 py-3 font-medium hover:text-blue-600"
            >
              Display
            </button>

            <button
              onClick={() => scrollToSection(cameraRef)}
              className="px-3 py-3 font-medium hover:text-blue-600"
            >
              Camera
            </button>

            <button
              onClick={() => scrollToSection(batteryRef)}
              className="px-3 py-3 font-medium hover:text-blue-600"
            >
              Battery
            </button>

            <button
              onClick={() => scrollToSection(designRef)}
              className="px-3 py-3 font-medium hover:text-blue-600"
            >
              Design
            </button>

            <button
              onClick={() => scrollToSection(connectivityRef)}
              className="px-3 py-3 font-medium hover:text-blue-600"
            >
              Connectivity
            </button>

          </div>
        </div>
        {/* Specifications total score */}
        <div className="mx-2  mb-6 rounded-xl border bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-bold text-center">
            Comparison Score
          </h2>
          {winner ? (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-center">
              🏆 <span className="font-semibold text-green-700">
                {winner.name} is the overall winner
              </span>
            </div>
          ) : (
            <div className="mb-4 rounded-lg bg-gray-100 p-3 text-center text-gray-600">
              Both phones are evenly matched.
            </div>
          )}


          <div className="grid grid-cols-2 gap-4">
            {/* Product 1 */}
            <div className="text-center">
              <h3 className="text-sm font-semibold truncate">
                {displayProducts?.[0]?.name}
              </h3>

              <p className={`text-3xl font-bold ${score1Style.text}`}>
                {score1}/100
              </p>

              <div className="h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${score1Style.bar}`}
                  style={{ width: `${score1}%` }}
                />
              </div>
            </div>

            {/* Product 2 */}
            <div className="text-center">
              <h3 className="text-sm font-semibold truncate">
                {displayProducts?.[1]?.name}
              </h3>

              <p className={`text-3xl font-bold ${score2Style.text}`}>
                {score2}/100
              </p>

              <div className="h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${score2Style.bar}`}
                  style={{ width: `${score2}%` }}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Specifications Difference */}

        <div className="flex items-center justify-between mx-2 mt-2 mb-4">
          <h2 className="text-sm sm:text-lg font-bold">
            Specifications
          </h2>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDifferences}
              onChange={() =>
                setShowDifferences((prev) => !prev)
              }
              className="w-4 h-4 accent-blue-600"
            />

            <span className="text-sm font-medium">
              Show only differences
            </span>
          </label>
        </div>

        {/* Specifications */}
        <div className="space-y-6 mt-8 mx-2">

          {/* Performance */}
          <div ref={performanceRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Performance</h2>

            <div className="space-y-4 p-4">
              {displayProducts.map((product, index) => {

                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        Search and add a phone to compare.
                      </span>
                    </div>
                  );
                }
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>

                    <div className="space-y-2 text-sm">

                      {shouldShowRow("Chipset") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Chipset</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Chipset", variant.specs?.Chipset)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                              }`}
                          >{variant.specs?.Chipset || "-"}

                            {isBestValue("Chipset", variant.specs?.Chipset) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5  text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {shouldShowRow("RAM") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">RAM</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("RAM", variant.specs?.RAM)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                              }`}
                          >
                            {variant.specs?.RAM || "-"}
                            {isBestValue("RAM", variant.specs?.RAM) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                      {shouldShowRow("Storage") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Storage</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Storage", variant.specs?.Storage)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                              }`}
                          >{variant.specs?.Storage || "-"}
                            {isBestValue("Storage", variant.specs?.Storage) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                      {shouldShowRow("OS") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Operating System</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("OS", variant.specs?.OS)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                              }`}
                          >{variant.specs?.OS || "-"}
                            {isBestValue("OS", variant.specs?.OS) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Display */}
          <div ref={displayRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Display</h2>

            <div className="space-y-4 p-4">
              {displayProducts.map((product, index) => {

                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        Search and add a phone to compare.
                      </span>
                    </div>
                  );
                }
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>
                    {shouldShowRow("Display") && (
                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">
                          Display
                        </span>

                        <span
                          className={`break-words rounded px-2 py-1 ${isBestValue("Display", variant.specs?.Display)
                            ? "bg-green-100 text-green-700 font-semibold"
                            : "text-gray-900"
                            }`}
                        >
                          {variant.specs?.Display || "-"}
                          {isBestValue("Display", variant.specs?.Display) && (
                            <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                              <FaTrophy className="text-[10px]" />
                              Best
                            </span>
                          )}
                        </span>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Camera */}
          <div ref={cameraRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Camera</h2>

            <div className="space-y-4 p-4">
              {displayProducts.map((product, index) => {

                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        No phone selected
                      </span>
                    </div>
                  );
                }
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>

                    <div className="space-y-2 text-sm">
                      {shouldShowRow("Rear Camera") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Rear Camera</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Rear Camera", variant.specs?.["Rear Camera"])
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                              }`}
                          >{variant.specs?.["Rear Camera"] || "-"}
                            {isBestValue("Rear Camera", variant.specs?.["Rear Camera"]) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                      {shouldShowRow("Front Camera") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Front Camera</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Front Camera", variant.specs?.["Front Camera"])
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                              }`}
                          >{variant.specs?.["Front Camera"] || "-"}

                            {isBestValue("Front Camera", variant.specs?.["Front Camera"]) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Battery */}
          <div ref={batteryRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Battery</h2>

            <div className="space-y-4 p-4">
              {displayProducts.map((product, index) => {

                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        No phone selected
                      </span>
                    </div>
                  );
                }
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>
                    {shouldShowRow("Battery") && (
                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Battery</span>
                        <span
                          className={`break-words rounded px-2 py-1 ${isBestValue("Battery", variant.specs?.Battery)
                            ? "bg-green-100 text-green-700 font-semibold"
                            : "text-gray-900"
                            }`}
                        >
                          {variant.specs?.Battery || "-"}
                          {isBestValue("Battery", variant.specs?.Battery) && (
                            <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                              <FaTrophy className="text-[10px]" />
                              Best
                            </span>
                          )}
                        </span>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Design */}
          <div ref={designRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Design</h2>

            <div className="space-y-4 p-4">
              {displayProducts.map((product, index) => {

                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        No phone selected
                      </span>
                    </div>
                  );
                }
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>

                    <div className="space-y-2 text-sm">
                      {shouldShowRow("Build") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Build</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Build", variant.specs?.Build)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                              }`}
                          >{variant.specs?.Build || "-"}
                            {isBestValue("Build", variant.specs?.Build) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {shouldShowRow("Other") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Other</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Other", variant.specs?.Other)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                              }`}
                          >{variant.specs?.Other || "-"}
                            {isBestValue("Other", variant.specs?.Other) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connectivity */}
          <div ref={connectivityRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Connectivity</h2>

            <div className="space-y-4 p-4">
              {displayProducts.map((product, index) => {

                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        No phone selected
                      </span>
                    </div>
                  );
                }
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>
                    {shouldShowRow("Connectivity") && (
                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Connectivity</span>
                        <span
                          className={`break-words rounded px-2 py-1 ${isBestValue("Connectivity", variant.specs?.Connectivity)
                            ? "bg-green-100 text-green-700 font-semibold"
                            : "text-gray-900"
                            }`}
                        >{variant.specs?.Connectivity || "-"}
                          {isBestValue("Connectivity", variant.specs?.Connectivity) && (
                            <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                              <FaTrophy className="text-[10px]" />
                              Best
                            </span>
                          )}

                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>


      </div>

    </>
  );
};

export default CompareProducts;