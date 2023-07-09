const codeInput = document.getElementById("code");
codeInput.addEventListener("input", handleCodeInput);
function handleCodeInput() {
  const code = codeInput.value;
  if (code.length === 6) {
    document.querySelector(".or").style.display = "none";
    document.querySelector(".code-qr").style.display = "none";
    overridedown.innerHTML = "";
    downloadFile(code);
  }
}
async function downloadFile(key) {
  try {
    upload_area.style.display = "none";
    if (window.matchMedia("(max-width: 767px)").matches) {
      download_area.style.border = "0px";
      // download_area.style.marginTop = "5vh";
    }
    footer.style.display = "none";

    const response = await fetch(`/download?key=${key}`);
    if (response.ok) {
      console.log("Downloading");
      const dispositionHeader = response.headers.get("content-disposition");
      const filename = dispositionHeader
        ? dispositionHeader.match(/filename="(.+)"/)[1]
        : key;
      downloadWithProgress(response, filename);
    } else {
      overridedown.innerHTML = `<div style='text-align:center;position:absolute;left:50%;transform:translateX(-50%);margin:10px auto;border-radius:7px;background-color:#d53939c8;font-size:1.2em;color:white;width:50%'>Invalid Code</div>`;
      setTimeout(() => {
        overridedown.innerHTML = "";
      }, 4000);
    }
  } catch (error) {
    overridedown.innerHTML = `<div style='text-align:center;position:absolute;left:50%;transform:translateX(-50%);margin:10px auto;border-radius:7px;background-color:#d53939c8;font-size:1.2em;color:white;width:50%'>Server error</div>`;
    setTimeout(() => {
      overridedown.innerHTML = "";
    }, 4000);
    console.log("Server error " + error);
  }
}

async function downloadWithProgress(response, filename) {
  const contentLength = +response.headers.get("Content-Length");
  let downloaded = 0;

  const updateProgress = (downloaded) => {
    const progress = (downloaded / contentLength) * 100;
    overridedown.innerHTML = `<div style='text-align:center;position:absolute;left:50%;transform:translateX(-50%);margin:10px auto;border-radius:7px;background-color:rgba(58, 58, 206, 0.9);font-size:1.2em;color:white;width:50%'>Progress : ${
      progress | 0
    } %</div>`;
  };

  const responseStream = response.body;

  const reader = responseStream.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    downloaded += value.length;
    updateProgress(downloaded);
  }

  const blob = new Blob(chunks, { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
  overridedown.innerHTML = `<div style='text-align:center;position:absolute;left:50%;transform:translateX(-50%);margin:10px auto;border-radius:7px;background-color:#198754;font-size:1.2em;color:white;width:65%'>File received successfully !</div>`;
}
