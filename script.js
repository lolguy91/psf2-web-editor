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
        context.fillText("\"" + String.fromCharCode(index) + "\"", canvas.width / 2, canvas.height - 3);
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
