const dropArea = document.getElementById("drop-area");
const overrideup = document.querySelector(".overrideup-area");
const overridedown = document.querySelector(".overridedown-area");

const upload_area = document.querySelector(".upload-area");
const download_area = document.querySelector(".download-area");
const fileInput = document.getElementById("file-input");

const footer = document.querySelector(".footer");

dropArea.addEventListener("dragenter", handleDragEnter, false);
dropArea.addEventListener("dragover", handleDragOver, false);
dropArea.addEventListener("dragleave", handleDragLeave, false);
dropArea.addEventListener("drop", handleFileDrop, false);
dropArea.addEventListener("mouseenter", handleMouseEnter, false);
dropArea.addEventListener("mouseleave", handleMouseLeave, false);
fileInput.addEventListener("change", handleFileInputChange);

dropArea.addEventListener("click", openFileInput);

function handleDragEnter(event) {
  event.preventDefault();
  event.stopPropagation();
  dropArea.style.border = "2px dashed rgba(255, 255, 255, 0.804)";
  dropArea.style.color = "rgba(255, 255, 255, 0.807)";
}

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
}

function handleDragLeave(event) {
  event.preventDefault();
  event.stopPropagation();
  if (!dropArea.contains(event.relatedTarget)) {
    dropArea.style.border = "2px dashed #ccccccca";
    dropArea.style.color = "#ccccccca";
  }
}

function handleFileDrop(event) {
  event.preventDefault();
  dropArea.classList.remove("drag-over");

  const file = event.dataTransfer.files[0];
  handleFile(file);
}
function handleMouseEnter(event) {
  if (window.matchMedia("(min-width: 768px)").matches) {
    dropArea.style.border = "2px dashed rgba(255, 255, 255, 0.804)";
    dropArea.style.color = "rgba(255, 255, 255, 0.807)";
  }
}

function handleMouseLeave(event) {
  if (window.matchMedia("(min-width: 768px)").matches) {
    dropArea.style.border = "2px dashed #ccccccca";
    dropArea.style.color = "#ccccccca";
  }
}

function handleFileInputChange(event) {
  const file = event.target.files[0];
  if (file) {
    handleFile(file);
  }
}

function openFileInput() {
  fileInput.click();
}

const drop_container = document.getElementById("drop-area");
const zone_text = document.querySelector(".zone-text ");
function handleFile(file) {
  const formData = new FormData();
  footer.style.display = "none";
  overrideup.innerHTML = "";
  formData.append("file", file);

  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener("progress", (event) => {
    upload_area.style.pointerEvents = "none"; //disable uploads
    if (event.lengthComputable) {
      const progress = (event.loaded / event.total) * 100;
      overrideup.innerHTML = `<div style='text-align:center;position:absolute;left:50%;background-color:rgba(58, 58, 206, 0.9);transform:translateX(-50%);margin:10px auto;border-radius:7px;font-size:1.2em;color:white;width:75%'>File uploading : ${
        progress | 0
      }%</div>`;
    }
  });

  xhr.addEventListener("load", () => {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      drop_container.style.display = "none";
      zone_text.textContent = "File Uploaded";
      zone_text.style.background = "#198754";
      zone_text.style.borderRadius = "5px";

      overrideup.innerHTML = `<div style='width:100%;text-align:center;font-family:sans-serif;font-size:1.2em;margin-bottom:2vh'>Use or scan this code </div><div style="width:100%;text-align:center;font-size:3em">${
        data.key.substring(0, 3) + "-" + data.key.substring(3)
      } </div><div style='width:100%;text-align:center;'><canvas id='qr'></canvas></div>`;
      (function () {
        let qr = new QRious({
          element: document.getElementById("qr"),
          value: `https://cloudsling.adaptable.app/download?key=${data.key}`,
        });
        qr.background = "#1c2951";
        // qr.backgroundAlpha = 0.8;
        qr.foreground = "#ffffff";
        qr.foregroundAlpha = 0.85;
        qr.level = "L";
        qr.size = 230;
        qr.value = `http://cloudsling.adaptable.app/download?key=${data.key}`;
      })();

      upload_area.style.pointerEvents = "";
    } else {
      // drop_container.style.display = "none";
      overrideup.innerHTML =
        "<div style='text-align:center;position:absolute;left:50%;transform:translateX(-50%);margin:10px auto;border-radius:7px;background-color:#d53939c8;font-size:1.2em;color:white;width:60%'>Server unreachable</div>";
      setTimeout(() => {
        overrideup.innerHTML = "";
        upload_area.style.pointerEvents = "";
      }, 3000);
    }
  });

  xhr.addEventListener("error", () => {
    // console.error("Error uploading file:", xhr.status);
    overrideup.innerHTML =
      "<div style='text-align:center;position:absolute;left:50%;transform:translateX(-50%);margin:10px auto;border-radius:7px;background-color:#d53939c8;font-size:1.2em;color:white;width:60%'>File upload failed</div>";
    setTimeout(() => {
      overrideup.innerHTML = "";
      upload_area.style.pointerEvents = "";
    }, 3000);
  });

  xhr.open("POST", "/upload");
  upload_area.style.border = "0px";
  download_area.style.display = "none";
  xhr.send(formData);
}
