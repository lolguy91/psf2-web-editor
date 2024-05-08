document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file-input");
  const glyphsContainer = document.getElementById("glyphs-container");
  const glyphModal = document.getElementById("glyph-modal");
  const saveButton = document.getElementById("save-button");
  let psfData;

	const style = document.createElement("style");
	style.textContent = `
	    body {
	        background-color: #000; /* Set background color of the entire screen to black */	
 	       color: #fff; /* Set text color to white */
	    }
	`;
	document.head.appendChild(style);

  fileInput.addEventListener("change", handleFileUpload);
  saveButton.addEventListener("click", savePSF);

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".psf")) {
      const reader = new FileReader();
      reader.onload = function(e) {
        psfData = parsePSF(e.target.result);
        displayGlyphs(psfData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please select a valid PSF file.");
    }
  }

  function parsePSF(buffer) {
    const dataView = new DataView(buffer);
    const magic = dataView.getUint32(0, true);
    if (magic === 0x864ab572) {
      // PSF 2
      const headersize = dataView.getUint32(4, true);
      const numglyph = dataView.getUint32(16, true);
      const bytesperglyph = dataView.getUint32(20, true);
      const height = dataView.getUint32(24, true);
      const width = dataView.getUint32(28, true);

      const glyphs = [];
      let offset = 32;
      for (let i = 0; i < numglyph; i++) {
        const bitmap = new Uint8Array(buffer, offset, bytesperglyph);
        glyphs.push({ bitmap, width, height });
        offset += bytesperglyph;
      }

      return glyphs;
    } else {
      alert("Unsupported PSF format.");
      return null;
    }
  }

function displayGlyphs(glyphs) {
    glyphsContainer.innerHTML = "";
    glyphs.forEach((glyph, index) => {
        const canvas = document.createElement("canvas");
        canvas.width = glyph.width * 3; // Adjust canvas size to be 3 times the actual size
        canvas.height = (glyph.height * 3) + 16;
	glyphsContainer.appendChild(canvas);
        regenerateThumbnail(glyph,index);

        // Add click event listener to open modal
        canvas.addEventListener("click", () => openGlyphModal(index, glyph));

        glyphsContainer.appendChild(canvas);
    });
    glyphsContainer.classList.remove("hidden");
}
  const cp437Table = {
    0: "\0",
    1: "☺",
    2: "☻",
    3: "♥",
    4: "♦",
    5: "♣",
    6: "♠",
    7: "•",
    8: "◘",
    9: "○",
    10: "◙",
    11: "♂",
    12: "♀",
    13: "\r",
    14: "♫",
    15: "☼",
    16: "►",
    17: "◄",
    18: "↕",
    19: "‼",
    20: "¶",
    21: "§",
    22: "▬",
    23: "↨",
    24: "↑",
    25: "↓",
    26: "→",
    27: "←",
    28: "∟",
    29: "↔",
    30: "▲",
    31: "▼",
    32: " ",
    33: "!",
    34: "\"",
    35: "#",
    36: "$",
    37: "%",
    38: "&",
    39: "'",
    40: "(",
    41: ")",
    42: "*",
    43: "+",
    44: ",",
    45: "-",
    46: ".",
    47: "/",
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    58: ":",
    59: ";",
    60: "<",
    61: "=",
    62: ">",
    63: "?",
    64: "@",
    65: "A",
    66: "B",
    67: "C",
    68: "D",
    69: "E",
    70: "F",
    71: "G",
    72: "H",
    73: "I",
    74: "J",
    75: "K",
    76: "L",
    77: "M",
    78: "N",
    79: "O",
    80: "P",
    81: "Q",
    82: "R",
    83: "S",
    84: "T",
    85: "U",
    86: "V",
    87: "W",
    88: "X",
    89: "Y",
    90: "Z",
    91: "[",
    92: "\\",
    93: "]",
    94: "^",
    95: "_",
    96: "`",
    97: "a",
    98: "b",
    99: "c",
    100: "d",
    101: "e",
    102: "f",
    103: "g",
    104: "h",
    105: "i",
    106: "j",
    107: "k",
    108: "l",
    109: "m",
    110: "n",
    111: "o",
    112: "p",
    113: "q",
    114: "r",
    115: "s",
    116: "t",
    117: "u",
    118: "v",
    119: "w",
    120: "x",
    121: "y",
    122: "z",
    123: "{",
    124: "|",
    125: "}",
    126: "~",
    127: "",
    128: "Ç",
    129: "ü",
    130: "é",
    131: "â",
    132: "ä",
    133: "à",
    134: "å",
    135: "ç",
    136: "ê",
    137: "ë",
    138: "è",
    139: "ï",
    140: "î",
    141: "ì",
    142: "Ä",
    143: "Å",
    144: "æ",
    145: "Æ",
    146: "œ",
    147: "ô",
    148: "ö",
    149: "ò",
    150: "û",
    151: "ù",
    152: "ÿ",
    153: "Ö",
    154: "Ü",
    155: "¢",
    156: "£",
    157: "¥",
    158: "₧",
    159: "ƒ",
    160: "á",
    161: "í",
    162: "ó",
    163: "ú",
    164: "ñ",
    165: "Ñ",
    166: "ª",
    167: "º",
    168: "¿",
    169: "⌐",
    170: "¬",
    171: "½",
    172: "¼",
    173: "¡",
    174: "«",
    175: "»",
    176: "░",
    177: "▒",
    178: "▓",
    179: "│",
    180: "┤",
    181: "╡",
    182: "╢",
    183: "╖",
    184: "╕",
    185: "╣",
    186: "║",
    187: "╗",
    188: "╝",
    189: "╜",
    190: "╛",
    191: "┐",
    192: "└",
    193: "┴",
    194: "┬",
    195: "├",
    196: "─",
    197: "┼",
    198: "╞",
    199: "╟",
    200: "╚",
    201: "╔",
    202: "╩",
    203: "╦",
    204: "╠",
    205: "═",
    206: "╬",
    207: "╧",
    208: "╨",
    209: "╤",
    210: "╥",
    211: "╙",
    212: "╘",
    213: "╒",
    214: "╓",
    215: "╫",
    216: "╪",
    217: "┘",
    218: "┌",
    219: "█",
    220: "▄",
    221: "▌",
    222: "▐",
    223: "▀",
    224: "α",
    225: "ß",
    226: "Γ",
    227: "π",
    228: "Σ",
    229: "σ",
    230: "μ",
    231: "τ",
    232: "Φ",
    233: "Θ",
    234: "Ω",
    235: "δ",
    236: "∞",
    237: "φ",
    238: "ε",
    239: "∩",
    240: "≡",
    241: "±",
    242: "≥",
    243: "≤",
    244: "⌠",
    245: "⌡",
    246: "÷",
    247: "≈",
    248: "°",
    249: "∙",
    250: "·",
    251: "√",
    252: "ⁿ",
    253: "²",
    254: "■",
    255: "□"
  };

function regenerateThumbnail(glyph,index) {
    	const canvas = document.querySelectorAll("canvas")[index];
	const context = canvas.getContext("2d");
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#000";
        for (let y = 0; y < glyph.height; y++) {
            for (let x = 0; x < glyph.width; x++) {
                const bitIndex = y * Math.ceil(glyph.width / 8) + Math.floor(x / 8);
                const bitOffset = 7 - (x % 8);
                const bit = (glyph.bitmap[bitIndex] >> bitOffset) & 1;
                if (bit) {
                    context.fillRect(x * 3, y * 3, 3, 3);
                }
            }
        }
        // Add text label with corresponding letter
        context.font = "16px Arial";
        context.fillStyle = "#F00";
        context.textAlign = "center";
        context.fillText("\"" + cp437Table[index] + "\"", canvas.width / 2, canvas.height - 3);
}

function openGlyphModal(index, glyph) {
    const popup = window.open("", "_blank", "width=300,height=400");

    // Pass glyph data to the popup window
    popup.glyphData = { index, glyph };

    const canvas = popup.document.createElement("canvas");
    canvas.width = glyph.width * 10; // Enlarge for editing
    canvas.height = glyph.height * 10;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000";
    for (let y = 0; y < glyph.height; y++) {
        for (let x = 0; x < glyph.width; x++) {
            const bitIndex = y * Math.ceil(glyph.width / 8) + Math.floor(x / 8);
            const bitOffset = 7 - (x % 8);
            const bit = (glyph.bitmap[bitIndex] >> bitOffset) & 1;
            if (bit) {
                context.fillRect(x * 10, y * 10, 10, 10);
            }
        }
    }

    let isMouseDown = false;

    canvas.addEventListener("mousedown", (event) => {
        isMouseDown = true;
        const isLeftClick = event.button === 0;
        const isRightClick = event.button === 2;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;
        const pixelX = Math.floor(mouseX / 10);
        const pixelY = Math.floor(mouseY / 10);
        const bitIndex = pixelY * Math.ceil(glyph.width / 8) + Math.floor(pixelX / 8);
        const bitOffset = 7 - (pixelX % 8);

        // Set the bit based on click type
        if (isLeftClick) {
            glyph.bitmap[bitIndex] |= (1 << bitOffset); // Set to white
        } else if (isRightClick) {
            glyph.bitmap[bitIndex] &= ~(1 << bitOffset); // Set to black
        }

        // Redraw the pixel on the canvas
        context.fillStyle = (glyph.bitmap[bitIndex] >> bitOffset) & 1 ? "#000" : "#fff";
        context.fillRect(pixelX * 10, pixelY * 10, 10, 10);

        regenerateThumbnail(glyph,index);
    });

    canvas.addEventListener("mousemove", (event) => {
        if (isMouseDown) {
            const isLeftClick = event.buttons === 1;
            const isRightClick = event.buttons === 2;

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (event.clientX - rect.left) * scaleX;
            const mouseY = (event.clientY - rect.top) * scaleY;
            const pixelX = Math.floor(mouseX / 10);
            const pixelY = Math.floor(mouseY / 10);
            const bitIndex = pixelY * Math.ceil(glyph.width / 8) + Math.floor(pixelX / 8);
            const bitOffset = 7 - (pixelX % 8);

            // Set the bit based on click type
            if (isLeftClick) {
                glyph.bitmap[bitIndex] |= (1 << bitOffset); // Set to white
            } else if (isRightClick) {
                glyph.bitmap[bitIndex] &= ~(1 << bitOffset); // Set to black
            }

            // Redraw the pixel on the canvas
            context.fillStyle = (glyph.bitmap[bitIndex] >> bitOffset) & 1 ? "#000" : "#fff";
            context.fillRect(pixelX * 10, pixelY * 10, 10, 10);

            regenerateThumbnail(glyph,index);
        }
    });

    canvas.addEventListener("mouseup", () => {
        isMouseDown = false;
    });

    // Disable context menu
    canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
    popup.document.body.innerHTML = "\"" + String.fromCharCode(index) + "\"" + "</br>";
    popup.document.body.appendChild(canvas);
	const style = popup.document.createElement("style");
	style.textContent = `
	    body {
	        background-color: #000; /* Set background color of the entire screen to black */	
 	       color: #fff; /* Set text color to white */
	    }
	`;
	popup.document.head.appendChild(style);
}

  function savePSF() {
    const blob = new Blob([generatePSF(psfData)], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "edited_font.psf";
    link.click();
  }

function generatePSF(glyphs) {
    const headerSize = 32;
    const numGlyphs = glyphs.length;
    const bytesPerGlyph = glyphs[0].bitmap.byteLength;

    const header = new Uint8Array(headerSize);
    header.set(new Uint8Array([0x72, 0xb5, 0x4a, 0x86])); // PSF2 magic
    new DataView(header.buffer, 4, 4).setUint32(0, headerSize, true); // Header size
    new DataView(header.buffer, 16, 4).setUint32(0, numGlyphs, true); // Number of glyphs
    new DataView(header.buffer, 20, 4).setUint32(0, bytesPerGlyph, true); // Bytes per glyph
    new DataView(header.buffer, 24, 4).setUint32(0, glyphs[0].height, true); // Height
    new DataView(header.buffer, 28, 4).setUint32(0, glyphs[0].width, true); // Width

    const buffer = new Uint8Array(headerSize + numGlyphs * bytesPerGlyph);
    buffer.set(header);

    let offset = headerSize;
    glyphs.forEach((glyph) => {
      buffer.set(glyph.bitmap, offset);
      offset += bytesPerGlyph;
    });

    return buffer;
}
document.getElementById("new-font-btn").addEventListener("click", () => {
    const popup = window.open("", "_blank", "width=300,height=200");
    popup.document.write(`
        <h3>Enter Glyph Dimensions</h3>
        <form id="glyph-dimensions-form">
            <label for="glyph-height">Height:</label>
            <input type="number" id="glyph-height" name="glyph-height" required><br><br>
            <label for="glyph-width">Width:</label>
            <input type="number" id="glyph-width" name="glyph-width" required><br><br>
            <input type="submit" value="Create Font">
        </form>
    `);

    popup.document.getElementById("glyph-dimensions-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const glyphHeight = parseInt(popup.document.getElementById("glyph-height").value);
        const glyphWidth = parseInt(popup.document.getElementById("glyph-width").value);
        popup.close();
        createNewFont(glyphHeight, glyphWidth);
    });
});

function createNewFont(height, width) {
    // Generate blank glyphs for the new font
    const newFont = [];
    for (let i = 0; i < 256; i++) {
        const bitmap = new Uint8Array(Math.ceil((height * width) / 8));
        newFont.push({ bitmap, height, width });
    }

    // Display the new font
    displayGlyphs(newFont);
}

});
