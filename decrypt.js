async function deriveKey(username, password, salt) {
  const combined = `${username}::${password}`;
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(combined),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

function b64ToBytes(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

document.getElementById("unlockForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const errorMsg = document.getElementById("errorMsg");
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  errorMsg.textContent = "";

  if (!username || !password) {
    errorMsg.textContent = "Debes ingresar usuario y contraseña.";
    return;
  }

  try {
    const response = await fetch("panel.enc", { cache: "no-store" });
    const encryptedPayload = await response.json();

    const salt = b64ToBytes(encryptedPayload.salt);
    const iv = b64ToBytes(encryptedPayload.iv);
    const ciphertext = b64ToBytes(encryptedPayload.data);

    const key = await deriveKey(username, password, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const html = new TextDecoder().decode(decryptedBuffer);

    document.open();
    document.write(html);
    document.close();
  } catch (err) {
    errorMsg.textContent = "Usuario o contraseña incorrectos.";
  }
});